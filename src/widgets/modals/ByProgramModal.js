/* eslint-disable indent */
/* eslint-disable prefer-destructuring */
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
import { SETTINGS_KEYS } from '../../settings';

export class ByProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchIsOpen: false,
      searchModalKey: 'supplier',
    };
  }

  getToggleBarProps = () => {
    const { onToggleChange, isProgramOrder, type } = this.props;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return [
      {
        text: `Program ${buttonText}`,
        onPress: onToggleChange,
        isOn: isProgramOrder,
      },
      {
        text: `General ${buttonText}`,
        onPress: onToggleChange,
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

  selectSearchValue = ({ key, item }) => {
    const { valueSetter } = this.props;
    this.setState({ searchIsOpen: false });
    valueSetter({ key, item });
  };

  getSearchModalOptions = () => {
    const { programValues, settings, database } = this.props;
    const { program, orderType } = programValues;
    const tags = settings.get(SETTINGS_KEYS.THIS_STORE_TAGS);
    let orderTypes;
    let periodScheduleName;
    if (program.name) {
      const storeTagObject = program.getStoreTagObject(tags);
      orderTypes = storeTagObject.orderTypes;
      periodScheduleName = storeTagObject.periodScheduleName;
    }

    return {
      programOptions: database
        .objects('MasterList')
        .filtered('isProgram = $0', true)
        .filter(masterList => masterList.canUseProgram(tags)),
      supplierOptions: database.objects('Name').filtered('isSupplier = $0', true),
      orderTypeOptions: orderTypes,
      periodOptions: periodScheduleName
        ? database
            .objects('PeriodSchedule')
            .filtered('name = $0', periodScheduleName)[0]
            .getUseablePeriodsForProgram(program, orderType.maxOrdersPerPeriod)
        : database.objects('Period'),
    };
  };

  getSearchModalProps = () => {
    const { programValues } = this.props;
    const { program } = programValues;
    const {
      programOptions,
      supplierOptions,
      orderTypeOptions,
      periodOptions,
    } = this.getSearchModalOptions();

    return {
      program: {
        options: programOptions,
        queryString: 'name BEGINSWITH[c] $0 ',
        sortByString: 'name',
        onSelect: item => this.selectSearchValue({ key: 'program', item }),
        renderLeftText: item => `${item.name}`,
      },
      supplier: {
        options: supplierOptions,
        queryString: 'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0',
        sortByString: 'name',
        onSelect: item => this.selectSearchValue({ key: 'supplier', item }),
        renderLeftText: item => `${item.name}`,
        renderRightText: item => `(${item.code})`,
      },
      orderType: {
        options: orderTypeOptions,
        queryString: 'name BEGINSWITH[c] $0',
        sortByString: 'name',
        onSelect: item => this.selectSearchValue({ key: 'orderType', item }),
        renderLeftText: item => `${item.name}`,
        renderRightText: item =>
          `Max Months of stock: ${item.maxMOS} - Threshold Months of stock: ${item.thresholdMOS}`,
      },
      period: {
        options: periodOptions,
        queryString: 'name BEGINSWITH[c] $0',
        sortByString: 'name',
        onSelect: item => this.selectSearchValue({ key: 'period', item }),
        renderLeftText: item => `${item.name}`,
        renderRightText: item =>
          `${item.getFormattedPeriod()} -- [${item.numberOfRequisitionsForProgram(
            program
          )}] Requisition(s)`,
      },
    };
  };

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

  getPageInfoProps = () => {
    const { programValues } = this.props;
    const { program, supplier, orderType, period } = programValues;
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

  getProgress = () => {
    const { programValues, isProgramOrder, type } = this.props;
    const { program, supplier, period, orderType } = programValues;
    const complete =
      isProgramOrder && !!program.name && !!supplier.name && !!period.name && !!orderType.name;
    return {
      canConfirm: complete || (!isProgramOrder && supplier.name),
      canSelectSupplier: !(isProgramOrder && !program.name),
      canSelectOrderType: !!supplier.name,
      canSelectPeriod: !!orderType.name,
      isRequisitionProgramOrder: type === 'requisition' && isProgramOrder,
    };
  };

  renderPageInfo = () => {
    const { isProgramOrder } = this.props;
    const {
      canSelectSupplier,
      canSelectOrderType,
      canSelectPeriod,
      isRequisitionProgramOrder,
    } = this.getProgress();
    return (
      <>
        {isProgramOrder && (
          <PageInfo columns={[[this.getPageInfoProps().program]]} isEditingDisabled={false} />
        )}
        <PageInfo
          columns={[[this.getPageInfoProps().supplier]]}
          isEditingDisabled={!canSelectSupplier}
        />
        {isRequisitionProgramOrder && (
          <>
            <PageInfo
              columns={[[this.getPageInfoProps().orderTypes]]}
              isEditingDisabled={!canSelectOrderType}
            />
            <PageInfo
              columns={[[this.getPageInfoProps().period]]}
              isEditingDisabled={!canSelectPeriod}
            />
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
            isDisabled={!this.getProgress().canConfirm}
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
  settings: PropTypes.object.isRequired,
  programValues: PropTypes.object.isRequired,
  isProgramOrder: PropTypes.bool.isRequired,
  onToggleChange: PropTypes.func.isRequired,
};
