// NMEA0183 Encoder DBT   $IIDBT,103.0,f,31.38,M,17.2,F*2E
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "DBT",
    title: "DBT - Depth Below Transducer",
    keys: ["environment.depth.belowTransducer"],
    f: function mwv(depth) {
      const feet = depth * 3.28084;
      const fathoms = depth * 0.546807;
      return nmea.toSentence([
        "$IIDBT",
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
