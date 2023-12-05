// NMEA0183 Encoder MTW   $IIMTW,40.0,C*17
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "MTW",
    title: "MTW - Water Temperature",
    keys: ["environment.water.temperature"],
    f(temperature) {
      const celcius = temperature - 273.15;
      return nmea.toSentence(["$IIMTW", celcius.toFixed(1), "C"]);
    },
  };
};
