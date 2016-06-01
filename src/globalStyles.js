/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  StyleSheet,
} from 'react-native';
const appFontFamily = 'OpenSans';
const sussolOrange = '#e95c30';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContentContainer: {
    flex: 1,
    margin: 15,
    backgroundColor: '#ecf3fc',
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
    fontFamily: appFontFamily,
    fontSize: 16,
  },
  buttonText: {
    fontFamily: appFontFamily,
    fontSize: 17,
    fontWeight: '500',
    color: sussolOrange,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: sussolOrange,
  },
  menuButtonText: {
    fontFamily: appFontFamily,
    fontSize: 17,
    fontWeight: '500',
    color: '#333333',
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  dataTableText: {
    fontFamily: appFontFamily,
    fontSize: 14,
    marginLeft: 20,
    textAlign: 'left',
  },
  dataTableDropDown: {
    marginHorizontal: 15,
  },
  dataTableHeader: {
    height: 40,
    backgroundColor: '#ffffff',
  },
  dataTableHeaderCell: {
    height: 40,
    borderRightWidth: 2,
    backgroundColor: '#ffffff',
    borderColor: '#ecf3fc',
  },
  dataTableRow: {
    backgroundColor: '#ffffff',
  },
  dataTableCell: {
    height: 40,
    backgroundColor: '#f8fbfe',
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
  },
  dataTableEditableCell: {
    backgroundColor: '#f9e4c2',
  },
  dataTableButton: {
    backgroundColor: '#ffdb9d',
    borderColor: '#fcb947',
    borderRadius: 8,
    borderWidth: 2,
  },
  appFontFamily: {
    fontFamily: appFontFamily,
  },
  appOrangeBorder: {
    borderColor: sussolOrange,
  },
});
