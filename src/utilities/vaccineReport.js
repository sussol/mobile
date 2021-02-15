import Mailer from 'react-native-mail';
import { Parser } from 'json2csv';
import RNFS from 'react-native-fs';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import temperature from './temperature';
import { SECONDS } from './constants';
import { UIDatabase } from '../database/index';
import { generalStrings, reportStrings, vaccineStrings } from '../localization/index';

const SECTION_TITLES = {
  LOGGING: reportStrings.title_logging,
  SENSOR_STATS: reportStrings.title_sensor_stats,
  BREACH_CONFIG: reportStrings.title_breach_config,
  BREACHES: reportStrings.title_breaches,
  LOGS: reportStrings.title_logs,
};

const CONFIG_TYPE_TO_NAME = {
  HOT_CONSECUTIVE: vaccineStrings.hot_consecutive,
  HOT_CUMULATIVE: vaccineStrings.hot_cumulative,
  COLD_CONSECUTIVE: vaccineStrings.cold_consecutive,
  COLD_CUMULATIVE: vaccineStrings.cold_cumulative,
};

const GENERAL_SECTION_FIELDS = {
  DEVICE: reportStrings.field_device,
  NAME: reportStrings.field_sensor_name,
  EXPORTER: reportStrings.field_exported_by,
  COMMENT: reportStrings.field_job_description,
};

const LOGGING_SECTION_FIELDS = {
  LOGGING_START: reportStrings.field_logging_start,
  LOGGING_INTERVAL: reportStrings.field_logging_interval,
};

const SENSOR_STATS_SECTION_FIELDS = {
  MAX_TEMPERATURE: reportStrings.field_max_temperature,
  MIN_TEMPERATURE: reportStrings.field_min_temperature,
  NUMBER_BREACHES: reportStrings.field_number_breaches,
};

const BREACH_CONFIG_SECTION_FIELDS = {
  TYPE: reportStrings.field_breach_type,
  DURATION: reportStrings.field_duration_threshold,
  TEMPERATURE: reportStrings.field_temperature_threshold,
};

const BREACH_SECTION_FIELDS = {
  TYPE: reportStrings.field_breach_type,
  START: reportStrings.field_starting_timestamp,
  END: reportStrings.field_ending_timestamp,
  DURATION: reportStrings.field_exposure_duration,
  MIN_TEMPERATURE: reportStrings.field_min_temperature,
  MAX_TEMPERATURE: reportStrings.field_max_temperature,
};

const LOG_SECTION_FIELDS = {
  TIMESTAMP: reportStrings.field_timestamp,
  TEMPERATURE: reportStrings.field_temperature,
  BREACH: vaccineStrings.consecutive_breach,
  LOG_INTERVAL: reportStrings.field_log_interval_minutes,
};

const getParser = fields => new Parser({ fields: Object.values(fields) });

const createGeneralSection = async (sensor, user, comment) => {
  const parser = getParser(GENERAL_SECTION_FIELDS);

  const device = await DeviceInfo.getModel();
  const data = {
    [GENERAL_SECTION_FIELDS.DEVICE]: device,
    [GENERAL_SECTION_FIELDS.NAME]: sensor.name ?? sensor.macAddress,
    [GENERAL_SECTION_FIELDS.EXPORTER]: `${user.firstName ?? ''} ${user.lastName ?? ''}`,
    [GENERAL_SECTION_FIELDS.COMMENT]: comment ?? '',
  };

  return { parser, data };
};

const createLoggingSection = sensor => {
  const title = SECTION_TITLES.LOGGING;

  const parser = getParser(SENSOR_STATS_SECTION_FIELDS);

  const data = {
    [LOGGING_SECTION_FIELDS.LOGGING_START]: moment(sensor.firstLog?.timestamp).format(
      'MMMM Do YYYY, h:mm:ss a'
    ),
    [LOGGING_SECTION_FIELDS.LOGGING_INTERVAL]: `${Math.round(
      sensor.logInterval / SECONDS.ONE_MINUTE
    )} ${generalStrings.minutes}`,
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

const createBreachConfigSection = breachConfigs => {
  const parser = getParser(BREACH_CONFIG_SECTION_FIELDS);

  const data = breachConfigs.map(config => ({
    [BREACH_CONFIG_SECTION_FIELDS.TYPE]: CONFIG_TYPE_TO_NAME[config?.type],
    [BREACH_CONFIG_SECTION_FIELDS.DURATION]: `${config.duration / 60} ${generalStrings.minutes}`,
    [BREACH_CONFIG_SECTION_FIELDS.TEMPERATURE]: config.type.includes('HOT')
      ? `${generalStrings.above} ${temperature(config.minimumTemperature).format()}`
      : `${generalStrings.below} ${temperature(config.maximumTemperature).format()}`,
  }));

  const title = SECTION_TITLES.BREACH_CONFIG;

  return { title, parser, data };
};

const createBreachSection = breaches => {
  const parser = getParser(BREACH_SECTION_FIELDS);

  const data = breaches.map(breach => ({
    [BREACH_SECTION_FIELDS.TYPE]: CONFIG_TYPE_TO_NAME[breach.type],
    [BREACH_SECTION_FIELDS.START]: moment(breach.startTimestamp).format('DD/MM/YYYY hh:mm:ss a'),
    [BREACH_SECTION_FIELDS.END]: breach.endTimestamp
      ? moment(breach.endTimestamp).format('DD/MM/YYYY hh:mm:ss a')
      : '',
    [BREACH_SECTION_FIELDS.DURATION]: `${breach.duration.humanize()} ${
      breach.endTimestamp ? '' : `(${generalStrings.ongoing})`
    }`,
    [BREACH_SECTION_FIELDS.MIN_TEMPERATURE]: temperature(breach.minimumTemperature).format(),
    [BREACH_SECTION_FIELDS.MAX_TEMPERATURE]: temperature(breach.maximumTemperature).format(),
  }));

  const title = SECTION_TITLES.BREACHES;

  return { title, data, parser };
};

const createLogSection = logs => {
  const parser = getParser(LOG_SECTION_FIELDS);

  const title = SECTION_TITLES.LOGS;
  const data = logs.map(log => ({
    [LOG_SECTION_FIELDS.TIMESTAMP]: moment(log.timestamp).format('DD/MM/YYYY hh:mm:ss a'),
    [LOG_SECTION_FIELDS.TEMPERATURE]: temperature(log.temperature).format(),
    [LOG_SECTION_FIELDS.BREACH]: log.breach ? generalStrings.yes : generalStrings.no,
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

const getSubject = sensor =>
  `${reportStrings.email_vaccine_report_subject} ${sensor.name ?? sensor.macAddress}`;

export const emailVaccineReport = async (macAddress, user, email, comment) => {
  const sensor = UIDatabase.get('Sensor', macAddress, 'macAddress');

  if (!sensor) throw new Error('Cannot find sensor');
  if (sensor?.logs <= 0) throw new Error('No temperature logs');

  const content = await vaccineReport(sensor, user, comment);
  const path = await writeReport(content);
  const subject = getSubject(sensor);
  const attachments = [{ path, type: 'csv' }];
  const emailOptions = { recipients: [email], subject, attachments };

  Mailer.mail(emailOptions, () => {});
};
