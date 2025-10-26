const express= require('express');
const router = express.Router();
const pendingGrades = require('../models/PendingGrades');

router.get("/", async (req, res) => {
  try {
    const pendingStudents = await pendingGrades.find().select("name department semester studentId");
    const totalPending = pendingStudents.length;
    res.json({ totalPending, students: pendingStudents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;