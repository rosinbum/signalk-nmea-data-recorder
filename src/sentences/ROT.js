// to verify

const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "ROT",
    title: "ROT - Rate of Turn",
    keys: ["navigation.rateOfTurn"],
    f(rot) {
      const degm = rot * 3437.74677078493;
      return nmea.toSentence(["$IIROT", degm.toFixed(2), "A"]);
    },
  };
};
