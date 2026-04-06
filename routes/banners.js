const router = require("express").Router();
const Banner = require("../models/Banner");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, active, order } = req.body;
    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      image: req.file ? req.file.filename : "",
      active: active === "true" || active === true,
      order: parseInt(order) || 0,
    });
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, subtitle, active, order } = req.body;
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (active !== undefined) banner.active = active === "true" || active === true;
    if (order !== undefined) banner.order = parseInt(order) || 0;

    if (req.file) {
      // Delete old image file if it exists
      if (banner.image) {
        const oldPath = path.join(__dirname, "..", "uploads", banner.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      banner.image = req.file.filename;
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete associated image file
    if (banner.image) {
      const imgPath = path.join(__dirname, "..", "uploads", banner.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await banner.deleteOne();
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
