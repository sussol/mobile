import { DOWNLOAD_ACTIONS } from '../../actions/Bluetooth/SensorDownloadActions';

const initialState = () => ({
  isSyncingTemps: false,
});

export const SensorDownloadReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, isSyncingTemps: true };
    }

    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      return { ...state, isSyncingTemps: false };
    }

    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, isSyncingTemps: false };
    }

    default:
      return state;
  }
};
