import { DOWNLOAD_ACTIONS } from '../../actions/Bluetooth/DownloadActions';

const initialState = () => ({
  isSyncingTemps: false,
});

export const DownloadReducer = (state = initialState(), action) => {
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
