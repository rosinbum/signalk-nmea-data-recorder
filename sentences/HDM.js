// NMEA0183 Encoder HDM   $IIHDM,206.7,M*21
const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "HDM",
    title: "HDM - Heading Magnetic",
    keys: ["navigation.headingMagnetic"],
    f(heading) {
      return nmea.toSentence([
        "$IIHDM",
        nmea.radsToDeg(heading).toFixed(1),
        "M",
      ]);
    },
  };
};
