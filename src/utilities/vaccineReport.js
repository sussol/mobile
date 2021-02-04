import Mailer from 'react-native-mail';
import { Parser } from 'json2csv';
import RNFS from 'react-native-fs';
import moment from 'moment';
import TimeZone from 'react-native-timezone';
import DeviceInfo from 'react-native-device-info';
import temperature from './temperature';
import { SECONDS } from './constants';

// TODO: LOTS OF LOCALIZATION
const SECTION_TITLES = {
  LOGGING: 'LOGGING',
  SENSOR_STATS: 'STATISTICS',
  BREACH_CONFIG: 'BREACH CONFIGURATIONS',
  BREACHES: 'BREACHES',
  LOGS: 'LOGS',
};

const CONFIG_TYPE_TO_NAME = {
  HOT_CONSECUTIVE: 'Hot consecutive',
  HOT_CUMULATIVE: 'Hot cumulative',
  COLD_CONSECUTIVE: 'Cold consecutive',
  COLD_CUMULATIVE: 'Cold cumulative',
};

const GENERAL_SECTION_FIELDS = {
  TIMEZONE: 'Timezone',
  DEVICE: 'Device',
  NAME: 'Sensor name',
  EXPORTER: 'Exported by',
  COMMENT: 'Job description',
};

const LOGGING_SECTION_FIELDS = {
  LOGGING_START: 'Logging start',
  LOGGING_INTERVAL: 'Logging interval',
};

const SENSOR_STATS_SECTION_FIELDS = {
  MAX_TEMPERATURE: 'Max Temperature',
  MIN_TEMPERATURE: 'Min Temperature',
  NUMBER_BREACHES: 'Number of continuous breaches',
};

const BREACH_CONFIG_SECTION_FIELDS = {
  TYPE: 'Breach Type',
  DURATION: 'Duration threshold',
  TEMPERATURE: 'Temperature threshold',
};

const BREACH_SECTION_FIELDS = {
  TYPE: 'Breach type',
  START: 'Starting timestamp',
  END: 'Ending timestamp',
  DURATION: 'Exposure duration (minutes)',
  MIN_TEMPERATURE: 'Minimum temperature',
  MAX_TEMPERATURE: 'Maximum temperature',
};

const LOG_SECTION_FIELDS = {
  TIMESTAMP: 'Timestamp',
  TEMPERATURE: 'Temperature',
  BREACH: 'Continuous Breach',
  LOG_INTERVAL: 'Log interval (minutes)',
};

const getParser = fields => new Parser({ fields: Object.values(fields) });

const createGeneralSection = async (sensor, user, comment) => {
  const parser = getParser(GENERAL_SECTION_FIELDS);

  const timeZone = await TimeZone.getTimeZone();
  const device = await DeviceInfo.getModel();
  const data = {
    [GENERAL_SECTION_FIELDS.TIMEZONE]: timeZone,
    [GENERAL_SECTION_FIELDS.DEVICE]: device,
    [GENERAL_SECTION_FIELDS.NAME]: sensor.name ?? sensor.macAddress,
    [GENERAL_SECTION_FIELDS.EXPORTER]: `${user.firstName ?? ''} ${user.lastName ?? ''}`,
    [GENERAL_SECTION_FIELDS.COMMENT]: comment ?? '',
  };

  return { parser, data };
};

// TODO: LOCALIZE
const createLoggingSection = sensor => {
  const title = SECTION_TITLES.LOGGING;

  const parser = getParser(SENSOR_STATS_SECTION_FIELDS);

  const data = {
    [LOGGING_SECTION_FIELDS.LOGGING_START]: moment(sensor.firstLog?.timestamp).format(
      'MMMM Do YYYY, h:mm:ss a'
    ),
    [LOGGING_SECTION_FIELDS.LOGGING_INTERVAL]: `${Math.round(
      sensor.logInterval / SECONDS.ONE_MINUTE
    )} minutes`,
  };

  return { title, parser, data };
};

const createSensorStatsSection = sensor => {
  const parser = getParser(SENSOR_STATS_SECTION_FIELDS);

  const data = {
    [SENSOR_STATS_SECTION_FIELDS.MAX_TEMPERATURE]: temperature(sensor.maxTemperature).format(),
    [SENSOR_STATS_SECTION_FIELDS.MIN_TEMPERATURE]: temperature(sensor.minTemperature).format(),
    [SENSOR_STATS_SECTION_FIELDS.NUMBER_BREACHES]: sensor.numberOfBreaches,
  };

  const title = SECTION_TITLES.SENSOR_STATS;

  return { parser, data, title };
};

