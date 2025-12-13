// models/ActivityLog.js
const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
    user: { type: String } 
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
