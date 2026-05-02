/**
 * CareSync — Doctor JS Module
 * Prescription creation modal + doctor-specific helpers
 */

function openPrescriptionModal(patientId, appointmentId) {
  const patients = Store.get(KEYS.PATIENTS);
  const user     = Auth.getSession();
  const doctors  = Store.get(KEYS.DOCTORS);
  const doctor   = doctors.find(d => d.id === user?.linkedProfileId);
  const patient  = patients.find(p => p.id === patientId);

  if (!patient) { showToast('Patient not found', 'error'); return; }

  const overlay = document.createElement('div');
  overlay.className = 'cs-modal-overlay';
  overlay.id = 'rx-modal';
  overlay.innerHTML = `
    <div class="cs-modal">
      <div class="cs-modal-header">
        <div>
          <h3 style="font-size:18px;font-weight:700">Create Prescription</h3>
          <p style="font-size:12px;color:#6e7977;margin-top:2px">Patient: ${escHtml(patient.name)} · ${escHtml(patient.unique_patient_id)}</p>
        </div>
        <button class="cs-btn-icon" onclick="document.getElementById('rx-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="cs-modal-body">
        <div style="margin-bottom:16px">
          <label class="cs-label" for="rx-diagnosis">Diagnosis *</label>
          <input class="cs-input" id="rx-diagnosis" placeholder="e.g. Hypertension Stage 1" required/>
        </div>
        <div style="margin-bottom:16px">
          <label class="cs-label" for="rx-medicines">Medicines *</label>
          <textarea class="cs-textarea" id="rx-medicines" placeholder="Lisinopril 10mg – 1 tablet daily&#10;Amlodipine 5mg – 1 tablet daily" style="min-height:100px" required></textarea>
          <p style="font-size:11px;color:#6e7977;margin-top:4px">One medicine per line</p>
        </div>
        <div>
          <label class="cs-label" for="rx-notes">Notes / Instructions</label>
          <textarea class="cs-textarea" id="rx-notes" placeholder="Low-sodium diet. Follow up in 4 weeks."></textarea>
        </div>
        <div id="rx-error" style="display:none;margin-top:12px;padding:10px;background:#ffdad6;border-radius:8px;font-size:13px;color:#7f1d1d"></div>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn cs-btn-outline" onclick="document.getElementById('rx-modal').remove()">Cancel</button>
        <button class="cs-btn cs-btn-primary" id="save-rx-btn">
          <span class="material-symbols-outlined" style="font-size:18px">medication</span>
          Save Prescription
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  document.getElementById('save-rx-btn').addEventListener('click', () => {
    const diagnosis = document.getElementById('rx-diagnosis').value.trim();
    const medicines = document.getElementById('rx-medicines').value.trim();
    const notes     = document.getElementById('rx-notes').value.trim();
    const errEl     = document.getElementById('rx-error');

    if (!diagnosis || !medicines) {
      errEl.textContent = 'Diagnosis and Medicines are required.';
      errEl.style.display = 'block'; return;
    }

    const rxs = Store.get(KEYS.PRESCRIPTIONS);
    const newRx = {
      id: generateId(),
      patient_id: patientId,
      doctor_id: user.linkedProfileId || user.id,
      appointment_id: appointmentId || null,
      diagnosis, medicines, notes,
      created_at: new Date().toISOString()
    };
    rxs.push(newRx);
    Store.set(KEYS.PRESCRIPTIONS, rxs);
    logAudit('PRESCRIPTION_CREATED', 'Prescription', newRx.id, `Rx for ${patient.name}`);
    showToast('Prescription saved successfully!', 'success');
    overlay.remove();
    if (window._tableRefresh) window._tableRefresh();
  });
}

window.openPrescriptionModal = openPrescriptionModal;
