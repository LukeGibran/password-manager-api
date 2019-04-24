const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true
    },
    lname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error('Invalid Email address!');
        }
      }
    },
    master_password: {
      type: String,
      required: true,
      trim: true,
      validate(val) {
        if (val.length < 8) {
          throw new Error('Master password must be atleast 8 char');
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    image: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.generateToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  user.save();
  return token;
};

userSchema.statics.authenticate = async function(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.master_password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('master_password')) {
    user.master_password = await bcrypt.hash(user.master_password, 8);
  }

  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
