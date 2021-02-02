import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const LAST_DOWNLOAD_STATUS = {
  OK: 'OK',
  ERROR: 'ERROR',
};

const initialState = () => ({
  isSyncingTemps: false,
  setLogIntervalFor: '',
  downloadingLogsFrom: '',
  lastDownloadStatus: {},
  lastDownloadTime: {},
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_ACTIONS.SENSOR_DOWNLOAD_START: {
      const { payload } = action;
      const { sensor } = payload;
      const { macAddress } = sensor;

      return { ...state, downloadingLogsFrom: macAddress };
    }

    case VACCINE_ACTIONS.SENSOR_DOWNLOAD_SUCCESS: {
      const { lastDownloadStatus, lastDownloadTime } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { macAddress } = sensor;

      const newLastDownloadStatus = {
        ...lastDownloadStatus,
        [macAddress]: LAST_DOWNLOAD_STATUS.OK,
      };

      const newLastDownloadTime = {
        ...lastDownloadTime,
        [macAddress]: new Date().getTime(),
      };

      return {
        ...state,
        lastDownloadStatus: newLastDownloadStatus,
        lastDownloadTime: newLastDownloadTime,
        downloadingLogsFrom: '',
      };
    }

    case VACCINE_ACTIONS.SENSOR_DOWNLOAD_ERROR: {
      const { lastDownloadStatus, lastDownloadTime } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { macAddress } = sensor;

      const newLastDownloadStatus = {
        ...lastDownloadStatus,
        [macAddress]: LAST_DOWNLOAD_STATUS.ERROR,
      };

      const newLastDownloadTime = {
        ...lastDownloadTime,
        [macAddress]: new Date().getTime(),
      };

      return {
        ...state,
        lastDownloadStatus: newLastDownloadStatus,
        lastDownloadTime: newLastDownloadTime,
        downloadingLogsFrom: '',
      };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, isSyncingTemps: true };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      return { ...state, isSyncingTemps: false };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, isSyncingTemps: false };
    }

    case VACCINE_ACTIONS.SET_LOG_INTERVAL_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, setLogIntervalFor: macAddress };
    }

    case VACCINE_ACTIONS.SET_LOG_INTERVAL_SUCCESS:
    case VACCINE_ACTIONS.SET_LOG_INTERVAL_ERROR: {
      return { ...state, setLogIntervalFor: '' };
    }

    case VACCINE_ACTIONS.DISABLE_BUTTON_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, sendingDisableButtonTo: macAddress };
    }

    case VACCINE_ACTIONS.DISABLE_BUTTON_STOP: {
      return { ...state, sendingDisableButtonTo: '' };
    }

    default:
      return state;
  }
};
