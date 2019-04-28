const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Password = require('../model/password');

router.post('/passwords', auth, async (req, res) => {
  const pw = new Password({ ...req.body, owner: req.user._id });

  try {
    await pw.save();
    res.status(201).send(pw);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/passwords', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.match) {
    match.domain = req.query.domain;
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
  }

  try {
    await req.user
      .populate({
        path: 'password',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();

    res.send(req.user.password);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/passwords/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const pw = await Password.findOne({ _id, owner: req.user._id });
    if (!pw) {
      return res.status(404).send();
    }

    res.send(pw);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/passwords/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const updateLists = ['domain', 'email', 'password'];
  const _id = req.params.id;
  const isAllowed = updates.every(update => updateLists.includes(update));

  if (!isAllowed) {
    res.status(404).send({ error: 'Invalid updates!' });
  }

  try {
    const pw = await Password.findOne({ _id, owner: req.user._id });
    if (!pw) {
      return res.status(404).send({ error: 'No tasks found' });
    }
    updates.forEach(update => (pw[update] = req.body[update]));
    await pw.save();

    res.send(pw);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/passwords/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const pw = await Password.findOneAndDelete({ _id, owner: req.user._id });

    if (!pw) {
      return res.status(404).send({ error: 'No password found!' });
    }

    res.send(pw);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
