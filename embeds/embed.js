const { EmbedBuilder } = require("@discordjs/builders");

class Embed {
  constructor(message) {
    this.message = message;
    this.embed = new EmbedBuilder().setTitle(this.message);
  }
}

module.exports = Embed;
