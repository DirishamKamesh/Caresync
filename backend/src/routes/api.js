const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes (optional, adjust per route if needed)
router.use(verifyFirebaseToken);

// =======================
// PATIENTS
// =======================
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================
// DOCTORS
// =======================
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================
// APPOINTMENTS
// =======================
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date_time: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================
// PRESCRIPTIONS
// =======================
router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/prescriptions', async (req, res) => {
  try {
    const rx = await Prescription.create(req.body);
    res.json({ success: true, data: rx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================
// ME (Auth user info)
// =======================
router.get('/auth/me', async (req, res) => {
  // req.user is set by verifyFirebaseToken
  res.json({ success: true, data: req.user });
});

module.exports = router;
