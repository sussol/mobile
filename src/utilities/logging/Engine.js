import bunyan from 'react-native-bunyan';

// interface LoggingEngine {
//     trace: (text: string) => void
//     debug: (text: string) => void
//     info: (text: string) => void
//     warn: (text: string) => void
//     error: (text: string) => void
//     fatal: (text: string) => void
//     createChild: (text: string) => void
// }
export class BunyanLoggingEngine {
  streams = [];

  bunyan = null;

  transports = {};

  constructor({ module, transports }) {
    this.transports = transports;
    this.streams = Object.values(transports).map(({ level, write, name }) => ({
      name,
      level,
      stream: { write },
    }));

    this.bunyan = bunyan.createLogger({ name: module, streams: this.streams });
  }

  trace(text) {
    this.bunyan.trace(text);
  }

  debug(text) {
    this.bunyan.debug(text);
  }

  info(text) {
    this.bunyan.info(text);
  }

  warn(text) {
    this.bunyan.warn(text);
  }

  error(text) {
    this.bunyan.error(text);
  }

  fatal(text) {
    this.bunyan.fatal(text);
  }

  createChild(submodule) {
    this.bunyan.child({ submodule });
  }

  setLogLevel(transportKey, newLevel) {
    this.bunyan.levels(transportKey, newLevel);
  }
}
