import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isSyncingTemps: false,
  setLogIntervalFor: '',
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
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
