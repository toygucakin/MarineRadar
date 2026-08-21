import mongoose from 'mongoose';

/**
 * Kullanıcı ve Filo Yetkilendirme (User / Fleet) Mongoose Şeması
 * Kullanıcı hesabı bilgilerini ve kullanıcıya atanmış gemilerin (assignedVessels) ilişkisini saklar.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kullanıcı adı ve soyadı zorunludur.'],
    trim: true,
    minlength: [2, 'Ad soyad en az 2 karakter olmalıdır.']
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi zorunludur.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} geçerli bir e-posta adresi değil!`
    }
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur.'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
    select: false // Varsayılan sorgularda şifrenin dönmesini engeller
  },
  role: {
    type: String,
    enum: ['admin', 'armator', 'operator', 'user'],
    default: 'user'
  },
  assignedVessels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vessel'
    }
  ]
}, {
  timestamps: true
});

// JSON dönüşümlerinde '_id' -> 'id' dönüşümü ve '__v' gizleme
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
