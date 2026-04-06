const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/seed", async (req, res) => {
  try {
    const exists = await Admin.findOne({ username: "admin" });
    if (exists) return res.json({ message: "Admin already exists" });
    await Admin.create({ username: "admin", password: "admin123" });
    res.json({ message: "Admin seeded (admin / admin123)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
