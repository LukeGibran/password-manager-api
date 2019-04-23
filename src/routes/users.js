const express = require('express');
const router = new express.Router();
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

module.exports = router;
