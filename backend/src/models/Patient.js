const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  unique_patient_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  bloodGroup: { type: String },
  contact: { type: String },
  emergencyContact: { type: String },
  address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
