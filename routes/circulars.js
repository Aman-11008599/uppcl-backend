const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const Circular = require('../models/Circular');
const createPdfUploader = require('../middleware/uploadPdf');
const upload = createPdfUploader('circulars');
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ orderDate: -1 });
    res.json(circulars);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: 'Not found' });
    res.json(circular);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
    const circular = new Circular({
      orderNumber: req.body.orderNumber,
      title: req.body.title,
      orderDate: req.body.orderDate,
      pdfFile: req.file.filename,
      isActive: req.body.isActive !== 'false'
    });
    const saved = await circular.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', upload.single('pdfFile'), async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: 'Not found' });
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'circulars', circular.pdfFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      circular.pdfFile = req.file.filename;
    }
    if (req.body.orderNumber) circular.orderNumber = req.body.orderNumber;
    if (req.body.title) circular.title = req.body.title;
    if (req.body.orderDate) circular.orderDate = req.body.orderDate;
    if (req.body.isActive !== undefined) circular.isActive = req.body.isActive !== 'false';
    const updated = await circular.save();
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: 'Not found' });
    const filePath = path.join(__dirname, '..', 'uploads', 'circulars', circular.pdfFile);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Circular.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
