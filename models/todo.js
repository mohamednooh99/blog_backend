const mongoose = require("mongoose");
const { Schema } = mongoose;
const todoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const todo = mongoose.model("todo", todoSchema);

module.exports = todo;
