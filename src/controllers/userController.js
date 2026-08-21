import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { seedFleetData } from '../data/seedFleet.js';

// GET /api/users -> Tüm kullanıcıları atanmış gemileri ile (populate) listeler
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('assignedVessels').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id -> ID değerine göre tek kullanıcıyı atanmış gemileri ile getirir
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan kullanıcı bulunamadı.`
      });
    }

    const user = await User.findById(id).populate('assignedVessels');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan kullanıcı bulunamadı.`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users -> Yeni kullanıcı ve gemi ataması oluşturur
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, assignedVessels } = req.body;

    const newUser = await User.create({
      name,
      email,
      password: password || 'password123',
      role: role || 'user',
      assignedVessels: assignedVessels || []
    });

    const populatedUser = await User.findById(newUser._id).populate('assignedVessels');

    res.status(201).json({
      success: true,
      message: 'Kullanıcı hesabı ve gemi yetkileri başarıyla oluşturuldu.',
      data: populatedUser
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/seed -> Örnek kullanıcı A (5 gemi) ve kullanıcı B (3 gemi) filolarını otomatik yükler
export const seedUsersAndFleet = async (req, res, next) => {
  try {
    const result = await seedFleetData();

    res.status(200).json({
      success: true,
      message: 'Örnek A Kullanıcısı (5 Gemi) ve B Kullanıcısı (3 Gemi) başarıyla veritabanına yüklendi.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/:id/vessels -> Kullanıcı filosuna yeni gemi ekler
export const assignVesselToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vesselId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(vesselId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz Kullanıcı veya Gemi ID formatı.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    if (!user.assignedVessels.includes(vesselId)) {
      user.assignedVessels.push(vesselId);
      await user.save();
    }

    const updatedUser = await User.findById(id).populate('assignedVessels');

    res.status(200).json({
      success: true,
      message: 'Gemi kullanıcı filosuna başarıyla eklendi.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id/vessels/:vesselId -> Kullanıcı filosundan gemi çıkarır
export const removeVesselFromUser = async (req, res, next) => {
  try {
    const { id, vesselId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(vesselId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz Kullanıcı veya Gemi ID formatı.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    user.assignedVessels = user.assignedVessels.filter(v => v.toString() !== vesselId.toString());
    await user.save();

    const updatedUser = await User.findById(id).populate('assignedVessels');

    res.status(200).json({
      success: true,
      message: 'Gemi kullanıcı filosundan çıkarıldı.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
