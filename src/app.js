const express = require('express');
require('./db/mongoose');
const userRouter = require('./routes/users');
const pwRouter = require('./routes/passwords');

const app = new express();

app.use(express.json());
app.use(userRouter);
app.use(pwRouter);

module.exports = app;
