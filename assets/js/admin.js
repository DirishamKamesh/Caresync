/**
 * CareSync — Admin JS Module
 * Handles: Patients CRUD, Doctors CRUD, Appointments management
 */

/* ============================================================
   SHARED TABLE BUILDER
   ============================================================ */
function buildTablePage(config) {
  let currentPage = 1;
  let searchQuery = '';
  let filterStatus = '';

  const { getData, renderRow, columns, searchFields, containerId, paginationId, onSearch } = config;

  function render() {
    let data = getData();

    // Search
    if (searchQuery) {
      data = data.filter(item =>
        searchFields.some(f => String(item[f]||'').toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus) {
      data = data.filter(item => item.status === filterStatus);
    }

    const pag = paginate(data, currentPage, 10);
    const tbody = document.querySelector(`#${containerId} tbody`);
    if (!tbody) return;

    if (pag.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${columns}" style="padding:0"><div class="cs-empty"><span class="material-symbols-outlined">search_off</span>${searchQuery ? 'No results found' : 'No records yet'}</div></td></tr>`;
    } else {
      tbody.innerHTML = pag.items.map(item => renderRow(item, searchQuery)).join('');
    }

    // Pagination
    const pagEl = document.getElementById(paginationId);
    if (pagEl) renderPaginationControls(pagEl, pag, p => { currentPage = p; render(); });
  }

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      currentPage = 1;
      render();
      if (onSearch) onSearch(searchQuery);
    });
  }

  // Status filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      filterStatus = btn.dataset.filter;
      currentPage = 1;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      render();
    });
  });

  render();
  return { refresh: render, setSearch: q => { searchQuery = q; currentPage = 1; render(); } };
}

/* ============================================================
   PATIENT MODAL
   ============================================================ */
function openPatientModal(patient = null) {
  const isEdit = !!patient;
  const overlay = document.createElement('div');
  overlay.className = 'cs-modal-overlay';
  overlay.id = 'patient-modal';
  overlay.innerHTML = `
    <div class="cs-modal">
      <div class="cs-modal-header">
        <h3 style="font-size:18px;font-weight:700">${isEdit ? 'Edit Patient' : 'Add New Patient'}</h3>
        <button class="cs-btn-icon" onclick="document.getElementById('patient-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="cs-modal-body">
        <form id="patient-form" novalidate>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div>
              <label class="cs-label" for="p-name">Full Name *</label>
              <input class="cs-input" id="p-name" placeholder="John Doe" value="${escHtml(patient?.name||'')}" required/>
            </div>
            <div>
              <label class="cs-label" for="p-age">Age *</label>
              <input class="cs-input" id="p-age" type="number" min="1" max="120" placeholder="30" value="${patient?.age||''}" required/>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div>
              <label class="cs-label" for="p-gender">Gender *</label>
              <select class="cs-select" id="p-gender">
                <option value="">Select…</option>
                <option value="Male" ${patient?.gender==='Male'?'selected':''}>Male</option>
                <option value="Female" ${patient?.gender==='Female'?'selected':''}>Female</option>
                <option value="Other" ${patient?.gender==='Other'?'selected':''}>Other</option>
              </select>
            </div>
            <div>
              <label class="cs-label" for="p-blood">Blood Group</label>
              <select class="cs-select" id="p-blood">
                ${['','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => `<option value="${bg}" ${patient?.bloodGroup===bg?'selected':''}>${bg||'Select…'}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label class="cs-label" for="p-contact">Contact Number *</label>
            <input class="cs-input" id="p-contact" placeholder="+1-555-0000" value="${escHtml(patient?.contact||'')}" required/>
          </div>
          <div style="margin-bottom:16px">
            <label class="cs-label" for="p-address">Address</label>
            <textarea class="cs-textarea" id="p-address" placeholder="123 Main St, City">${escHtml(patient?.address||'')}</textarea>
          </div>
          <div style="margin-bottom:0">
            <label class="cs-label" for="p-emergency">Emergency Contact</label>
            <input class="cs-input" id="p-emergency" placeholder="+1-555-0001" value="${escHtml(patient?.emergencyContact||'')}"/>
          </div>
          <div id="modal-error" style="display:none;margin-top:12px;padding:10px 12px;background:#ffdad6;border-radius:8px;font-size:13px;color:#7f1d1d"></div>
        </form>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn cs-btn-outline" onclick="document.getElementById('patient-modal').remove()">Cancel</button>
        <button class="cs-btn cs-btn-primary" id="save-patient-btn">
          <span class="material-symbols-outlined" style="font-size:18px">${isEdit?'save':'add'}</span>
          ${isEdit ? 'Save Changes' : 'Add Patient'}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  document.getElementById('save-patient-btn').addEventListener('click', () => {
    const name    = document.getElementById('p-name').value.trim();
    const age     = parseInt(document.getElementById('p-age').value);
    const gender  = document.getElementById('p-gender').value;
    const blood   = document.getElementById('p-blood').value;
    const contact = document.getElementById('p-contact').value.trim();
    const address = document.getElementById('p-address').value.trim();
    const emergency = document.getElementById('p-emergency').value.trim();
    const errEl   = document.getElementById('modal-error');

    if (!name || !age || !gender || !contact) {
      errEl.textContent = 'Please fill all required fields (Name, Age, Gender, Contact).';
      errEl.style.display = 'block';
      return;
    }
    if (age < 1 || age > 120) { errEl.textContent = 'Age must be between 1 and 120.'; errEl.style.display = 'block'; return; }

    const patients = Store.get(KEYS.PATIENTS);
    if (isEdit) {
      const idx = patients.findIndex(p => p.id === patient.id);
      if (idx > -1) patients[idx] = { ...patients[idx], name, age, gender, bloodGroup: blood, contact, address, emergencyContact: emergency };
      Store.set(KEYS.PATIENTS, patients);
      logAudit('PATIENT_UPDATED', 'Patient', patient.id, `${name} updated`);
      showToast('Patient updated successfully', 'success');
    } else {
      const newPat = { id: generateId(), unique_patient_id: generatePatientId(), name, age, gender, bloodGroup: blood, contact, address, emergencyContact: emergency };
      patients.push(newPat);
      Store.set(KEYS.PATIENTS, patients);
      logAudit('PATIENT_CREATED', 'Patient', newPat.id, `${name} registered`);
      showToast(`Patient added · ID: ${newPat.unique_patient_id}`, 'success');
    }
    overlay.remove();
    if (window._tableRefresh) window._tableRefresh();
  });
}

