/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  StyleSheet,
} from 'react-native';
const APP_FONT_FAMILY = 'Museo_Slab_500';
const SUSSOL_ORANGE = '#e95c30';
const BLUE_WHITE = '#ecf3fc';
const BACKGROUND_COLOR = '#f8fbfe';
const SHADOW_BORDER = 'rgba(0, 0, 0, 0.1)';
const DARK_GREY = '#4a4a4a';
const DARKER_GREY = '#333333';
const WARM_GREY = '#9b9b9b';
const ROW_BLUE = 'rgba(73, 143, 226, 0.05)';

export default StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: SHADOW_BORDER,
    backgroundColor: BLUE_WHITE,
  },
  pageContentContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: BACKGROUND_COLOR,
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBarOffset: {
    paddingTop: 68,
  },
  text: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
  },
  buttonText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: SUSSOL_ORANGE,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: SUSSOL_ORANGE,
  },
  menuButtonText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 17,
    color: DARKER_GREY,
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 12,
    marginHorizontal: 30,
    width: 240,
    height: 60,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: DARK_GREY,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderColor: DARK_GREY,
  },
  dataTableText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    marginLeft: 20,
    textAlign: 'left',
  },
  dataTableDropDown: {
    marginHorizontal: 15,
  },
  dataTableHeader: {
    backgroundColor: 'white',
  },
  dataTableHeaderCell: {
    height: 40,
    borderRightWidth: 2,
    backgroundColor: 'white',
    borderColor: BLUE_WHITE,
  },
  dataTableRow: {
    backgroundColor: 'white',
  },
  dataTableCell: {
    height: 45,
    backgroundColor: ROW_BLUE,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: BLUE_WHITE,
  },
  dataTableEditableCell: {
    backgroundColor: '#f9e4c2',
  },
  dataTableButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: SUSSOL_ORANGE,
  },
});

export {
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  BLUE_WHITE,
  BACKGROUND_COLOR,
  SHADOW_BORDER,
  DARK_GREY,
  DARKER_GREY,
  WARM_GREY,
  ROW_BLUE,
};
