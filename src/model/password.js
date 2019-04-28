const validator = require('validator');
const mongoose = require('mongoose');
const crypto = require('crypto-js');
const passwordSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error('Invalid Email address!');
        }
      }
    },
    login: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: true,
      validate(val) {
        if (val.length < 8) {
          throw new Error('Password must be greater than 8 char');
        }
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    }
  },
  {
    timestamps: true
  }
);

passwordSchema.pre('save', function(next) {
  const pw = this;
  if (pw.isModified('password')) {
    pw.password = crypto.AES.encrypt(pw.password, process.env.CIPHER_TEXT);
  }

  next();
});

const Password = mongoose.model('password', passwordSchema);

module.exports = Password;
