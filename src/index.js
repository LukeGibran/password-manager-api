const app = require('./app');
const port = process.env.PORT;
// const crypto = require('crypto-js');
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// var ciphertext = crypto.AES.encrypt('my message', 'secret key 123');
// console.log(ciphertext.toString());
// var bytes = crypto.AES.decrypt(ciphertext.toString(), 'secret key 123');
// var plaintext = bytes.toString(crypto.enc.Utf8);

// console.log(plaintext);