// TODO: LOCALIZE
const createBreachConfigSection = breachConfigs => {
  const parser = getParser(BREACH_CONFIG_SECTION_FIELDS);

  const data = breachConfigs.map(config => ({
    [BREACH_CONFIG_SECTION_FIELDS.TYPE]: CONFIG_TYPE_TO_NAME[config?.type],
    [BREACH_CONFIG_SECTION_FIELDS.DURATION]: `${config.duration / 60} minutes`,
    [BREACH_CONFIG_SECTION_FIELDS.TEMPERATURE]: config.type.includes('HOT')
      ? `Above ${temperature(config.minimumTemperature).format()}`
      : `Below ${temperature(config.maximumTemperature).format()}`,
  }));

  const title = SECTION_TITLES.BREACH_CONFIG;

  return { title, parser, data };
};

// TODO: LOCALIZE
const createBreachSection = breaches => {
  const parser = getParser(BREACH_SECTION_FIELDS);

  const data = breaches.map(breach => ({
    [BREACH_SECTION_FIELDS.TYPE]: CONFIG_TYPE_TO_NAME[breach.type],
    [BREACH_SECTION_FIELDS.START]: moment(breach.startTimestamp).format('DD/MM/YYYY hh:mm:ss a'),
    [BREACH_SECTION_FIELDS.END]: breach.endTimestamp
      ? moment(breach.endTimestamp).format('DD/MM/YYYY hh:mm:ss a')
      : '',
    [BREACH_SECTION_FIELDS.DURATION]: `${breach.duration.humanize()} ${
      breach.endTimestamp ? '' : '(ongoing)'
    }`,
    [BREACH_SECTION_FIELDS.MIN_TEMPERATURE]: temperature(breach.minimumTemperature).format(),
    [BREACH_SECTION_FIELDS.MAX_TEMPERATURE]: temperature(breach.maximumTemperature).format(),
  }));

  const title = SECTION_TITLES.BREACHES;

  return { title, data, parser };
};

// TODO: LOCALIZE
const createLogSection = logs => {
  const parser = getParser(LOG_SECTION_FIELDS);

  const title = SECTION_TITLES.LOGS;
  const data = logs.map(log => ({
    [LOG_SECTION_FIELDS.TIMESTAMP]: moment(log.timestamp).format('DD/MM/YYYY hh:mm:ss a'),
    [LOG_SECTION_FIELDS.TEMPERATURE]: temperature(log.temperature).format(),
    [LOG_SECTION_FIELDS.BREACH]: log.breach ? 'Yes' : 'No',
    [LOG_SECTION_FIELDS.LOG_INTERVAL]: Math.round(log.logInterval / SECONDS.ONE_MINUTE),
  }));

  return { title, parser, data };
};

function Report() {
  this.sections = [];

  this.addSection = section => {
    this.sections.push(section);
  };

  this.build = options => {
    const { sectionBreak } = options;

    return this.sections
      .map(
        ({ title = '', parser, data }) =>
          `${title}\n${parser.parse(data)}${sectionBreak ? '\n\n' : ''}`
      )
      .join('');
  };
}

export const vaccineReport = async (sensor, user, comment) => {
  const report = new Report();

  const generalSection = await createGeneralSection(sensor, user, comment);
  const sensorSection = createLoggingSection(sensor);
  const sensorStatsSection = createSensorStatsSection(sensor);
  const breachConfigsSection = createBreachConfigSection(sensor?.breachConfigs);
  const breachSection = createBreachSection(sensor?.breaches.sorted('startTimestamp', false));
  const logSection = createLogSection(sensor?.logs.sorted('timestamp', false));

  report.addSection(generalSection);
  report.addSection(sensorSection);
  report.addSection(sensorStatsSection);
  report.addSection(breachConfigsSection);
  report.addSection(breachSection);
  report.addSection(logSection);

  const content = report.build({ sectionBreak: true });

  return content;
};

const writeReport = async content => {
  const directory = '/Download/mSupplyMobile_data';
  const now = moment().format('DD-MM-YYYY-HHmm');
  const file = `/${now}.csv`;
  const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

  try {
    await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
    await RNFS.writeFile(path, content, 'utf8');
    // eslint-disable-next-line no-empty
  } catch (e) {}

  return path;
};

// TODO: LOCALIZE
const getSubject = sensor => `Temperature log report for ${sensor.name ?? sensor.macAddress}`;

export const emailVaccineReport = async (sensor, user, comment, recipients) => {
  const content = await vaccineReport(sensor, user, comment);
  const path = await writeReport(content);
  const subject = getSubject(sensor);
  const attachments = [{ path, type: 'csv' }];
  const email = { recipients, subject, attachments };

  Mailer.mail(email, () => {});
};
