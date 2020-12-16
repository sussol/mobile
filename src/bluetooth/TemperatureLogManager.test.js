import { TemperatureLogManager } from './TemperatureLogManager';

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
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(3);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
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
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(0);

    nextPossibleLogTime = 1;
    logInterval = 300;
    timeNow = 0;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
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
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(2);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(2);
  });
});

describe('DownloadManager: createLogs', () => {
  it('Creates logs with the correct timestamps', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const downloadManager = new TemperatureLogManager(dbService, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const maxNumberToSave = 3;
    const mostRecentLogTime = 0;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 10 }, { temperature: 10 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(0),
        sensor,
        logInterval: 300,
      },
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(300),
        sensor,
        logInterval: 300,
      },
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(600),
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
    const maxNumberToSave = 1;
    const mostRecentLogTime = 0;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 10 }, { temperature: 10 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 10,
        timestamp: new Date(600),
        sensor,
        logInterval: 300,
      },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
});
