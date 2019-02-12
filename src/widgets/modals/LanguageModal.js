/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, ListView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PageContentModal } from './PageContentModal';
import { SETTINGS_KEYS } from '../../settings';
import { COUNTRY_FLAGS, LANGUAGE_KEYS, modalStrings } from '../../localization';

import { dataTableStyles, APP_FONT_FAMILY, COMPONENT_HEIGHT } from '../../globalStyles';

/**
 * A Modal that covers the page content using PageContentModal, and renders a ListView for selecting
 * from a list of available languages. This is persisted in the settings/realm.
 * @prop {boolean}    isOpen    Whether the modal is open
 * @prop {function}   onClose   A function to call if the close x is pressed
 * @prop {function}   settings  App settings object for storing the selected language
 */
export class LanguageModal extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return r1 !== r2;
      },
    });
    this.state = {
      dataSource: dataSource.cloneWithRows(LANGUAGE_KEYS),
      currentLanguage: props.settings.get(SETTINGS_KEYS.CURRENT_LANGUAGE),
    };
    this.onSelectLanguage = this.onSelectLanguage.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  onSelectLanguage(rowKey) {
    const { settings, onClose } = this.props;

    settings.set(SETTINGS_KEYS.CURRENT_LANGUAGE, rowKey);
    this.setState({ currentLanguage: rowKey }, onClose);
  }

  renderRow(rowValue, sectionId, rowKey) {
    const { currentLanguage } = this.state;

    let rowStyle;
    let textStyle;
    if (currentLanguage === rowKey) {
      rowStyle = [localStyles.tableRow, { backgroundColor: '#e95c30' }];
      textStyle = [dataTableStyles.text, localStyles.dataTableText, { color: 'white' }];
    } else {
      rowStyle = localStyles.tableRow;
      textStyle = [dataTableStyles.text, localStyles.dataTableText];
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.onSelectLanguage(rowKey);
        }}
        style={rowStyle}
      >
        <Image style={localStyles.flagImage} source={COUNTRY_FLAGS[rowKey]} resizeMode="stretch" />
        <Text style={textStyle}>{rowValue}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { isOpen, onClose, ...modalProps } = this.props;
    const { dataSource } = this.state;

    const numberOfRows = Math.min(Object.keys(LANGUAGE_KEYS).length, 10);
    const listViewHeight = { height: numberOfRows * COMPONENT_HEIGHT };
    const listViewStyle = [localStyles.listView, listViewHeight];

    return (
      <PageContentModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalStrings.select_a_language}
        {...modalProps}
      >
        <View>
          <ListView style={listViewStyle} dataSource={dataSource} renderRow={this.renderRow} />
        </View>
      </PageContentModal>
    );
  }
}

export default LanguageModal;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
LanguageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  settings: PropTypes.object.isRequired,
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
