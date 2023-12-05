/**
    $IIXDR,A,-0.7,D,PTCH,A,0.9,D,ROLL*0D
*/
// $IIXDR,A,-0.7,D,PTCH,A,0.9,D,ROLL*13

const nmea = require("../nmea");

module.exports = function () {
  return {
    title: "XDR (PTCH-ROLL) - Pitch and Roll",
    keys: ["navigation.attitude"],
    f(attitude) {
      return nmea.toSentence([
        "$IIXDR",
        "A",
        nmea.radsToDeg(attitude.pitch).toFixed(1),
        "D",
        "PTCH",
        "A",
        nmea.radsToDeg(attitude.roll).toFixed(1),
        "D",
        "ROLL",
      ]);
    },
  };
};
