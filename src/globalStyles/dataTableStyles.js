/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  Dimensions,
} from 'react-native';

import {
  BACKGROUND_COLOR,
  BLUE_WHITE,
  LIGHT_GREY,
  WARM_GREY,
  DARK_GREY,
  SUSSOL_ORANGE,
} from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const dataTableColors = {
  checkableCellDisabled: LIGHT_GREY,
  checkableCellChecked: SUSSOL_ORANGE,
  checkableCellUnchecked: WARM_GREY,
  editableCellUnderline: WARM_GREY,
};

export const dataTableStyles = {
  text: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: Dimensions.get('window').width / 100,
    color: DARK_GREY,
  },
  header: {
    backgroundColor: 'white',
  },
  headerCell: {
    height: 40,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: 'white',
    borderColor: BLUE_WHITE,
  },
  row: {
    backgroundColor: BACKGROUND_COLOR,
  },
  expansion: {
    padding: 15,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: BLUE_WHITE,
  },
  expansionWithInnerPage: {
    padding: 2,
    paddingBottom: 5,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: BLUE_WHITE,
  },
  cell: {
    borderRightWidth: 2,
    borderColor: BLUE_WHITE,
  },
  rightMostCell: {
    borderRightWidth: 0,
  },
  checkableCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: SUSSOL_ORANGE,
  },
};
