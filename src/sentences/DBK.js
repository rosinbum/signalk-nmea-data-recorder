// NMEA0183 Encoder DBK   $IIDBK,102.9,f,31.38,M,17.2,F*39
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "DBK",
    title: "DBK - Depth Below Keel",
    keys: ["environment.depth.belowKeel"],
    f: function mwv(depth) {
      const feet = depth * 3.28084;
      const fathoms = depth * 0.546807;
      return nmea.toSentence([
        "$IIDBK",
        feet.toFixed(1),
        "f",
        depth.toFixed(2),
        "M",
        fathoms.toFixed(1),
        "F",
      ]);
    },
  };
};
