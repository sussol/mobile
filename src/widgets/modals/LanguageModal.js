/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
  ListView,
  Text,
  TouchableOpacity,
} from 'react-native';

import { PageContentModal } from './PageContentModal';
import { SETTINGS_KEYS } from '../../settings';
import {
  LANGUAGE_KEYS,
  authStrings,
  buttonStrings,
  modalStrings,
  navStrings,
  pageInfoStrings,
  tableStrings,
} from '../../localization';

/**
 * A Modal that covers the page content using PageContentModal, and renders a ListView for selecting
 * from a list of available languages. This is persisted in the settings/realm.
 * @prop {boolean}    isOpen    Whether the modal is open
 * @prop {function}   onClose   A function to call if the close x is pressed
 */
export class LanguageModal extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      dataSource: dataSource.cloneWithRows(LANGUAGE_KEYS),
    };
    this.onSelectLanguage = this.onSelectLanguage.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  onSelectLanguage(rowKey) {
    this.props.settings.set(SETTINGS_KEYS.CURRENT_LANGUAGE, rowKey);
    authStrings.setLanguage(rowKey);
    buttonStrings.setLanguage(rowKey);
    modalStrings.setLanguage(rowKey);
    navStrings.setLanguage(rowKey);
    pageInfoStrings.setLanguage(rowKey);
    tableStrings.setLanguage(rowKey);
    this.props.onClose();
  }

  renderRow(rowValue, sectionId, rowKey) {
    return (
      // TODO: styles for these components and ListView, globalStyles where sensible.
      <TouchableOpacity onPress={() => this.onSelectLanguage(rowKey)}>
        <Text>{rowValue}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      settings,
      isOpen,
      onClose,
      ...modalProps,
    } = this.props;

    const currentLanguage = LANGUAGE_KEYS[settings.get(SETTINGS_KEYS.CURRENT_LANGUAGE)];

    return (
      <PageContentModal
        isOpen={isOpen}
        onClose={onClose}
        title="Select a Language"
        {...modalProps}
      >
        <View>
          <Text>Current Language: {currentLanguage}</Text>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
          />
        </View>
      </PageContentModal>
     );
  }
}

LanguageModal.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  onClose: React.PropTypes.func,
  settings: React.PropTypes.object.isRequired,
};
