const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../model/user');

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
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
    res.status(500).send(error);
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

module.exports = router;
