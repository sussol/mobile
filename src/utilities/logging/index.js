import RNFS from 'react-native-fs';
import moment from 'moment';

export const logDir = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;
export const logFileName = 'log.txt';
export const logFileDate = 'DD-MM-YY';
export const logFileSeparator = '__';

export const LogLevel = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const logFileFilter = file => file?.includes(`${logFileSeparator}${logFileName}`);

const getExceedsThresholdFilter = (threshold = [5, 'days']) => fileName => {
  const thresholdDate = moment().subtract(...threshold);
  const [maybeDate] = fileName.split(logFileSeparator);
  const asMoment = moment(maybeDate, logFileDate);
  return asMoment.isBefore(thresholdDate);
};

export const tidyLogFiles = async () => {
  try {
    const files = await RNFS.readdir(logDir);

    return Promise.all(
      files
        .filter(logFileFilter)
        .filter(getExceedsThresholdFilter())
        .map(fileName => RNFS.unlink(`${logDir}/${fileName}`))
    );
  } catch (error) {
    return null;
    // Going to just ignore errors for now..?
  }
};
