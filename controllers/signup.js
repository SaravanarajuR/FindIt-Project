const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");
const resetOtp = require("../controllers/otp");

const get = function (req, res) {
  const m = req.flash("message");

  function generateCaptcha() {
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      let textcase = Math.round(Math.random()) ? 65 : 97;
      captcha += String.fromCharCode(Math.floor(Math.random() * 25) + textcase);
    }
    return captcha;
  }

  res.render("login", { m, captcha: generateCaptcha() });
};

const post = (req, res) => {
  if (req.body.pass != req.body.cpass) {
    req.flash("message", [req.body.mail, "Password do not match"]);
    res.redirect("/signup");
  } else {
    User.find({
      email: req.body.mail,
    }).then(async function (fo) {
      if (fo.length === 0) {
        const hashedPass = await bcrypt.hash(req.body.cpass, 12);
        const data = new User({
          email: req.body.mail,
          password: hashedPass,
          verified: "FALSE",
        });
        const createdOtp = Math.floor(1000 + Math.random() * 9999);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "testmailplm00@gmail.com",
            pass: process.env.mailpass,
          },
        });

        let info = transporter.sendMail({
          from: "FindIt@gmail.com",
          to: req.body.mail,
          subject: "FindIt Registration",
          html: `<h1> ${createdOtp} is your OTP for registering</h1><h4>Please do not share</h4>`,
        });
        Otp.find({
          mail: req.body.mail,
        }).then((foundOtp) => {
          if (foundOtp.length === 0) {
            const ver = new Otp({
              mail: req.body.mail,
              otp: createdOtp,
              created: Date.now(),
            });
            ver.save();
            data.save();
            req.flash("m", [req.body.mail, ""]);
            res.redirect("/verify");
          } else {
            resetOtp(req.body.mail, createdOtp);
          }
        });
      } else {
        req.flash("message", [
          req.body.mail,
          req.body.mail,
          "Mail already exists",
        ]);
        res.redirect("/signup");
      }
    });
  }
};

module.exports = { get, post };
