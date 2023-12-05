/*
Cross-track error:
$IIXTE,A,A,x.x,a,N,A*hh
 I_Cross-track error in miles, L= left, R= right
 */
// to verify
const nmea = require("../nmea");

module.exports = function () {
  return {
    title: "XTE - Cross-track error (w.r.t. Rhumb line)",
    keys: ["navigation.courseRhumbline.crossTrackError"],
    f(crossTrackError) {
      return nmea.toSentence([
        "$IIXTE",
        "A",
        "A",
        nmea.mToNm(crossTrackError).toFixed(3),
        crossTrackError < 0 ? "R" : "L",
        "N",
      ]);
    },
  };
};
