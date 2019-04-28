const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../model/user');
const { sendWelcome, sendGoodbye } = require('../mails/account');
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcome(user.email, user.fname);
    const token = await user.generateToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.authenticate(
      req.body.email,
      req.body.master_password
    );
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (error) {
    res.status(404).send({ error: 'Invalid login credentials!' });
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const updateLists = ['fname', 'lname', 'email', 'master_password'];

  const isAllowed = updates.every(update => updateLists.includes(update));

  if (!isAllowed) {
    res.status(404).send({ error: 'Invalid updates!' });
  }

  if (!req.user) {
    return res.status(404).send();
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    sendGoodbye(req.user.email, req.user.fname);
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

// File upload for profile picture
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File is not supported!'));
    }

    cb(undefined, true);
  }
});

router.post(
  '/users/me/image',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      if (!buffer) {
        return new Error('Please provide an image to upload!');
      }
      req.user.image = buffer;
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get('/users/me/image', auth, async (req, res) => {
  const _id = req.user._id;
  try {
    const user = await User.findById(_id);

    if (!user || !user.image) {
      throw new Error({ error: 'No image found' });
    }

    res.set('Content-type', 'image/png');
    res.send(user.image);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete('/users/me/image', auth, async (req, res) => {
  try {
    req.user.image = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
