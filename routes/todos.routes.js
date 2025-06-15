const express = require("express");
const router = express.Router();
const Todo = require("../models/todo");

router.get("/", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

router.post("/", async (req, res) => {
  const { title, description } = req.body;
  console.log(title, description);
  await Todo.create({ title, description });
  res.send("todo created");
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findById(id);
  res.send(todo);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  await Todo.findByIdAndUpdate(id, { title, description });
  res.send("todo updated");
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Todo.findByIdAndDelete(id);
  res.send("todo deleted");
});

module.exports = router;
