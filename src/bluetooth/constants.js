export const BLUETOOTH = {
  MANUFACTURER_ID: 307,
  DELIMITER_A: 11776,
  DELIMITER_B: 11308,
  TEMPERATURE_DIVISOR: 10.0,
  SERVICE: {
    UART: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  },
  CHARACTERISTIC: {
    UART_WRITE: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    UART_READ: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  },
  SCAN_MODE: {
    LOW_LATENCY: 2,
  },
  COMMANDS: {
    BLINK: '*blink',
    DOWNLOAD: '*logall',
    INFO: '*info',
    UPDATE_LOG_INTERVAL: '*lint',
    DISABLE_BUTTON: '*bd',
  },
};
