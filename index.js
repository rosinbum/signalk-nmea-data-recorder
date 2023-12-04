const Bacon = require("baconjs");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const moment = require("moment");

module.exports = function (app) {
  var plugin = {
    unsubscribes: [],
  };
  let logFileName = "current-vdr.txt";

  plugin.id = "voyage-data-recorder";
  plugin.name = "Voyage Data Recorder NMEA0183 format";
  plugin.description =
    "Plugin to log voyage data into a NMEA0183 formatted file with optional timestamp. Does not log AIS";
  plugin.schema = {
    type: "object",
    title: "Conversions to NMEA0183 and logging into file non ais",
    description:
      "If there is SK data for the conversion, generate and log the following NMEA0183 sentences from Signal K data:",
    properties: {},
  };
  plugin.schema.properties["logdir"] = {
    type: "string",
    title: "Data log file directory",
    default: "/home/pi/sk-delta-logs",
  };
  plugin.schema.properties["interval"] = {
    type: "number",
    title:
      "Log rotation interval (in seconds). Value of zero disables log rotation.",
    default: 86400, // every 24 hours
  };
  plugin.schema.properties["timestamp"] = {
    title: "pre-pend timestamp to each line",
    type: "boolean",
    default: false,
  };

  plugin.start = function (options) {
    if (typeof options.logdir === "undefined") {
      app.setProviderStatus("Log directory not defined, plugin disabled");
      return;
    }
    let logDir = options.logdir;
    let logRotationInterval = options.interval;
    let timestamp = options.timestamp;

    if (!fs.existsSync(logDir)) {
      // attempt creating the log directory
      try {
        fs.mkdirSync(logDir);
      } catch (error) {
        app.setProviderStatus(
          `Unable to create log directory ${logDir}, plugin disabled`,
        );
        return;
      }
    }

    const logMetaFileName = path.join(logDir, ".current_log_file");
    if (fs.existsSync(logMetaFileName)) {
      app.debug("meta file exists");
      const oldLogFile = fs.readFileSync(logMetaFileName).toString();
      if (fs.existsSync(path.join(logDir, oldLogFile))) {
        compressLogFile(logDir, oldLogFile);
      }
    }

    // create a new logfile
    rotateLogFile(new Date(), logFileName);

    if (logRotationInterval > 0) {
      setInterval(() => {
        rotateLogFile(new Date(), logFileName, true);
      }, logRotationInterval * 1000);
    }

    function mapToNmea(encoder, throttle) {
      const selfStreams = encoder.keys.map((key, index) => {
        let stream = app.streambundle.getSelfStream(key);
        if (encoder.defaults && typeof encoder.defaults[index] != "undefined") {
          stream = stream.merge(Bacon.once(encoder.defaults[index]));
        }
        return stream;
      }, app.streambundle);

      let stream = Bacon.combineWith(function () {
        try {
          return encoder.f.apply(this, arguments);
        } catch (e) {
          console.error(e.message);
        }
      }, selfStreams)
        .filter((v) => typeof v !== "undefined")
        .changes()
        .debounceImmediate(20);

      if (throttle) {
        stream = stream.throttle(throttle);
      }

      plugin.unsubscribes.push(
        stream.onValue((nmeaString) => {
          writeNMEAData(nmeaString, logDir, logFileName, timestamp);
        }),
      );
    }

    Object.keys(plugin.sentences).forEach((name) => {
      if (options[name]) {
        mapToNmea(plugin.sentences[name], options[getThrottlePropname(name)]);
      }
    });
  };

  plugin.stop = function () {
    // compress the log file
    rotateLogFile(new Date(), logFileName, true);
    plugin.unsubscribes.forEach((f) => f());
  };

  plugin.sentences = loadSentences(app, plugin);
  buildSchemaFromSentences(plugin);
  return plugin;
};

function compressLogFile(logDir, fileName) {
  let logPath = path.join(logDir, fileName);
  const gzip = spawn("gzip", [logPath]);
  gzip.on("close", (code) => {
    if (code !== 0) {
      console.error(
        `Compressing file ${logPath} failed with exit code ${code}`,
      );
    }
  });
}

function rotateLogFile(time, logFileName, compressPrevious = false) {
  // update the log filename
  const oldLogFileName = logFileName;
  logFileName = "nmea0138-vdr."
    .concat(time.toISOString().replace(/:/g, "-"))
    .concat(".log");

  // gzip the old logfile
  if (compressPrevious) {
    compressLogFile(logDir, oldLogFileName);
  }

  // keep track of the current log file
  fs.writeFileSync(path.join(logDir, ".current_log_file"), logFileName);
}

function buildSchemaFromSentences(plugin) {
  plugin.schema.properties[""];
  Object.keys(plugin.sentences).forEach((key) => {
    var sentence = plugin.sentences[key];
    const throttlePropname = getThrottlePropname(key);
    plugin.schema.properties[key] = {
      title: sentence["title"],
      type: "boolean",
      default: false,
    };
    plugin.schema.properties[throttlePropname] = {
      title: `${key} throttle ms`,
      type: "number",
      default: 0,
    };
  });
}

function loadSentences(app, plugin) {
  const fpath = path.join(__dirname, "sentences");
  return fs
    .readdirSync(fpath)
    .filter((filename) => filename.endsWith(".js"))
    .reduce((acc, fname) => {
      let sentence = path.basename(fname, ".js");
      acc[sentence] = require(path.join(fpath, sentence))(app, plugin);
      return acc;
    }, {});
}

function writeNMEAData(nmeaString, dir, fileName, timestamp) {
  fs.appendFile(
    path.join(dir, fileName),
    `${timestamp ? `${moment.now()}, ` : ""}${nmeaString}\n`,
    (err) => {
      if (err) console.error(err);
    },
  );
}

const getThrottlePropname = (key) => `${key}_throttle`;
