// to verify
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "DBS",
    title: "DBS - Depth Below Surface",
    keys: ["environment.depth.belowSurface"],
    f: function mwv(depth) {
      const feet = depth * 3.28084;
      const fathoms = depth * 0.546807;
      return nmea.toSentence([
        "$IIDBS",
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
