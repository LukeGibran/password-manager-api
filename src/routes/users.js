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
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
