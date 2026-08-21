import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'marineradar-secret-key-2026';

/**
 * JWT Yetkilendirme Middleware'i
 * Authorization header'ından 'Bearer <token>' değerini okur, doğrular ve req.user nesnesini doldurur.
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Erişim engellendi: Lütfen geçerli bir JWT kimlik doğrulama tokenı sağlayın (Bearer token).'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).populate('assignedVessels');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız: Token sahibi kullanıcı veritabanında bulunamadı.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Geçersiz veya süresi dolmuş token: ${error.message}`
    });
  }
};
