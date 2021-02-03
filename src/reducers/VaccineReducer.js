import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isSyncingTemps: false,
  error: null,
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, isSyncingTemps: true, error: null };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      const { payload } = action;
      const { error } = payload;
      return { ...state, isSyncingTemps: false, error };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, isSyncingTemps: false, error: null };
    }

    default:
      return state;
  }
};
