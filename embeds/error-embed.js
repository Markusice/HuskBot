const Embed = require("./embed.js");

class ErrorEmbed extends Embed {
  constructor(message) {
    super(message);

    const redColor = 0xff9494;
    this.embed.setColor(redColor);
  }
}

module.exports = ErrorEmbed;
