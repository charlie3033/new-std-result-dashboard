const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Student = require("../models/Student");

const router = express.Router();
let otpStore = {};

router.post("/send-otp", (req, res) => {
  try{
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    let transporter = nodemailer.createTransport({
      service:"gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    transporter.sendMail({
      from: "App",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP Code is: ${otp}`
    });

    res.json({ sent: true});
  }catch(err){
    res.status(500).json({ error: "Server error", details: err.message });
  }  
});

router.post("/verify-otp", (req,res) => {
  try{
    const {email, otp} = req.body;
    res.json({ valid: otpStore[email] == otp});
  }catch(err){
    res.status(500).json({ error: "Server error", details: err.message });
  }  
});

router.post("/reset-password", async (req,res) => {
  try{
    const {email, password} = req.body;
    const updated = await Student.findOneAndUpdate(
      { email : email},
      { password: await bcrypt.hash(rawPassword, 10)},
      { new: true}
    );
    if (!updated) return res.status(404).json({ error: "Student not found" });
    delete otpStore[email];
    res.json({ message:"Password Updated", student: updated, done: true});
  }catch(err){
    res.status(500).json({ error: "Server error", details: err.message });
  }  
});

module.exports = router;