import mongoose from 'mongoose';

/**
 * MongoDB Veritabanı Bağlantı Yöneticisi
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marineradar');
    console.log(`🍃 MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};
