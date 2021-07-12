import RNFS from 'react-native-fs';
import moment from 'moment';
import { LoggerService } from './Service';
import { logDir, logFileName, logFileDate, logFileSeparator } from './Transport';

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
      // All files with the name {date}__log.txt where the date is some date in the format
      // DD-MM-YY and is at least 5 days ago.
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

export default new LoggerService();
