// NMEA0183 Encoder MWVTCB   $INMWV,61.44,T,6.04,M,A*0A

const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "MWV",
    title: "MWV - True Wind heading and speed",
    keys: ["environment.wind.angleTrueWater", "environment.wind.speedTrue"],

    f(angle, speed) {
      return nmea.toSentence([
        "$IIMWV",
        nmea.radsToPositiveDeg(angle).toFixed(2),
        "T",
        speed.toFixed(2),
        "M",
        "A",
      ]);
    },
  };
};
