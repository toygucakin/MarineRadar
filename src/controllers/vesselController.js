import { Vessel } from '../models/Vessel.js';
import mongoose from 'mongoose';

// GET /api/vessels -> Tüm gemileri listeler
export const getAllVessels = async (req, res, next) => {
  try {
    const vessels = await Vessel.find().sort({ vesselName: 1 });

    res.status(200).json({
      success: true,
      count: vessels.length,
      data: vessels
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/vessels/:id -> ID değerine göre tek bir gemiyi getirir
export const getVesselById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan gemi bulunamadı.`
      });
    }

    const vessel = await Vessel.findById(id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan gemi bulunamadı.`
      });
    }

    res.status(200).json({
      success: true,
      data: vessel
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/vessels -> Yeni gemi ekler
export const createVessel = async (req, res, next) => {
  try {
    const { vesselName, imoNumber, mmsi, callSign, flag, vesselType, grossTonnage, ownerCompany } = req.body;

    const newVessel = await Vessel.create({
      vesselName,
      imoNumber,
      mmsi,
      callSign,
      flag,
      vesselType,
      grossTonnage,
      ownerCompany
    });

    res.status(201).json({
      success: true,
      message: 'Yeni gemi başarıyla filoya eklendi.',
      data: newVessel
    });
  } catch (error) {
    next(error);
  }
};
