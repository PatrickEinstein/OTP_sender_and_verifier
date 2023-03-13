import express from "express";
import {User} from "../models/User.js";
import {UserOTPVerification} from "../models/UserOTPVerification.js";
import mailer from "../../nodeMailer.js";

//Password Handler
import bcrypt from "bcrypt";

//SIGNING UP
export const Signup = async (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });

    //This is were the issues is and you would retype it again
  } else {
    User.find({ email }).then((result) => {
      if (result.length) {
        res.json({
          status: "FAILED",
          message: "User with the provided email already",
        });
      } else {
        const saltRounds = 10;
        bcrypt
          .hash(password, saltRounds)
          .then((hashedPassword) => {
            const newUser = new User({
              email,
              password: hashedPassword,
              verified: false,
            });
            newUser
              .save()
              .then((result) => {
                sendOTPVerificationEmail(result, res);
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "FAILED",
                  message: "An error occured while saving user account",
                });
              });
          })
          .catch((err) => {
            res.json({
              status: "FAILED",
              message: "An error occured while hashing password",
            });
          });
      }
    });
  }
};

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    // mail options
  
      
    const mail = email;
    const subject = "Verify your email";
      
    const text = `Enter ${otp}in the app to verify your email address and complete the authenticationThis code expires in 1 hour`
    
    
   

    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = await new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000,
    });
    console.log(newOTPVerification)
    await newOTPVerification.save();
    mailer(mail, subject, text)
    res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

//VERIFY OTP
export const verify = async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId,
      });
      if (UserOTPVerificationRecords.length <= 0) {
        throw new Error(
          "Account record doesnt exist or has been verified already. PLease sign up or log in"
        );
      } else {
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteMany({ userId });
          throw new Error("Code has expired. PLease request again");
        } else {
          const validOTP = bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            throw new Error("Invalid code passed. Check your inbox");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await UserOTPVerification.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User email verified successfully",
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

//RESEND OTP
export const resend = async (req, res) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error(" Empty user details are not allowed");
    } else {
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};
