const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const createPdfUploader = require('../middleware/uploadPdf');
const upload = createPdfUploader('orders');
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
    const order = new Order({
      orderNumber: req.body.orderNumber,
      title: req.body.title,
      orderDate: req.body.orderDate,
      pdfFile: req.file.filename,
      isActive: req.body.isActive !== 'false'
    });
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', upload.single('pdfFile'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'orders', order.pdfFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      order.pdfFile = req.file.filename;
    }
    if (req.body.orderNumber) order.orderNumber = req.body.orderNumber;
    if (req.body.title) order.title = req.body.title;
    if (req.body.orderDate) order.orderDate = req.body.orderDate;
    if (req.body.isActive !== undefined) order.isActive = req.body.isActive !== 'false';
    const updated = await order.save();
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const filePath = path.join(__dirname, '..', 'uploads', 'orders', order.pdfFile);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
