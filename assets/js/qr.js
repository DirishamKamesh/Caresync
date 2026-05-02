/**
 * CareSync — QR Code helper
 * Renders a QR code canvas for a given patient ID
 */

function renderQRCode(canvasId, patientId, rxId) {
  if (!window.QRious) return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const token   = btoa(JSON.stringify({ pid: patientId, rxId: rxId || null }));
  const baseUrl = window.location.href.replace(/[^/]*$/, '');
  const url     = `${baseUrl}patient-record.html?t=${token}`;
  new QRious({ element: canvas, value: url, size: 140, background: 'transparent', foreground: '#005c55', level: 'H' });
  return url;
}

window.renderQRCode = renderQRCode;