/* ============================================================
   DOCTOR MODAL
   ============================================================ */
function openDoctorModal(doctor = null) {
  const isEdit = !!doctor;
  const overlay = document.createElement('div');
  overlay.className = 'cs-modal-overlay';
  overlay.id = 'doctor-modal';
  overlay.innerHTML = `
    <div class="cs-modal">
      <div class="cs-modal-header">
        <h3 style="font-size:18px;font-weight:700">${isEdit ? 'Edit Doctor' : 'Add New Doctor'}</h3>
        <button class="cs-btn-icon" onclick="document.getElementById('doctor-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="cs-modal-body">
        <form novalidate>
          <div style="margin-bottom:16px">
            <label class="cs-label" for="d-name">Full Name *</label>
            <input class="cs-input" id="d-name" placeholder="Dr. Jane Smith" value="${escHtml(doctor?.name||'')}" required/>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div>
              <label class="cs-label" for="d-spec">Specialisation *</label>
              <input class="cs-input" id="d-spec" placeholder="Cardiology" value="${escHtml(doctor?.specialisation||'')}" required/>
            </div>
            <div>
              <label class="cs-label" for="d-qual">Qualification</label>
              <input class="cs-input" id="d-qual" placeholder="MD, FACC" value="${escHtml(doctor?.qualification||'')}"/>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:0">
            <div>
              <label class="cs-label" for="d-contact">Contact</label>
              <input class="cs-input" id="d-contact" placeholder="+1-555-0101" value="${escHtml(doctor?.contact||'')}"/>
            </div>
            <div>
              <label class="cs-label" for="d-license">License No.</label>
              <input class="cs-input" id="d-license" placeholder="MED-XXX" value="${escHtml(doctor?.licenseNumber||'')}"/>
            </div>
          </div>
          <div id="doc-error" style="display:none;margin-top:12px;padding:10px;background:#ffdad6;border-radius:8px;font-size:13px;color:#7f1d1d"></div>
        </form>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn cs-btn-outline" onclick="document.getElementById('doctor-modal').remove()">Cancel</button>
        <button class="cs-btn cs-btn-primary" id="save-doctor-btn">
          <span class="material-symbols-outlined" style="font-size:18px">${isEdit?'save':'add'}</span>
          ${isEdit ? 'Save Changes' : 'Add Doctor'}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  document.getElementById('save-doctor-btn').addEventListener('click', () => {
    const name  = document.getElementById('d-name').value.trim();
    const spec  = document.getElementById('d-spec').value.trim();
    const qual  = document.getElementById('d-qual').value.trim();
    const cont  = document.getElementById('d-contact').value.trim();
    const lic   = document.getElementById('d-license').value.trim();
    const errEl = document.getElementById('doc-error');
    if (!name || !spec) { errEl.textContent = 'Name and Specialisation are required.'; errEl.style.display = 'block'; return; }

    const doctors = Store.get(KEYS.DOCTORS);
    if (isEdit) {
      const idx = doctors.findIndex(d => d.id === doctor.id);
      if (idx > -1) doctors[idx] = { ...doctors[idx], name, specialisation: spec, qualification: qual, contact: cont, licenseNumber: lic };
      Store.set(KEYS.DOCTORS, doctors);
      logAudit('DOCTOR_UPDATED', 'Doctor', doctor.id, `${name} updated`);
      showToast('Doctor updated', 'success');
    } else {
      const newDoc = { id: generateId(), name, specialisation: spec, qualification: qual, contact: cont, licenseNumber: lic };
      doctors.push(newDoc);
      Store.set(KEYS.DOCTORS, doctors);
      logAudit('DOCTOR_ADDED', 'Doctor', newDoc.id, `${name} onboarded`);
      showToast('Doctor added', 'success');
    }
    overlay.remove();
    if (window._tableRefresh) window._tableRefresh();
  });
}

/* ============================================================
   DELETE HELPERS
   ============================================================ */
function deletePatient(id) {
  confirmDialog('Are you sure you want to delete this patient? This action cannot be undone.', () => {
    const patients = Store.get(KEYS.PATIENTS).filter(p => p.id !== id);
    Store.set(KEYS.PATIENTS, patients);
    logAudit('PATIENT_DELETED', 'Patient', id, 'Patient record removed');
    showToast('Patient deleted', 'info');
    if (window._tableRefresh) window._tableRefresh();
  }, 'Delete Patient');
}

function deleteDoctor(id) {
  confirmDialog('Delete this doctor? Associated appointments will remain.', () => {
    const doctors = Store.get(KEYS.DOCTORS).filter(d => d.id !== id);
    Store.set(KEYS.DOCTORS, doctors);
    logAudit('DOCTOR_DELETED', 'Doctor', id, 'Doctor record removed');
    showToast('Doctor deleted', 'info');
    if (window._tableRefresh) window._tableRefresh();
  }, 'Delete Doctor');
}

function updateAppointmentStatus(id, newStatus) {
  const apts = Store.get(KEYS.APPOINTMENTS);
  const idx  = apts.findIndex(a => a.id === id);
  if (idx > -1) {
    apts[idx].status = newStatus;
    Store.set(KEYS.APPOINTMENTS, apts);
    const actionMap = { Approved: 'APPOINTMENT_APPROVED', Rejected: 'APPOINTMENT_REJECTED', Completed: 'APPOINTMENT_COMPLETED' };
    logAudit(actionMap[newStatus] || 'APPOINTMENT_UPDATED', 'Appointment', id, `Status → ${newStatus}`);
    showToast(`Appointment ${newStatus.toLowerCase()}`, newStatus === 'Rejected' ? 'error' : 'success');
    if (window._tableRefresh) window._tableRefresh();
  }
}

window.openPatientModal  = openPatientModal;
window.openDoctorModal   = openDoctorModal;
window.deletePatient     = deletePatient;
window.deleteDoctor      = deleteDoctor;
window.updateAppointmentStatus = updateAppointmentStatus;
window.buildTablePage    = buildTablePage;
