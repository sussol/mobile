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
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: sussolOrange,
  },
  menuButtonText: {
    // fontFamily: appFontFamily,
    fontSize: 17,
    fontWeight: '500',
    color: '#333333',
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  navButton: {
    alignItems: 'center',
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
    backgroundColor: '#ffffff',
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
  searchBar: {
    borderColor: sussolOrange,
    fontFamily: appFontFamily,
  },
});
