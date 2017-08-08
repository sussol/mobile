/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { SUSSOL_ORANGE, BACKGROUND_COLOR } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const modalStyles = {
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    borderColor: 'white',
  },
  modalButtonText: {
    color: 'white',
  },
  modalOrangeButton: {
    borderColor: 'white',
    backgroundColor: SUSSOL_ORANGE,
  },
  modalTextInput: {
    flex: 2,
    paddingRight: 5,
    borderColor: BACKGROUND_COLOR,
    marginRight: 10,
  },
  modalText: {
    color: 'white',
    fontFamily: APP_FONT_FAMILY, // Doesn't affect the placeholder text - RN 0.27
  },
};
