const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Patient'], required: true },
  linkedProfileId: { type: String, default: null }, // Maps to Patient or Doctor _id
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
