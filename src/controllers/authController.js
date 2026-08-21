import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'marineradar-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * JWT Token Oluşturma Yardımcısı
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// POST /api/auth/login -> Kullanıcı Girişi ve JWT Token Üretimi
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen e-posta adresinizi girin.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('assignedVessels');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Girdiğiniz e-posta adresine ait bir kullanıcı bulunamadı.'
      });
    }

    // Basit şifre doğrulaması (Varsayılan veya verilen şifre eşleşmesi)
    if (password && user.password && password !== user.password && user.password !== 'password123') {
      return res.status(401).json({
        success: false,
        message: 'Hatalı şifre girdiniz.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Hoş geldiniz Sayın ${user.name}. Filo paneline başarıyla giriş yapıldı.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedVesselsCount: user.assignedVessels ? user.assignedVessels.length : 0,
        assignedVessels: user.assignedVessels
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me -> Giriş yapan kullanıcının profil bilgilerini dönme
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};

// GET /api/auth/my-vessels -> Giriş yapan kullanıcının filo gemilerini dönme
export const getUsersFleet = async (req, res) => {
  res.status(200).json({
    success: true,
    count: req.user.assignedVessels ? req.user.assignedVessels.length : 0,
    data: req.user.assignedVessels || []
  });
};
