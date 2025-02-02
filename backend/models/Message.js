const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: { type: String, enum: ["issue", "idea"], required: true },
  status:{type: String, enum: ["pending", "resolved"],default:"pending"},
  filePath: [{ type: String }],
});
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
