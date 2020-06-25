import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";

const sendMail = (email) => {
  const options = {
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENGRID_PASSWORD
    }
  };
  const client = nodemailer.createTransport(sgTransport(options));
  return client.sendMail(email);
};

export const sendVerificationMail = (adress, key) => {
  const email = {
    from: "Hoony@hobby.com",
    to: adress,
    subject: "complete sign up!",
    html: `Hello! please click here${key} to complete sign up !`
  };
  return sendMail(email);
};
