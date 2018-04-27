/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { SUSSOL_ORANGE } from './colors';
import { APP_FONT_FAMILY } from './fonts';
import { PAGE_CONTENT_PADDING_HORIZONTAL } from './pageStyles';

export const confirmModalStyles = {
  confirmModal: {
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: 'transparent',
  },
  confirmModalButtonContainer: {
    justifyContent: 'center',
  },
  confirmModalButton: {
    marginHorizontal: 15,
    borderColor: 'white',
  },
  confirmModalConfirmButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  confirmModalButtonText: {
    color: 'white',
  },
  confirmModalText: {
    color: 'white',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    marginHorizontal: 190,
  },
};
