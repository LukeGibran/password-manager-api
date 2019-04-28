const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcome = (email, name) => {
  sgMail.send({
    to: email,
    from: 'lexzstulawie@gmail.com',
    subject: 'Welcome Email from My Password',
    text: `Welcome to the app ${name}!!!`
  });
};

const sendGoodbye = (email, name) => {
  sgMail.send({
    to: email,
    from: 'lexzstulawie@gmail.com',
    subject: 'Goodbye!',
    text: `We are sad seeing you go ${name}`
  });
};

module.exports = {
  sendWelcome,
  sendGoodbye
};
