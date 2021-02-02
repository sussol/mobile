import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isSyncingTemps: false,
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

    default:
      return state;
  }
};
