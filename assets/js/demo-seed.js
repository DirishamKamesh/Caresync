/**
 * CareSync — Demo Seed Data
 * Populates localStorage on first run. Includes reset capability.
 */

const SEED_DATA = {
  users: [
    { id: 'u1', username: 'admin',      password: 'admin123',   role: 'Admin',   linkedProfileId: null },
    { id: 'u2', username: 'dr.smith',   password: 'doctor123',  role: 'Doctor',  linkedProfileId: 'd1' },
    { id: 'u3', username: 'dr.patel',   password: 'doctor123',  role: 'Doctor',  linkedProfileId: 'd2' },
    { id: 'u4', username: 'dr.chen',    password: 'doctor123',  role: 'Doctor',  linkedProfileId: 'd3' },
    { id: 'u5', username: 'john.doe',   password: 'patient123', role: 'Patient', linkedProfileId: 'p1' },
    { id: 'u6', username: 'jane.doe',   password: 'patient123', role: 'Patient', linkedProfileId: 'p2' },
    { id: 'u7', username: 'bob.jones',  password: 'patient123', role: 'Patient', linkedProfileId: 'p3' },
  ],
  doctors: [
    { id: 'd1', name: 'Dr. James Smith',   specialisation: 'Cardiology',      qualification: 'MD, FACC',  licenseNumber: 'MED-001', contact: '+1-555-0101' },
    { id: 'd2', name: 'Dr. Priya Patel',   specialisation: 'Neurology',       qualification: 'MD, PhD',   licenseNumber: 'MED-002', contact: '+1-555-0102' },
    { id: 'd3', name: 'Dr. Sarah Chen',    specialisation: 'General Surgery',  qualification: 'MBBS, MS',  licenseNumber: 'MED-003', contact: '+1-555-0103' },
  ],
  patients: [
    { id: 'p1', unique_patient_id: `HOSP-${new Date().getFullYear()}-0001`, name: 'John Doe',      age: 34, gender: 'Male',   contact: '+1-555-2001', address: '123 Maple St, Springfield', bloodGroup: 'O+',  emergencyContact: '+1-555-9001' },
    { id: 'p2', unique_patient_id: `HOSP-${new Date().getFullYear()}-0002`, name: 'Jane Doe',      age: 29, gender: 'Female', contact: '+1-555-2002', address: '456 Oak Ave, Shelbyville',  bloodGroup: 'A+',  emergencyContact: '+1-555-9002' },
    { id: 'p3', unique_patient_id: `HOSP-${new Date().getFullYear()}-0003`, name: 'Robert Jones',  age: 52, gender: 'Male',   contact: '+1-555-2003', address: '789 Pine Rd, Ogdenville',   bloodGroup: 'B-',  emergencyContact: '+1-555-9003' },
    { id: 'p4', unique_patient_id: `HOSP-${new Date().getFullYear()}-0004`, name: 'Emily Clark',   age: 41, gender: 'Female', contact: '+1-555-2004', address: '321 Birch Ln, Capital City', bloodGroup: 'AB+', emergencyContact: '+1-555-9004' },
    { id: 'p5', unique_patient_id: `HOSP-${new Date().getFullYear()}-0005`, name: 'Michael Brown', age: 67, gender: 'Male',   contact: '+1-555-2005', address: '654 Cedar Dr, Brockway',    bloodGroup: 'O-',  emergencyContact: '+1-555-9005' },
  ],

  getAppointments() {
    const now = new Date();
    const d = (offsetDays, h, m) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() + offsetDays);
      dt.setHours(h, m, 0, 0);
      return dt.toISOString();
    };
    return [
      { id: 'a1',  patient_id: 'p1', doctor_id: 'd1', date_time: d(-5,  9, 0),  status: 'Completed', reason: 'Annual cardiac check-up',          created_at: d(-6, 10, 0) },
      { id: 'a2',  patient_id: 'p2', doctor_id: 'd2', date_time: d(-3, 10, 30), status: 'Completed', reason: 'Headaches and dizziness',           created_at: d(-4, 8,  0) },
      { id: 'a3',  patient_id: 'p3', doctor_id: 'd1', date_time: d(-2, 14, 0),  status: 'Completed', reason: 'Chest pain follow-up',              created_at: d(-3, 9,  0) },
      { id: 'a4',  patient_id: 'p4', doctor_id: 'd3', date_time: d(-1, 11, 0),  status: 'Approved',  reason: 'Post-operative consultation',       created_at: d(-2, 8,  0) },
      { id: 'a5',  patient_id: 'p5', doctor_id: 'd2', date_time: d(-1, 15, 30), status: 'Rejected',  reason: 'Recurring migraines',               created_at: d(-2, 7,  0) },
      { id: 'a6',  patient_id: 'p1', doctor_id: 'd3', date_time: d(0,  9, 30),  status: 'Approved',  reason: 'Routine blood pressure monitoring',  created_at: d(-1, 12, 0) },
      { id: 'a7',  patient_id: 'p2', doctor_id: 'd1', date_time: d(0, 11, 0),   status: 'Pending',   reason: 'Irregular heartbeat symptoms',      created_at: d(0,  7,  0) },
      { id: 'a8',  patient_id: 'p3', doctor_id: 'd3', date_time: d(1, 14, 0),   status: 'Pending',   reason: 'Elective surgery consultation',     created_at: d(0,  8,  0) },
      { id: 'a9',  patient_id: 'p4', doctor_id: 'd2', date_time: d(2, 10, 0),   status: 'Pending',   reason: 'Follow-up after MRI results',       created_at: d(0,  9,  0) },
      { id: 'a10', patient_id: 'p5', doctor_id: 'd1', date_time: d(3, 16, 0),   status: 'Pending',   reason: 'Cardiac stress test',               created_at: d(0, 10,  0) },
    ];
  },

  getPrescriptions() {
    const now = new Date();
    const d = (offsetDays) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() + offsetDays);
      return dt.toISOString();
    };
    return [
      {
        id: 'rx1',
        patient_id: 'p1', doctor_id: 'd1', appointment_id: 'a1',
        diagnosis: 'Hypertension Stage 1',
        medicines: 'Lisinopril 10mg – 1 tablet daily (morning)\nAmlodipine 5mg – 1 tablet daily (evening)',
        notes: 'Monitor BP daily. Low-sodium diet. Follow-up in 4 weeks.',
        created_at: d(-5)
      },
      {
        id: 'rx2',
        patient_id: 'p2', doctor_id: 'd2', appointment_id: 'a2',
        diagnosis: 'Tension Headache / Migraine Prophylaxis',
        medicines: 'Propranolol 40mg – 1 tablet twice daily\nIbuprofen 400mg – as needed (max 3/day)',
        notes: 'Keep a headache diary. Avoid bright screens. Return if symptoms worsen.',
        created_at: d(-3)
      },
      {
        id: 'rx3',
        patient_id: 'p3', doctor_id: 'd1', appointment_id: 'a3',
        diagnosis: 'Stable Angina',
        medicines: 'Aspirin 81mg – 1 tablet daily\nNitroglycerine 0.4mg – sublingual as needed',
        notes: 'Carry nitroglycerine at all times. No heavy exertion. Cardiac diet.',
        created_at: d(-2)
      },
      {
        id: 'rx4',
        patient_id: 'p4', doctor_id: 'd3', appointment_id: 'a4',
        diagnosis: 'Post-Appendectomy Care',
        medicines: 'Amoxicillin 500mg – 1 capsule three times daily for 7 days\nParacetamol 500mg – every 6 hours as needed for pain',
        notes: 'Keep wound clean and dry. Return to clinic if fever > 38.5°C.',
        created_at: d(-1)
      },
      {
        id: 'rx5',
        patient_id: 'p1', doctor_id: 'd3', appointment_id: 'a6',
        diagnosis: 'Elevated Blood Pressure (follow-up)',
        medicines: 'Lisinopril 20mg – dose increased\nHydrochlorothiazide 12.5mg – 1 tablet daily',
        notes: 'Salt restriction < 2g/day. 30 min walking daily. Re-check in 2 weeks.',
        created_at: d(0)
      },
    ];
  }
};

