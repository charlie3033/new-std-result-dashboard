// server/routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET /api/courses?department=CSE&semester=1
router.get("/", async (req, res) => {
  try {
    const { department, semester } = req.query;
    if (!department || !semester) {
      return res.status(400).json({ error: "department and semester are required query params" });
    }
    const courses = await Course.find({ department, semester: Number(semester) }).sort({ semester: 1, code: 1 });
    res.json(courses || []);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/", async (req, res) => {
  try {    
    const { code, name, department, semester } = req.body; 
    if (!code || !name || !department || !semester) {
      return res.status(400).json({ error: "code, name, department, and semester are required" });
    }
    const existing = await Course.findOne({
      code,
      department,
      semester: Number(semester)
    });
    if (existing) {
      return res.status(400).json({ error: "Course already exists for this semester" });
    }

    const newCourse = new Course({ code, name, department, semester: Number(semester) });
      await newCourse.save();
      res.status(201).json(newCourse);
    } catch (err) {
      console.error("Error adding course:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
});

router.get("/department/:deptCode", async (req, res) => {
  try {
    const courses = await Course.find({ department: req.params.deptCode }).sort({ semester: 1, code: 1 });
    res.json(courses || []);
  } catch (err) {
    console.error("Error fetching department courses:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id; 
    const updatedData = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(updatedCourse);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", async (req, res)=>{
  try{
    const courses = await Course.find();
    res.json(courses || []);
  }catch(err){
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post('/bulk',async (req, res) => {
  try {
    const courses = req.body
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ error: "courses must be a non-empty array" });
    }
    await Course.insertMany(courses);
    res.status(201).json({ message: "Courses added successfully" });
  }catch(err){
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;
