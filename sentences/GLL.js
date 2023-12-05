/*
Geographical position, latitude and longitude:
$IIGLL,IIII.II,a,yyyyy.yy,a,hhmmss.ss,A,A*hh
 I I I I I I_Statut, A= valid data, V= non valid data
 I I I I I_UTC time
 I I I___ I_Longitude, E/W
 I__I_Latidude, N/S
*/
// NMEA0183 Encoder GLL   $GPGLL,5943.4970,N,2444.1983,E,200001.020,A*16

const nmea = require("../nmea");

module.exports = function () {
  return {
    sentence: "GLL",
    title: "GLL - Geographical position, latitude and longitude",
    keys: ["navigation.datetime", "navigation.position"],
    f: function gll(datetime8601, position) {
      const datetime = new Date(datetime8601);
      const hours = `00${datetime.getHours()}`.slice(-2);
      const minutes = `00${datetime.getMinutes()}`.slice(-2);
      const seconds = `00${datetime.getSeconds()}`.slice(-2);
      if (position !== null) {
        return nmea.toSentence([
          "$GPGLL",
          nmea.toNmeaDegreesLatitude(position.latitude),
          nmea.toNmeaDegreesLongitude(position.longitude),
          `${hours + minutes + seconds}.020`,
          "A",
        ]);
      }
      return "";
    },
  };
};
