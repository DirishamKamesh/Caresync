/**
 * CareSync — PDF Generation (jsPDF)
 * Generates prescription PDF with QR code embedded
 */

async function downloadPrescriptionPDF(rxId) {
  if (!window.jspdf || !window.QRious) {
    showToast('PDF library loading… please try again', 'info');
    return;
  }
  const { jsPDF } = window.jspdf;
  const rxs      = Store.get(KEYS.PRESCRIPTIONS);
  const rx       = rxs.find(r => r.id === rxId);
  if (!rx) { showToast('Prescription not found', 'error'); return; }

  const patients = Store.get(KEYS.PATIENTS);
  const doctors  = Store.get(KEYS.DOCTORS);
  const patient  = patients.find(p => p.id === rx.patient_id) || {};
  const doctor   = doctors.find(d => d.id === rx.doctor_id)   || {};

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20;
  let y = 0;

  // --- Header ---
  doc.setFillColor(0, 92, 85);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CareSync Medical System', margin, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Hospital Management · Demo Mode', margin, 24);
  doc.text(`Prescription · ${new Date(rx.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`, W - margin, 24, { align: 'right' });
  y = 44;

  // --- Patient Info ---
  doc.setTextColor(30, 45, 44);
  doc.setFillColor(241, 244, 243);
  doc.roundedRect(margin, y, W - margin*2, 36, 3, 3, 'F');
  y += 8;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(0, 92, 85);
  doc.text('PATIENT INFORMATION', margin + 6, y);
  y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(30, 45, 44);
  doc.text(`Name: ${patient.name || '—'}`, margin + 6, y);
  doc.text(`ID: ${patient.unique_patient_id || '—'}`, W/2, y);
  y += 6;
  doc.text(`Age: ${patient.age || '—'}  Gender: ${patient.gender || '—'}  Blood Group: ${patient.bloodGroup || '—'}`, margin + 6, y);
  y += 14;

  // --- Doctor Info ---
  doc.setFillColor(232, 247, 245);
  doc.roundedRect(margin, y, W - margin*2, 26, 3, 3, 'F');
  y += 8;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 92, 85);
  doc.text('PRESCRIBING DOCTOR', margin + 6, y);
  y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(30, 45, 44);
  doc.text(`Dr. ${(doctor.name||'').replace(/^Dr\.\s*/i,'')}  ·  ${doctor.specialisation || '—'}  ·  Lic: ${doctor.licenseNumber || '—'}`, margin + 6, y);
  y += 16;

  // --- Rx Symbol ---
  doc.setFillColor(0, 92, 85);
  doc.circle(margin + 6, y + 4, 5, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Rx', margin + 3.5, y + 5.5);
  doc.setTextColor(30, 45, 44); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text('DIAGNOSIS', margin + 14, y + 5);
  y += 14;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text(rx.diagnosis || '—', margin + 6, y);
  y += 12;

  // --- Medicines ---
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 92, 85);
  doc.text('MEDICINES', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(30, 45, 44);
  const medLines = (rx.medicines || '').split('\n').filter(Boolean);
  medLines.forEach((med, i) => {
    doc.setFillColor(i % 2 === 0 ? 248 : 244, 250, 248);
    doc.rect(margin, y - 4, W - margin*2, 8, 'F');
    doc.text(`• ${med}`, margin + 4, y + 1);
    y += 10;
  });
  y += 4;

  // --- Notes ---
  if (rx.notes) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 92, 85);
    doc.text('NOTES & INSTRUCTIONS', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(30, 45, 44);
    const noteLines = doc.splitTextToSize(rx.notes, W - margin*2 - 40);
    noteLines.forEach(line => { doc.text(line, margin + 4, y); y += 7; });
    y += 4;
  }

  // --- QR Code ---
  const qrToken = btoa(JSON.stringify({ pid: patient.id, rxId: rx.id }));
  const qrUrl   = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}patient-record.html?t=${qrToken}`;
  const qrCanvas = document.createElement('canvas');
  new QRious({ element: qrCanvas, value: qrUrl, size: 120, background: 'white' });

  doc.setFillColor(241, 244, 243);
  doc.roundedRect(margin, y, W - margin*2, 52, 3, 3, 'F');
  doc.addImage(qrCanvas.toDataURL(), 'PNG', margin + 6, y + 6, 38, 38);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(0, 92, 85);
  doc.text('SCAN TO VERIFY', margin + 48, y + 14);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 121, 119);
  doc.text('Scan the QR code to view the patient', margin + 48, y + 21);
  doc.text('record. For demo purposes only.', margin + 48, y + 27);
  y += 58;

  // --- Footer ---
  doc.setFillColor(0, 92, 85);
  doc.rect(0, 282, W, 15, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('CareSync Medical System · DEMO MODE · Not for real clinical use', W/2, 290, { align: 'center' });

  doc.save(`CareSync-Rx-${patient.unique_patient_id || 'unknown'}-${rx.id.slice(0,6)}.pdf`);
  logAudit('PRESCRIPTION_PDF_DOWNLOADED', 'Prescription', rx.id, `PDF for ${patient.name}`);
  showToast('Prescription PDF downloaded!', 'success');
}

window.downloadPrescriptionPDF = downloadPrescriptionPDF;
