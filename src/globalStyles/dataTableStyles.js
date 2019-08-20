/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { Dimensions } from 'react-native';

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
    flexDirection: 'row',
  },
  headerCell: {
    height: 40,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: 'white',
    borderColor: BLUE_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },
  alternateRow: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    height: 45,
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
    flex: 1,
    justifyContent: 'center',
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
  headerCells: {
    left: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    right: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    center: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  cellContainer: {
    left: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'left',
    },
    right: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'right',
    },
    center: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
    },
  },
  cellText: {
    left: {
      marginLeft: 20,
      textAlign: 'left',
      fontFamily: APP_FONT_FAMILY,
      fontSize: Dimensions.get('window').width / 100,
      color: DARK_GREY,
    },
    right: {
      marginRight: 20,
      textAlign: 'right',
      fontFamily: APP_FONT_FAMILY,
      fontSize: Dimensions.get('window').width / 100,
      color: DARK_GREY,
    },
    center: {
      textAlign: 'center',
      fontFamily: APP_FONT_FAMILY,
      fontSize: Dimensions.get('window').width / 100,
      color: DARK_GREY,
    },
  },
  touchableCellContainer: {
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editableCellTextView: {
    borderBottomColor: '#cbcbcb',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    width: '88%',
    maxHeight: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 20,
  },
  editableCellText: {
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
    fontSize: Dimensions.get('window').width / 100,
    color: DARK_GREY,
  },
};
