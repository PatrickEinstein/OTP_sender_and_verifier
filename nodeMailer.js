import nodemailer from "nodemailer";


//I am making this component reuseable by making it take 3 customizable arguments
const mailer = (mail,subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "patoctave99@gmail.com",
      pass: "kjksxvvyxtoldilv",
    },
  });


  const mailOptions = {
    from: "patoctave99@gmail.com",
    to: mail,
    subject: subject,
    text: text,
  };

  transporter
    .sendMail(mailOptions)
    .then(
      () => console.log("mail sent successfully"),
      )
    .catch((error) => console.log(error));
};

export default mailer;