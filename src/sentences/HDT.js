// NMEA0183 Encoder HDT   $IIHDT,200.1,T*21
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "HDT",
    title: "HDT - Heading True",
    keys: ["navigation.headingTrue"],
    f(heading) {
      return nmea.toSentence([
        "$IIHDT",
        nmea.radsToDeg(heading).toFixed(1),
        "T",
      ]);
    },
  };
};
