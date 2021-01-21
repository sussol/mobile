import TemperatureLogManager from './TemperatureLogManager';

describe('DownloadManager: calculateNumberOfLogsToSave', () => {
  it('Calculates correctly when the next possible log time is less than the time now', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    let nextPossibleLogTime = 0;
    let logInterval = 300;
    let timeNow = 600;

    // Can download logs for 0, 300 & 600.
    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(3);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(2);
  });
  it('Calculates correctly when the next Download time is after the time now', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    let nextPossibleLogTime = 300;
    let logInterval = 300;
    let timeNow = 299;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(0);

    nextPossibleLogTime = 1;
    logInterval = 300;
    timeNow = 0;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(0);
  });

  it('Calculates correctly using the log interval for additional logs', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    let nextPossibleLogTime = 0;
    let logInterval = 300;
    let timeNow = 301;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(2);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(2);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 600;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(3);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 601;

    expect(
      downloadManager.calculateNumberOfLogsToSave(logInterval, nextPossibleLogTime, timeNow)
    ).toBe(3);
  });
});

describe('DownloadManager: createLogs', () => {
  it('Creates logs with the correct timestamps when starting from no most recent logs.', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    // The time now is 600 and the most recent log downloaded was at 0 with a logging interval
    // of 300, the behaviour should show that we have logs for 300 and 600 to download and save.
    // In the array of logs passed, there are actually 3. It would be impossible for there to be
    // a log for anytime past 600, so we assume any excess logs are passed records which have been
    // saved previously and just save the two 'most recent'.
    const sensor = { id: 'a', logInterval: 300 };
    const MILLISECONDS_PER_SECOND = 1000;
    const maxNumberToSave = 3;
    const mostRecentLogTime = null;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 10 }, { temperature: 10 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(0 * MILLISECONDS_PER_SECOND),
        sensor,
        logInterval: 300,
      },
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(300 * MILLISECONDS_PER_SECOND),
        sensor,
        logInterval: 300,
      },
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(600 * MILLISECONDS_PER_SECOND),
        sensor,
        logInterval: 300,
      },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
  it('Creates logs with the correct timestamps when there exists other most recent logs.', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const MILLISECONDS_PER_SECOND = 1000;
    const maxNumberToSave = 1;
    const mostRecentLogTime = 1;
    const timeNow = 600;

    // In this case, there already exists a record that's been recorded at 1. So there can only
    // be one record that exists that we have not downloaded and saved - the record at 301 - given
    // the logging interval of 300 and the time now @ 600 (with the next record being due at 601).
    const logs = [{ temperature: 10 }, { temperature: 11 }, { temperature: 12 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 12,
        timestamp: new Date(301 * MILLISECONDS_PER_SECOND),
        sensor,
        logInterval: 300,
      },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
  it('Creates the correct number of logs', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const MILLISECONDS_PER_SECOND = 1000;
    const maxNumberToSave = 1;
    const mostRecentLogTime = 0;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 10 }, { temperature: 10 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(300 * MILLISECONDS_PER_SECOND),
        sensor,
        logInterval: 300,
      },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
});
