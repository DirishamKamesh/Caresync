const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialisation: { type: String, required: true },
  licenseNumber: { type: String },
  contact: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
