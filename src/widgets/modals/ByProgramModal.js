/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
// import { Button, ToggleBar } from '../index';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { PageInfo, Button, ToggleBar } from '..';
import { pageInfoStrings } from '../../localization';
import AutocompleteSelector from '../AutocompleteSelector';
import PageContentModal from './PageContentModal';

export class ByProgramModal extends React.Component {
  // Page info props
  selectProgramPageInfo = [
    [
      {
        title: 'Select the program to use',
        info: 'Select the program to use',
        onPress: () => {
          this.setState({ searchIsOpen: true });
        },
        editableType: 'selectable',
      },
    ],
  ];

  selectOrderTypePageInfo = [
    [
      {
        title: `${pageInfoStrings.their_ref}:`,
        info: 'Select the supplier to use',
        onPress: () => {},
        editableType: 'selectable',
      },
    ],
  ];

  selectSupplierPageInfo = [
    [
      {
        title: `${pageInfoStrings.their_ref}:`,
        info: 'Select the order type to use',
        onPress: () => {},
        editableType: 'selectable',
      },
    ],
  ];

  selectPeriodPageInfo = [
    [
      {
        title: `${pageInfoStrings.their_ref}:`,
        info: 'Select the period to use',
        onPress: () => {},
        editableType: 'selectable',
      },
    ],
  ];

  constructor(props) {
    super(props);

    this.state = {
      searchIsOpen: false,
    };
  }

  onSelectProgram = () => {
    this.setState({ searchIsOpen: true });
  };

  render() {
    const { onConfirm, onCancel, database, isOpen } = this.props;
    const { searchIsOpen } = this.state;
    return (
      <Modal
        isOpen={isOpen}
        style={[globalStyles.modal, localStyles.modal]}
        backdropPressToClose={false}
        backdropOpacity={0.1}
        swipeToClose={false}
        position="top"
      >
        <TouchableOpacity onPress={onCancel} style={localStyles.closeButton}>
          <Icon name="md-close" style={localStyles.closeIcon} />
        </TouchableOpacity>

        <View style={localStyles.grow} />

        <View style={localStyles.border}>
          <Text style={localStyles.progressDescription}>Requisition Details</Text>

          <View style={localStyles.toggleContainer}>
            <ToggleBar
              style={globalStyles.toggleBar}
              textOffStyle={globalStyles.toggleText}
              textOnStyle={globalStyles.toggleTextSelected}
              toggleOffStyle={globalStyles.toggleOption}
              toggleOnStyle={globalStyles.toggleOptionSelected}
              toggles={[
                {
                  text: 'Program Order',
                  onPress: () => {},
                  isOn: true,
                },
                {
                  text: 'General Order',
                  onPress: () => {},
                  isOn: false,
                },
              ]}
            />
          </View>

          <View style={localStyles.contentContainer}>
            <PageInfo columns={this.selectProgramPageInfo} isEditingDisabled={false} />
            <PageInfo columns={this.selectSupplierPageInfo} isEditingDisabled={false} />
            <PageInfo columns={this.selectOrderTypePageInfo} isEditingDisabled={false} />
            <PageInfo columns={this.selectPeriodPageInfo} isEditingDisabled={false} />
          </View>
        </View>

        <View style={localStyles.bottomContainer}>
          <View style={localStyles.grow} />

          <Button
            text="CANCEL"
            onPress={onCancel}
            disabledColor={WARM_GREY}
            isDisabled={false}
            style={globalStyles.button}
            textStyle={globalStyles.buttonText}
          />
          <Button
            text="OK"
            onPress={onConfirm}
            disabledColor={WARM_GREY}
            isDisabled={false}
            style={[globalStyles.button, localStyles.OKButton]}
            textStyle={[globalStyles.buttonText, localStyles.OKButtonText]}
          />
        </View>
        <PageContentModal isOpen={searchIsOpen} onClose={() => {}} title="title">
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => {
              this.addNewLine(item);
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        </PageContentModal>
      </Modal>
    );
  }
}

export default ByProgramModal;

const localStyles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
    zIndex: 1,
    position: 'absolute',
  },
  toggleContainer: {
    width: 292,
    alignSelf: 'center',
    marginTop: 20,
  },
  progressDescription: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  border: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: SUSSOL_ORANGE,
    borderRadius: 20,
  },
  contentContainer: {
    width: '30%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '30%',
    marginRight: '5%',
    marginTop: '5%',
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  toggled: {
    width: '100%',
  },
  OKButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  OKButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '20%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    margin: 'auto',
  },
  grow: {
    flexGrow: 2,
  },
});

ByProgramModal.propTypes = {};

ByProgramModal.defaultProps = {};
