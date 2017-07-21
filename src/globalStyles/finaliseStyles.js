/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { FINALISE_GREEN, SUSSOL_ORANGE, FINALISED_RED } from './colors';
import { APP_FONT_FAMILY } from './fonts';
import { PAGE_CONTENT_PADDING_HORIZONTAL } from './pageStyles';

export const finaliseStyles = {
  finaliseButton: {
    color: FINALISE_GREEN,
    fontSize: 40,
  },
  finaliseModal: {
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: 'transparent',
  },
  finaliseModalButtonContainer: {
    justifyContent: 'center',
  },
  finaliseModalButton: {
    marginHorizontal: 15,
    borderColor: 'white',
  },
  finaliseModalConfirmButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  finaliseModalButtonText: {
    color: 'white',
  },
  finaliseModalText: {
    color: 'white',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    marginHorizontal: 190,
  },
  finalisedLock: {
    color: FINALISED_RED,
    fontSize: 28,
    marginHorizontal: 8,
    bottom: 6,
  },
};