/* ============================================================
   SEED RUNNER
   ============================================================ */
function seedDemoData(force = false) {
  const alreadySeeded = localStorage.getItem('hms_seeded');
  if (alreadySeeded && !force) return;

  Store.set(KEYS.USERS,         SEED_DATA.users);
  Store.set(KEYS.DOCTORS,       SEED_DATA.doctors);
  Store.set(KEYS.PATIENTS,      SEED_DATA.patients);
  Store.set(KEYS.APPOINTMENTS,  SEED_DATA.getAppointments());
  Store.set(KEYS.PRESCRIPTIONS, SEED_DATA.getPrescriptions());
  Store.set(KEYS.AUDIT_LOGS,    [
    { id: 'log1', actor_role: 'Admin',  actor_username: 'admin',    action: 'PATIENT_CREATED',       entity_type: 'Patient',     entity_id: 'p1',  details: 'John Doe registered',          timestamp: new Date(Date.now()-86400000*3).toISOString() },
    { id: 'log2', actor_role: 'Doctor', actor_username: 'dr.smith', action: 'APPOINTMENT_COMPLETED', entity_type: 'Appointment', entity_id: 'a1',  details: 'Cardiac check-up completed',   timestamp: new Date(Date.now()-86400000*2).toISOString() },
    { id: 'log3', actor_role: 'Doctor', actor_username: 'dr.patel', action: 'APPOINTMENT_REJECTED',  entity_type: 'Appointment', entity_id: 'a5',  details: 'Slot conflict',                timestamp: new Date(Date.now()-86400000).toISOString()   },
    { id: 'log4', actor_role: 'Doctor', actor_username: 'dr.smith', action: 'PRESCRIPTION_CREATED',  entity_type: 'Prescription',entity_id: 'rx1', details: 'Hypertension treatment plan',   timestamp: new Date(Date.now()-86400000*2).toISOString() },
    { id: 'log5', actor_role: 'Admin',  actor_username: 'admin',    action: 'DOCTOR_ADDED',          entity_type: 'Doctor',      entity_id: 'd3',  details: 'Dr. Sarah Chen onboarded',     timestamp: new Date(Date.now()-86400000*5).toISOString() },
  ]);

  localStorage.setItem('hms_seeded', '1');
  console.log('[CareSync] ✓ Demo data seeded');
}

function resetDemoData() {
  // Clear all HMS keys
  Object.values(KEYS).forEach(k => { if (k !== KEYS.SESSION) localStorage.removeItem(k); });
  localStorage.removeItem('hms_seeded');
  // Re-seed
  seedDemoData(true);
  showToast('Demo data has been reset successfully!', 'success');
}

// Auto-seed on first load
if (window.Store) {
  seedDemoData();
} else {
  document.addEventListener('DOMContentLoaded', () => seedDemoData());
}

window.seedDemoData = seedDemoData;
window.resetDemoData = resetDemoData;
window.SEED_DATA = SEED_DATA;
