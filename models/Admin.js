const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");       // Library for hashing passwords

// Define Admin Schema (structure of admin collection)
const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Pre-save middleware (runs BEFORE saving to database)
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password(p) with stored hashed password(this.password)
schema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password);
};

module.exports = mongoose.model("Admin", schema);
