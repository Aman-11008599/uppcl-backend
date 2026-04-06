const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  orderDate: { type: Date, required: true },
  pdfFile: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Circular', circularSchema);
