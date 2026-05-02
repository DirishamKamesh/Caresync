const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor_role: { type: String, required: true },
  actor_username: { type: String, required: true },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: String, required: true },
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
