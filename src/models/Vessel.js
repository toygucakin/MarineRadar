import mongoose from 'mongoose';

/**
 * Gemi (Vessel) Mongoose Şeması
 * IMO Numarası, Gemi Adı, MMSI, Çağrı İşareti, Bayrak ve Gemi Tipi bilgilerini saklar.
 */
const vesselSchema = new mongoose.Schema({
  vesselName: {
    type: String,
    required: [true, 'Gemi adı zorunludur.'],
    trim: true,
    minlength: [2, 'Gemi adı en az 2 karakter olmalıdır.']
  },
  imoNumber: {
    type: String,
    required: [true, 'IMO numarası zorunludur.'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // IMO 7 haneli rakam kalıbını veya 'IMO 1234567' formatını doğrula
        return /^(IMO\s?)?\d{7}$/i.test(v);
      },
      message: props => `${props.value} geçerli bir IMO numarası formatı değil! (Örn: 9876543 veya IMO 9876543)`
    }
  },
  mmsi: {
    type: String,
    trim: true
  },
  callSign: {
    type: String,
    trim: true
  },
  flag: {
    type: String,
    default: 'Bilinmiyor',
    trim: true
  },
  vesselType: {
    type: String,
    enum: [
      'Container Ship',
      'Bulk Carrier',
      'Tanker',
      'General Cargo',
      'Tugboat',
      'LNG Carrier',
      'Dredger',
      'Ro-Ro',
      'Diğer'
    ],
    default: 'Diğer'
  },
  grossTonnage: {
    type: Number,
    min: [0, 'Gros tonaj 0\'dan küçük olamaz.']
  },
  ownerCompany: {
    type: String,
    default: 'Bilinmeyen Armatör',
    trim: true
  }
}, {
  timestamps: true
});

// JSON dönüşümlerinde '_id' -> 'id' dönüşümü ve '__v' gizleme
vesselSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Vessel = mongoose.model('Vessel', vesselSchema);
