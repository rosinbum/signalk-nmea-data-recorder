/*
    $IIXDR,C,19.52,C,TempAir*3D
*/
// $IIXDR,C,34.80,C,TempAir*19

const nmea = require("../nmea");

module.exports = function () {
  return {
    title: "XDR (TempAir) - Air temperature.",
    keys: ["environment.outside.temperature"],
    f(temperature) {
      const celcius = temperature - 273.15;
      return nmea.toSentence([
        "$IIXDR",
        "C",
        celcius.toFixed(2),
        "C",
        "TempAir",
      ]);
    },
  };
};
