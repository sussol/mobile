/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PageContentModal } from './PageContentModal';
import { SETTINGS_KEYS } from '../../settings';
import globalStyles, {
  APP_FONT_FAMILY,
  COMPONENT_HEIGHT,
  BACKGROUND_COLOR,
} from '../../globalStyles';
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
 * @prop {function}   settings  App settings object for storing the selected language
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
      <TouchableOpacity
        onPress={() => this.onSelectLanguage(rowKey)}
        style={localStyles.tableRow}
      >
        <Text style={[globalStyles.dataTableText, localStyles.dataTableText]}>{rowValue}</Text>
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
        title={modalStrings.select_a_language}
        {...modalProps}
      >
        <View>
          <Text style={localStyles.currentLanguageText}>
            {modalStrings.current_language}: {currentLanguage}
          </Text>
          <ListView
            style={localStyles.ListView}
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

const localStyles = StyleSheet.create({
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
    justifyContent: 'center',
    height: COMPONENT_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
  },
  ListView: {
    height: 450,
    marginTop: 10,
    marginHorizontal: 200,
  },
});
