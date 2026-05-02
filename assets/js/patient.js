/**
 * CareSync — Patient JS Module
 */

function openBookingModal() {
  const doctors = Store.get(KEYS.DOCTORS);
  const user    = Auth.getSession();
  const patient = Store.get(KEYS.PATIENTS).find(p => p.id === user?.linkedProfileId);

  if (!patient) { showToast('Patient profile not found', 'error'); return; }

  const docOptions = doctors.map(d =>
    `<option value="${d.id}">${escHtml(d.name)} — ${escHtml(d.specialisation)}</option>`
  ).join('');

  // Min date: today
  const minDate = new Date().toISOString().slice(0, 16);

  const overlay = document.createElement('div');
  overlay.className = 'cs-modal-overlay';
  overlay.id = 'booking-modal';
  overlay.innerHTML = `
    <div class="cs-modal">
      <div class="cs-modal-header">
        <div>
          <h3 style="font-size:18px;font-weight:700">Book Appointment</h3>
          <p style="font-size:12px;color:#6e7977;margin-top:2px">${escHtml(patient.name)} · ${escHtml(patient.unique_patient_id)}</p>
        </div>
        <button class="cs-btn-icon" onclick="document.getElementById('booking-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="cs-modal-body">
        <div style="margin-bottom:16px">
          <label class="cs-label" for="bk-doctor">Doctor *</label>
          <select class="cs-select" id="bk-doctor" required>
            <option value="">Select a doctor…</option>
            ${docOptions}
          </select>
        </div>
        <div style="margin-bottom:16px">
          <label class="cs-label" for="bk-datetime">Date & Time *</label>
          <input class="cs-input" type="datetime-local" id="bk-datetime" min="${minDate}" required/>
        </div>
        <div style="margin-bottom:0">
          <label class="cs-label" for="bk-reason">Reason for Visit *</label>
          <textarea class="cs-textarea" id="bk-reason" placeholder="Briefly describe your symptoms or reason for visit…" required></textarea>
        </div>
        <div id="bk-error" style="display:none;margin-top:12px;padding:10px;background:#ffdad6;border-radius:8px;font-size:13px;color:#7f1d1d"></div>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn cs-btn-outline" onclick="document.getElementById('booking-modal').remove()">Cancel</button>
        <button class="cs-btn cs-btn-primary" id="save-booking-btn">
          <span class="material-symbols-outlined" style="font-size:18px">event_available</span>
          Book Appointment
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  document.getElementById('save-booking-btn').addEventListener('click', () => {
    const doctorId = document.getElementById('bk-doctor').value;
    const datetime = document.getElementById('bk-datetime').value;
    const reason   = document.getElementById('bk-reason').value.trim();
    const errEl    = document.getElementById('bk-error');

    if (!doctorId || !datetime || !reason) {
      errEl.textContent = 'All fields are required.';
      errEl.style.display = 'block'; return;
    }
    if (new Date(datetime) <= new Date()) {
      errEl.textContent = 'Please select a future date and time.';
      errEl.style.display = 'block'; return;
    }

    const apts = Store.get(KEYS.APPOINTMENTS);
    const newApt = {
      id: generateId(),
      patient_id: patient.id,
      doctor_id:  doctorId,
      date_time:  new Date(datetime).toISOString(),
      status:     'Pending',
      reason,
      created_at: new Date().toISOString()
    };
    apts.push(newApt);
    Store.set(KEYS.APPOINTMENTS, apts);
    logAudit('APPOINTMENT_BOOKED', 'Appointment', newApt.id, `${patient.name} booked with doctor`);
    showToast('Appointment booked! Status: Pending review', 'success');
    overlay.remove();
    if (window._tableRefresh) window._tableRefresh();
  });
}

window.openBookingModal = openBookingModal;
