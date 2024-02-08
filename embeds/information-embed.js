const Embed = require("./embed.js");

class InformationEmbed extends Embed {
  constructor(message) {
    super(message);

    const amethystColor = 0x8860d0;
    this.embed.setColor(amethystColor);
  }
}

module.exports = InformationEmbed;
