import { BLINK_ACTIONS } from '../../actions/Bluetooth/BlinkActions';

const initialState = () => ({
  sendingBlinkTo: '',
});

export const BlinkReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
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
