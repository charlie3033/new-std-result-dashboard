const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const authAdmin = require("../middleware/authAdmin"); // middleware
const axios = require("axios");

const router = express.Router();

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
    const { username, password, phone } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ msg: "Username already exists" });

    const newAdmin = new Admin({ username, password, phone });
    await newAdmin.save();

    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    //otp
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // admin.otp = otp;
    // admin.otpExpiry = Date.now() + 10 * 60 * 1000;// 10 minutes
    // await admin.save();

    // //send otp to admin 
    // try{
    //   await axios.post("https://www.fast2sms.com/dev/bulkV2",
    //     {
    //       route: "otp",
    //       // message: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    //       variables_values: otp,
    //       numbers: admin.phone
    //     },
    //     {
    //       headers: {
    //         authorization: process.env.FAST2SMS_KEY,
    //         "Content-Type": "application/json"
    //       }
    //     }
    //   );          
    //   console.log("ADMIN OTP:", otp);

    res.json({
      // message:"otp sent",
      userId: admin._id,
      // number:  `+91-${admin.phone.slice(2,4)}****${admin.phone.slice(-4) }`
      phone: admin.phone.slice(-10)
    });
    // }
    // catch(err){
    //   console.error("Error sending OTP:", err.message);
    //   return res.status(500).json({ error: "Failed to send OTP" });
    // }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/otp-success", async (req, res) => {
  const { userId } = req.body;

  const token = jwt.sign({ id: userId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });

  res.json({ token });
});



module.exports = router;
