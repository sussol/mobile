/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { AutocompleteSelector, PageInfo, Button, ToggleBar } from '..';
import { PageContentModal } from './PageContentModal';

export class ByProgramModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchIsOpen: false,
      searchModalKey: 'supplier',
      isProgramOrder: true,
    };
  }

  onOrderToggle = () => {
    const { isProgramOrder } = this.state;
    this.setState({ isProgramOrder: !isProgramOrder });
  };

  getToggleBarProps = () => {
    const { type, isProgramOrder } = this.state;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return [
      {
        text: `Program ${buttonText}`,
        onPress: this.onOrderToggle,
        isOn: isProgramOrder,
      },
      {
        text: `General ${buttonText}`,
        onPress: this.onOrderToggle,
        isOn: !isProgramOrder,
      },
    ];
  };

  // Should capitalize, can be multiple words. Split on
  // white space, map returning word with capitalized first
  // letter, return joined. Same with main modal title
  getSearchModalTitle = () => {
    const { searchModalKey } = this.state;
    return `Select a ${searchModalKey} to use`;
  };

  getPageInfoProps = () => {
    const { values } = this.props;
    const { program, supplier, orderType, period } = values;
    return {
      program: {
        info: `${program.name || 'Select the program to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'program' });
        },
        editableType: 'selectable',
      },
      supplier: {
        title: '',
        info: `${supplier.name || 'Select the supplier to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'supplier' });
        },
        editableType: 'selectable',
      },
      orderTypes: {
        title: '',
        info: `${orderType.name || 'Select the order type to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'orderType' });
        },
        editableType: 'selectable',
      },
      period: {
        title: '',
        info: `${period.name || 'Select the Period to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'period' });
        },
        editableType: 'selectable',
      },
    };
  };

  selectSearchValue = valueSetterParams => {
    const { valueSetter } = this.props;
    this.setState({ searchIsOpen: false });
    valueSetter(valueSetterParams);
  };

  getSearchModalProps = database => ({
    program: {
      options: database.objects('MasterList'),
      queryString: 'name BEGINSWITH[c] $0 ',
      sortByString: 'name',
      onSelect: item => this.selectSearchValue({ key: 'program', item }),
      renderLeftText: item => `${item.name}`,
    },
    supplier: {
      options: database.objects('Name').filtered('isSupplier == $0', true),
      queryString: 'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0',
      sortByString: 'name',
      onSelect: item => this.selectSearchValue({ key: 'supplier', item }),
      renderLeftText: item => `${item.name}`,
    },
    orderType: {
      options: database.objects('Item'),
      queryString: 'name BEGINSWITH[c] $0',
      sortByString: 'name',
      onSelect: item => this.selectSearchValue({ key: 'orderType', item }),
      renderLeftText: item => `${item.name}`,
    },
    period: {
      options: database.objects('Item'),
      queryString: 'name BEGINSWITH[c] $0',
      sortByString: 'name',
      onSelect: item => this.selectSearchValue({ key: 'period', item }),
      renderLeftText: item => `${item.name}`,
    },
  });

  onSearchModalConfirm = ({ key, item }) => {
    this.setState({ searchIsOpen: false, [key]: item });
  };

  onSearchModalCancel = () => {
    this.setState({ searchIsOpen: false });
  };

  renderSearchModal = () => {
    const { searchModalKey } = this.state;
    const { database } = this.props;
    const { [searchModalKey]: modalProps } = this.getSearchModalProps(database);
    return (
      <AutocompleteSelector
        options={modalProps.options}
        queryString={modalProps.queryString}
        sortByString={modalProps.sortByString}
        onSelect={modalProps.onSelect}
        renderLeftText={modalProps.renderLeftText}
        renderRightText={modalProps.renderRightText}
      />
    );
  };

  renderPageInfo = () => {
    const { isProgramOrder } = this.state;
    const { type } = this.props;
    return (
      <>
        {isProgramOrder && (
          <>
            <PageInfo columns={[[this.getPageInfoProps().program]]} isEditingDisabled={false} />
            <PageInfo columns={[[this.getPageInfoProps().supplier]]} isEditingDisabled={false} />
          </>
        )}
        {type === 'requisition' && isProgramOrder && (
          <>
            <PageInfo columns={[[this.getPageInfoProps().orderTypes]]} isEditingDisabled={false} />
            <PageInfo columns={[[this.getPageInfoProps().period]]} isEditingDisabled={false} />
          </>
        )}
      </>
    );
  };

  render() {
    const { onConfirm, onCancel, isOpen, type } = this.props;
    const { searchIsOpen } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        style={[globalStyles.modal, localStyles.modal]}
        backdropPressToClose={false}
        backdropOpacity={0.88}
        swipeToClose={false}
        position="top"
        coverScreen
      >
        <TouchableOpacity onPress={onCancel} style={localStyles.closeButton}>
          <Icon name="md-close" style={localStyles.closeIcon} />
        </TouchableOpacity>

        <Text style={localStyles.title}>{`${type} details`}</Text>

        <View style={localStyles.toggleContainer}>
          <ToggleBar
            style={globalStyles.toggleBar}
            textOffStyle={globalStyles.toggleText}
            textOnStyle={globalStyles.toggleTextSelected}
            toggleOffStyle={globalStyles.toggleOption}
            toggleOnStyle={globalStyles.toggleOptionSelected}
            toggles={this.getToggleBarProps()}
          />
        </View>

        <View style={localStyles.contentContainer}>{this.renderPageInfo()}</View>
        <View style={localStyles.grow} />
        <View style={localStyles.bottomContainer}>
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

        <PageContentModal
          isOpen={searchIsOpen}
          onClose={this.onSearchModalCancel}
          title={this.getSearchModalTitle()}
          coverScreen
        >
          {this.renderSearchModal()}
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
    opacity: 1,
    zIndex: 1,
    position: 'absolute',
    overflow: 'hidden',
    flexGrow: 1,
  },
  toggleContainer: {
    width: 292,
    alignSelf: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  contentContainer: {
    width: '50%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxHeight: '30%',
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
  OKButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  OKButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomContainer: {
    bottom: 0,
    right: 0,
    position: 'absolute',
    flex: 1,
    flexDirection: 'row',
  },
  grow: {
    flexGrow: 2,
  },
});

ByProgramModal.propTypes = {
  database: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  valueSetter: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};
