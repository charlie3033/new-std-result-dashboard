const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Department = require("../models/Department");
const Course = require("../models/Course");

// GET /api/departments - Fetch unique departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });

    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newDepartment = new Department(req.body);
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:deptCode", async (req, res) => {
  try {
    const deptCode = req.params.deptCode;
    console.log("Attempting to delete department:", deptCode);
    const students = await Student.countDocuments({ department: deptCode });
    console.log(`Students in department ${deptCode}:`, students);
    const courses = await Course.countDocuments({ department: deptCode });
    console.log("Courses found:", courses);
    if (students > 0) {
      return res.status(400).json({ error: "Department has students assigned" });
    }
    // delete courses first
    await Course.deleteMany({ 
      department: { $regex: new RegExp(`^${deptCode}$`, "i") }
    });

    // delete department
    const deleted = await Department.findOneAndDelete({
      code: { $regex: new RegExp(`^${deptCode}$`, "i") }
    });
    if (!deleted) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ message: "Department deleted successfully" });

  } catch (err) {
    console.error("Delete department error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
