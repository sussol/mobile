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
const BACKGROUND = '#f8fbfe';
const DARK = '#4a4a4a';
const DARKER = '#333333';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContentContainer: {
    flex: 1,
    margin: 15,
    backgroundColor: BLUE_WHITE,
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
    color: DARKER,
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
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
    height: 30,
    borderRightWidth: 2,
    backgroundColor: 'white',
    borderColor: BLUE_WHITE,
  },
  dataTableRow: {
    backgroundColor: 'white',
  },
  dataTableCell: {
    height: 40,
    backgroundColor: BACKGROUND,
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
  appFontFamily: {
    fontFamily: APP_FONT_FAMILY,
  },
  appOrangeBorder: {
    borderColor: SUSSOL_ORANGE,
  },
});
