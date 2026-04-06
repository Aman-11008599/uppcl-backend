const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  labelEn: { type: String, required: true },
  labelHi: { type: String, required: true },
  url: { type: String, required: true },
});

const schema = new mongoose.Schema(
  {
    titleEn: { type: String, required: true },
    titleHi: { type: String, required: true },
    icon: { type: String, default: "FileText" },
    colorClass: { type: String, default: "blue" },
    links: [linkSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsumerCard", schema);
