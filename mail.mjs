import 'dotenv/config'
import nodemailer from 'nodemailer'

// Nodemailer configuration
// const transporter = nodemailer.createTransport({
//     service: "Outlook365",
// //   port: 587, //465, //outgoing port 
// //   secure: true, // use false for STARTTLS; true for SSL on port 465
//   auth: {
//     user: process.env.NODEMAILER_EMAIL,
//     pass: process.env.NODEMAILER_PASS,
//   },
//   tls: {
//             ciphers:'SSLv3'
//         }
// });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "riotvtm@gmail.com",
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
    tls: {
        ciphers:'SSLv3'
    }
  });

try {
   
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: 'bcumbie@una.edu',
      subject: 'CIS 486 ',
      text: 'Hi Barry.'
    };

    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Email sent:', info.response)
      }
    });
 
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).send("Internal Server Error");
  } 
