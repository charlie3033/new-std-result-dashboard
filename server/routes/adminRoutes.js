const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const authAdmin = require("../middleware/authAdmin"); // middleware
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});



const router = express.Router();
// let otpStore = {};

// Protected route: Dashboard
router.get("/dashboard", authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.json({ msg: "Welcome Admin!", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Admin
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ msg: "Username already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password : hashed, email });
    await newAdmin.save();

    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS ? "PASS OK" : "NO PASS");

    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    if (!admin.email) {
      console.error("Admin has no email:", admin);
      return res.status(500).json({ msg: "Admin email missing" });
    }

    const existing = admin.otpExpiresAt ? { expiresAt: new Date(admin.otpExpiresAt) } : null;
    if (existing && Date.now() < existing.expiresAt - 4 * 60 * 1000) {
      return res.json({ email: admin.email }); // don't resend new OTP
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    admin.otp = otp.toString();
    admin.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await admin.save();
    
    if(process.env.EMAIL_PASS == null || process.env.EMAIL_PASS === "" || process.env.EMAIL_PASS === "undefined"){
      try{
        await sgMail.send({
        to: admin.email,
        from: `Admin Panel <${process.env.EMAIL_USER}>`,
        subject: "Your Login OTP",
        text: `Your OTP is: ${otp}`
      });
      }catch(mailerr){
        return res.status(500).json({ msg: "Failed to send OTP" });
      }
    }else{
      try{
        await transporter.sendMail({
          from: `"Admin App" <${process.env.EMAIL_USER}>`,
          to: admin.email,
          subject: "Your Login OTP",
          text: `Your OTP is: ${otp}`
        });
      }catch(mailerr){
        return res.status(500).json({ msg: "Failed to send OTP" });
      }
    }
    
    const [name, domain] = admin.email.split("@");
    const visible= name.length > 3 ? name.slice(0,3) : name.slice(0,1);
    const maskedEmail = visible + '****@' + domain;
    console.log("OTP sent to:", admin.email);
    res.json({
      email: admin.email,
      maskemail: maskedEmail   
    });    
  } catch (err) {
    console.error("Login Error:",err);    
    return res.status(500).json({ error: err.message });
  }
});

//resend OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;    
    
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    if(admin.otpExpiresAt){
      const issuedAt = new Date(admin.otpExpiresAt).getTime() - 5 * 60 * 1000;
      if (Date.now() - issuedAt < 30 * 1000) {
        return res.status(429).json({ msg: "Please wait before requesting another OTP" });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000);    

    admin.otp = otp.toString();
    admin.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await admin.save();    

    if(process.env.EMAIL_PASS == null || process.env.EMAIL_PASS === "" || process.env.EMAIL_PASS === "undefined"){
      try{
        await sgMail.send({
          to: email,
          from: `Admin Panel <${process.env.EMAIL_USER}>`,
          subject: "Your New OTP",
          text: `Your OTP is: ${otp}`
        });
      }catch(mailerr){
        return res.status(500).json({ msg: "Failed to send OTP" });
      }
    }else{
      try{
      await transporter.sendMail({
        from: `"Admin App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your New OTP",
        text: `Your OTP is: ${otp}`
      });
    }catch(mailerr){
      return res.status(500).json({ msg: "Failed to send OTP" });
    }
    }


    res.json({ msg: "OTP resent" });

  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
  
    const admin = await Admin.findOne({ email });
    if (!admin || !admin.otp) {
      return res.status(400).json({ msg: "OTP expired. Login again." });
    }

    if (new Date() > admin.otpExpiresAt) {
      admin.otp = null;
      admin.otpExpiresAt = null;
      await admin.save();
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (admin.otp !== otp.toString()) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // success
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    res.json({ token });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
