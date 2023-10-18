const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
    immutable: true,
  },
  name: {
    type: String,
    minLength: 1,
    required: true,
    immutable: true,
    lowercase: true,
  },
  url: {
    type: String,
    required: true,
    match: [
      /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/,
      "Please add a valid URL!",
    ],
  },
});

module.exports = mongoose.model("Link", linkSchema);
