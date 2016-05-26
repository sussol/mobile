/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  StyleSheet,
} from 'react-native';

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
    fontSize: 16,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#e95c30',
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: '#e95c30',
  },
  menuButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333333',
  },
  menuButton: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  navButton: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  searchBar: {
    width: 500,
    marginHorizontal: 15,
    borderBottomWidth: 2,
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
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    fontFamily: 'Comic Sans',
  },
});
