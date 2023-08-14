const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.fristName = user.name.split(' ')[0];
    this.from = `Abood Magdy <${process.env.EMAIL_FROM}>`;
    this.url = url; //url for the page to reset of change password like this
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    //in development we use mailTrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //send the actula email and make it easy because template and subject can be changed in different situations
  async send(template, subject) {
    // 1)run the html based on a pug template(make the same functionality of res.render(    ))
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        fristName: this.fristName,
        url: this.url,
        subject,
      }
    );
    // 2)define email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
      //html
    };
    // 3)create a transporter and send the email
    await this.newTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Werlcome to Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes'
    );
  }
};
