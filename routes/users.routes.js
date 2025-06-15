const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  await User.create({ name, email, password });
  res.send("user created");
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.send(user);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  await User.findByIdAndUpdate(id, { name, email, password });
  res.send("user updated");
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.send("user deleted");
});

module.exports = router;
