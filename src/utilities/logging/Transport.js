/* eslint-disable no-console */
import moment from 'moment';
import RNFS from 'react-native-fs';
import { LogLevel, logDir, logFileName, logFileDate, logFileSeparator } from './index';

// interface Transport {
//     write: (text: string) => void
//     level: number
//     name: string
// }

export const consoleTransport = {
  name: 'console',
  level: LogLevel.trace,
  write: text => {
    console.log('-------------------------------------------');
    console.log('text', text);
    console.log('-------------------------------------------');
  },
};

export const fileTransport = {
  name: 'file',
  level: LogLevel.info,
  write: text => {
    const date = moment().format(logFileDate);
    // mSupplyMobile_data/DD-MM-YY__log.txt
    const path = `${logDir}/${date}${logFileSeparator}${logFileName}`;
    RNFS.appendFile(path, text);
  },
};
