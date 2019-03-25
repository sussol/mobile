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
import { modalStrings } from '../../localization';
import { TextInput } from '../TextInput';

export class ByProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchIsOpen: false,
      searchModalKey: 'supplier',
    };
  }

  getToggleBarProps = () => {
    const { onToggleChange, isProgramBased, type } = this.props;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return [
      {
        text: `Program ${buttonText}`,
        onPress: onToggleChange,
        isOn: isProgramBased,
      },
      {
        text: `General ${buttonText}`,
        onPress: onToggleChange,
        isOn: !isProgramBased,
      },
    ];
  };

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
    const { programValues, type } = this.props;
    const { program, supplier, orderType, period } = programValues;
    return {
      program: {
        title: program.name ? (
          <Icon name="md-checkmark" style={{ color: 'green' }} size={16} />
        ) : (
          <Text style={{ color: 'white' }}>1</Text>
        ),
        info: `${program.name || 'Select the program to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'program' });
        },
        editableType: 'selectable',
      },
      supplier: {
        title: supplier.name ? (
          <Icon name="md-checkmark" style={{ color: 'green' }} size={16} />
        ) : (
          <Text style={{ color: 'white' }}>{type === 'requisition' ? 2 : 1}</Text>
        ),
        info: `${supplier.name || 'Select the supplier to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'supplier' });
        },
        editableType: 'selectable',
      },
      orderTypes: {
        title: orderType.name ? (
          <Icon name="md-checkmark" style={{ color: 'green' }} size={16} />
        ) : (
          <Text style={{ color: 'white' }}>3</Text>
        ),
        info: `${orderType.name || 'Select the order type to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'orderType' });
        },
        editableType: 'selectable',
      },
      period: {
        title: period.name ? (
          <Icon name="md-checkmark" style={{ color: 'green' }} size={16} />
        ) : (
          <Text style={{ color: 'white' }}>4</Text>
        ),
        info: `${period.name || 'Select the Period to use'}`,
        onPress: () => {
          this.setState({ searchIsOpen: true, searchModalKey: 'period' });
        },
        editableType: 'selectable',
      },
    };
  };

  getProgress = () => {
    const { programValues, isProgramBased, type } = this.props;
    const { program, supplier, period, orderType } = programValues;
    const complete =
      isProgramBased && !!program.name && !!supplier.name && !!period.name && !!orderType.name;
    return {
      canConfirm:
        complete ||
        (!isProgramBased && supplier.name) ||
        ((type === 'stocktake' && program.name) || (type === 'stocktake' && !isProgramBased)),
      canSelectSupplier: !(isProgramBased && !program.name),
      canSelectOrderType: !!supplier.name,
      canSelectPeriod: !!orderType.name,
      isRequisitionProgramOrder: type === 'requisition' && isProgramBased,
    };
  };

  renderPageInfo = () => {
    const { isProgramBased, onConfirm, type } = this.props;
    const {
      canSelectSupplier,
      canSelectOrderType,
      canSelectPeriod,
      isRequisitionProgramOrder,
    } = this.getProgress();
    return (
      <>
        {isProgramBased && (
          <PageInfo columns={[[this.getPageInfoProps().program]]} isEditingDisabled={false} />
        )}
        {type === 'requisition' && (
          <PageInfo
            columns={[[this.getPageInfoProps().supplier]]}
            isEditingDisabled={!canSelectSupplier}
          />
        )}
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
        <Button
          text="OK"
          onPress={onConfirm}
          disabledColor={WARM_GREY}
          isDisabled={!this.getProgress().canConfirm}
          style={[globalStyles.button, localStyles.OKButton]}
          textStyle={[globalStyles.buttonText, localStyles.OKButtonText]}
        />
      </>
    );
  };

  render() {
    const { onCancel, isOpen, type, valueSetter, isProgramBased, name } = this.props;
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

        <Text style={localStyles.title}>{`Create a ${type}`}</Text>

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
        {isProgramBased && type === 'stocktake' && (
          <View style={localStyles.textInput}>
            <TextInput
              style={globalStyles.modalTextInput}
              textStyle={globalStyles.modalText}
              underlineColorAndroid="transparent"
              placeholderTextColor="white"
              placeholder={modalStrings.give_your_stocktake_a_name}
              value={name}
              onChangeText={text => valueSetter({ key: 'name', item: text })}
            />
          </View>
        )}
        <View style={localStyles.contentContainer}>{this.renderPageInfo()}</View>
        <View style={localStyles.grow} />
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
    justifyContent: 'center',
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
    width: '30%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',

    marginTop: '2%',
    maxHeight: '30%',
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
    marginTop: 100,
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
  textInput: {
    justifyContent: 'space-between',
    paddingLeft: 20,
    maxHeight: 35,
    minWidth: 500,
    marginTop: '2%',
  },
});

ByProgramModal.defaultProps = {
  name: '',
};

ByProgramModal.propTypes = {
  database: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  valueSetter: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  programValues: PropTypes.object.isRequired,
  isProgramBased: PropTypes.bool.isRequired,
  onToggleChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};
