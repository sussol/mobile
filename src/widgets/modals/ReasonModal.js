/* eslint-disable no-unused-expressions */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { ListView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PageContentModal } from './PageContentModal';

import { dataTableStyles, APP_FONT_FAMILY, COMPONENT_HEIGHT } from '../../globalStyles';

/**
 * A Modal that covers the page content using PageContentModal, and renders a ListView for selecting
 * from a list of available languages. This is persisted in the settings/realm.
 * @prop {boolean}    isOpen    Whether the modal is open
 * @prop {function}   onClose   A function to call if the close x is pressed
 * @prop {function}   settings  App settings object for storing the selected language
 */
export class ReasonModal extends React.Component {
  constructor(props) {
    super(props);
    const { database } = props;
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    const reasons = database.objects('Options');
    this.state = {
      dataSource: dataSource.cloneWithRows(reasons),
    };
  }

  onSelectReason = rowValue => {
    const { onClose, database, item } = this.props;
    if (!rowValue) {
      item.option ? onClose(item.option) : onClose(database.objects('Options')[0]);
    } else {
      onClose(rowValue);
    }
  };

  renderRow = rowValue => {
    const { item } = this.props;
    const { option } = item;

    let rowStyle;
    let textStyle;
    if (option && rowValue.id === option.id) {
      rowStyle = [localStyles.tableRow, { backgroundColor: '#e95c30' }];
      textStyle = [dataTableStyles.text, localStyles.dataTableText, { color: 'white' }];
    } else {
      rowStyle = localStyles.tableRow;
      textStyle = [dataTableStyles.text, localStyles.dataTableText];
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.onSelectReason(rowValue);
        }}
        style={rowStyle}
      >
        <Text style={textStyle}>{rowValue.title}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { isOpen } = this.props;
    const { dataSource } = this.state;

    const numberOfRows = dataSource.length;
    const listViewHeight = { height: numberOfRows * COMPONENT_HEIGHT };
    const listViewStyle = [localStyles.listView, listViewHeight];

    return (
      <PageContentModal
        isOpen={isOpen}
        onClose={() => this.onSelectReason(null)}
        title="Select a reason"
      >
        <View>
          <ListView style={listViewStyle} dataSource={dataSource} renderRow={this.renderRow} />
        </View>
      </PageContentModal>
    );
  }
}

export default ReasonModal;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
ReasonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  database: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  flagImage: {
    width: 55,
    height: 33,
  },
  currentLanguageText: {
    fontFamily: APP_FONT_FAMILY,
    color: 'white',
    fontSize: 20,
    marginHorizontal: 200,
  },
  dataTableText: {
    fontSize: 20,
    marginLeft: 20,
  },
  tableRow: {
    flexDirection: 'row',
    paddingLeft: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: COMPONENT_HEIGHT,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginHorizontal: 200,
    opacity: 1,
  },
});
