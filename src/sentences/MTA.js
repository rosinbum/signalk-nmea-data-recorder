/*
Air temperature:
$IIMTA,x.x,C*hh
 I__I_Temperature in degrees C
  */
// $IIMTA,34.80,C*3A

const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "MTA",
    title: "MTA - Air temperature.",
    keys: ["environment.outside.temperature"],
    f(temperature) {
      // console.log("Got MTA--------------------------");
      const celcius = temperature - 273.15;
      return nmea.toSentence(["$IIMTA", celcius.toFixed(2), "C"]);
    },
  };
};
