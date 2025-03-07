import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: "Gmail",
  auth: {
    user: "mostafawaseem22@gmail.com",  // Your Gmail address
    pass: "twap hqpb rbrj bcdp",  // Your Gmail app-specific password
  },
});

const sendEmail = (fromEmail,toEmail, subject, message) => {
  const mailOptions = {
    from: "fromEmail@gmail.com",  // Your Gmail address
    to: toEmail,                   // Recipient's email address
    subject: subject,              // Subject of the email
    html: message,                 // Email body text
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


export default sendEmail;
