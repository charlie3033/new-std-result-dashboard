// server/models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: String,
    code: String, // CSE, ECE
    head: String // Head of Department
});

module.exports = mongoose.model("Department", departmentSchema);
