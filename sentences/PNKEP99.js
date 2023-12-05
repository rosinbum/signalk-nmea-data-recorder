/** test */

// to verify
const nmea = require("../nmea");

module.exports = function () {
  return {
    title: "PNKEP,99 - Debug",
    keys: [
      "environment.wind.angleApparent",
      "environment.wind.speedApparent",
      "environment.wind.angleTrue",
      "environment.wind.speedTrue",
      "navigation.speedThroughWater",
      "performance.polarSpeed",
      "performance.polarSpeedRatio",
    ],
    f(
      angleApparent,
      speedApparent,
      angleTrueWater,
      speedTrue,
      speedThroughWater,
      polarSpeed,
      polarSpeedRatio,
    ) {
      // console.log("Got Polar speed --------------------------------------------------");
      return nmea.toSentence([
        "$PNKEP",
        "99",
        nmea.radsToDeg(angleApparent),
        nmea.msToKnots(speedApparent),
        nmea.radsToDeg(angleTrueWater),
        nmea.msToKnots(speedTrue),
        nmea.msToKnots(speedThroughWater),
        nmea.msToKnots(polarSpeed),
        polarSpeedRatio,
      ]);
    },
  };
};
