/**
    $IIXDR,P,1.02481,B,Barometer*0D
*/
// $IIXDR,P,1.0050,B,Barometer*13

const nmea = require("../nmea");

module.exports = function () {
  return {
    title: "XDR (Barometer) - Atomospheric Pressure",
    keys: ["environment.outside.pressure"],
    f(pressure) {
      return nmea.toSentence([
        "$IIXDR",
        "P",
        (pressure / 1.0e5).toFixed(4),
        "B",
        "Barometer",
      ]);
    },
  };
};
