/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { BACKGROUND_COLOR, SUSSOL_ORANGE, WARMER_GREY } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const authStyles = {
  authFormModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'flex-start',
  },
  authFormTextInputStyle: {
    flex: 1,
    marginHorizontal: 60,
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
  },
  authFormContainer: {
    flex: 1,
    marginTop: 80,
    marginHorizontal: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    elevation: 3,
    borderColor: WARMER_GREY,
    borderWidth: 1,
    borderRadius: 1,
  },
  authFormButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  authFormButtonContainer: {
    alignSelf: 'stretch',
  },
  authFormButtonText: {
    color: 'white',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    fontSize: 22,
    marginVertical: 15,
  },
  authFormLogo: {
    marginTop: 30,
    marginBottom: 60,
  },
  loginButton: {
    marginTop: 60,
  },
};
