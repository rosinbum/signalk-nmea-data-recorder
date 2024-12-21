import Bacon from "baconjs";
import path from "path";
import fs  from "fs";
import { spawn }  from "child_process";
import { ServerAPI, Plugin } from '@signalk/server-api'


interface PluginConfig extends Plugin {
  description?: string;
  today?: string,
  unsubscribes?: [],
}

module.exports = function (app: ServerAPI) {
  let logFileName = "current-vdr.txt";
  const sentences = loadSentences(app);

  const plugin:PluginConfig = {
    schema: () => { return buildSchemaFromSentences(sentences)},
      start(options: object, restart: (newConfiguration: object) => void): void {
        if (typeof options.logdir === "undefined") {
          app.setPluginError("Log directory not defined, plugin disabled");
          return;
        }
        const {logDir, logRotationInterval, timestamp} = options;

        if (!fs.existsSync(logDir)) {
          // attempt creating the log directory
          try {
            fs.mkdirSync(logDir);
          } catch (error) {
            app.setPluginError(
                `Unable to create log directory ${logDir}, plugin disabled`,
            );
            return;
          }
        }

        const logMetaFileName = path.join(logDir, ".current_log_file");

        function compressLogFile(compressLogDir, fileName) {
          const logPath = path.join(compressLogDir, fileName);
          // eslint-disable-next-line
          const gzip = spawn("gzip", [logPath]);
          gzip.on("close", (code) => {
            if (code !== 0) {
              console.log(
                  `Compressing file ${logPath} failed with exit code ${code}`,
              );
            }
          });
        }

        function rotateLogFile(time, compressPrevious = false) {
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

        if (fs.existsSync(logMetaFileName)) {
          app.debug("meta file exists");
          const oldLogFile = fs.readFileSync(logMetaFileName).toString();
          if (fs.existsSync(path.join(logDir, oldLogFile))) {
            compressLogFile(logDir, oldLogFile);
          }
        }

        // create a new logfile
        rotateLogFile(new Date());

        if (logRotationInterval > 0) {
          setInterval(() => {
            rotateLogFile(new Date(), true);
          }, logRotationInterval * 1000);
        }

        // app.debug('Options: ' + JSON.stringify(options));
        // plugin.today = new Date().toISOString().slice(0, 10);

        // const selfContext = `vessels.${app.selfId}`;
        // const selfMatcher = (delta) =>
        //   delta.context && delta.context === selfContext;

        function mapToNmea(encoder, throttle) {
          const selfStreams = encoder.keys.map((key, index) => {
            let stream = app.streambundle.getSelfStream(key);
            if (
                encoder.defaults &&
                typeof encoder.defaults[index] !== "undefined"
            ) {
              stream = stream.merge(Bacon.once(encoder.defaults[index]));
            }
            return stream;
          }, app.streambundle);

          let stream = Bacon.combineWith(function (...args) {
            try {
              return encoder.f.apply(this, args);
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
        });    }, stop(): void {
    },
    id: "voyage-data-recorder",
    name: "Voyage Data Recorder NMEA0183 format"
  }

  const plugin1 = {
    id: "voyage-data-recorder",
    name: "Voyage Data Recorder NMEA0183 format",
    start: (options: object, restart: (newConfiguration: object) => {}): void => {

    },
    stop: (): void =>  {
      // plugin.unsubscribes.forEach((f) => f());
    },
    schema:  {} //buildSchemaFromSentences(sentences);

// unsubscribes: [],

    // description:
    //  "Plugin to log voyage data into a NMEA0183 formatted file with optional timestamp. Does not log AIS",
    // }
  }

  // plugin.sentences = loadSentences(app, plugin);
  return plugin;
};
 const buildSchemaFromSentences = (sentences): object => {
  const schema = {
    type: "object",
    title: "Conversions to NMEA0183 and logging into file non ais",
    description:
        "If there is SK data for the conversion, generate and log the following NMEA0183 sentences from Signal K data:",
    properties: {
      logdir: {
        type: "string",
        title: "Data log file directory",
        default: "/home/pi/sk-delta-logs",
      },
      interval: {
        type: "number",
        title:
            "Log rotation interval (in seconds). Value of zero disables log rotation.",
        default: 86400, // every 24 hours
      },
      timestamp: {
        title: "pre-pend timestamp to each line",
        type: "boolean",
        default: false,
      }
    },
  }
  Object.keys(sentences).forEach((key) => {
    const sentence = sentences[key];
    const throttlePropname = getThrottlePropname(key);
    schema.properties[key] = {
      title: sentence.title,
      type: "boolean",
      default: false,
    };
    schema.properties[throttlePropname] = {
      title: `${key} throttle ms`,
      type: "number",
      default: 0,
    };
  });
  return schema;
}

function loadSentences(app) {
  const fpath = path.join(__dirname, "sentences");
  return fs
    .readdirSync(fpath)
    .filter((filename) => filename.endsWith(".js"))
    .reduce(async (acc, fname) => {
      const sentence = path.basename(fname, ".js");
      const fr = path.join(fpath, sentence)
      acc[sentence] = await import(fr);
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
