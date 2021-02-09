import { REHYDRATE } from 'redux-persist';
import { BLINK_ACTIONS } from '../../actions/Bluetooth/SensorBlinkActions';

const initialState = () => ({
  sendingBlinkTo: '',
});

export const SensorBlinkReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case REHYDRATE: {
      return initialState();
    }
    case BLINK_ACTIONS.BLINK_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, sendingBlinkTo: macAddress };
    }

    case BLINK_ACTIONS.BLINK_STOP: {
      return { ...state, sendingBlinkTo: '' };
    }
    default:
      return state;
  }
};
