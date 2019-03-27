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

import { PageContentModal } from './PageContentModal';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { AutocompleteSelector, PageInfo, Button, ToggleBar } from '..';

import { SETTINGS_KEYS } from '../../settings';
import { getAllPrograms, getAllPeriodsForProgram } from '../../utilities/byProgram';

const queryString = 'name BEGINSWITH[c] $0';
const sortByString = 'name';

const searchModalTitles = {
  program: 'Select a Program to use',
  supplier: 'Select a Supplier to use',
  orderType: 'Select a Order Type to use',
  period: 'Select a Period to use',
};

const progressSteps = {
  program: 1,
  supplier: 2,
  orderType: 3,
  period: 4,
};

const localization = {
  program: 'program',
  supplier: 'supplier',
  orderType: 'order type',
  period: 'period',
};

const updateState = (command, additionalState) => {
  let newState;
  switch (command) {
    case 'RESET_ALL':
      newState = {
        program: {},
        supplier: {},
        period: {},
        periods: null,
        orderType: {},
        orderTypes: null,
      };
      break;
    case 'SELECT_PROGRAM':
      newState = {
        period: {},
        orderType: {},
        orderTypes: null,
        periods: null,
        searchIsOpen: false,
      };
      break;
    case 'SELECT_SUPPLIER':
      newState = { searchIsOpen: false };
      break;
    case 'SELECT_ORDER_TYPE':
      newState = { period: {}, periods: null, searchIsOpen: false };
      break;
    case 'CLOSE_SEARCH_MODAL':
      newState = { searchIsOpen: false };
      break;
    case 'OPEN_SEARCH_MODAL':
      newState = { searchIsOpen: true };
      break;
    case 'SELECT_PERIOD':
      newState = { searchIsOpen: false };
      break;
    default:
      break;
  }
  if (additionalState) return newState;
  return newState;
};

export class ByProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchIsOpen: false,
      searchModalKey: 'supplier',
      isProgramBased: true,
      program: {},
      supplier: {},
      orderType: {},
      period: {},
      programs: null,
      suppliers: null,
      orderTypes: null,
      periods: null,
    };
  }

  componentDidMount = () => {
    const { settings, database } = this.props;
    const programs = getAllPrograms(settings, database);
    const suppliers = database.objects('Name').filtered('isSupplier = $0', true);
    this.setState({ programs, suppliers });
  };

  getProgramValues = () => {
    const { program, supplier, orderType, period } = this.state;
    return { program, supplier, orderType, period };
  };

  toggleChange = () => {
    const { isProgramBased } = this.state;
    this.setState({ ...updateState('RESET_ALL'), isProgramBased: !isProgramBased });
  };

  openSearchModal = searchModalKey => () => {
    this.setState({ ...updateState('OPEN_SEARCH_MODAL'), searchModalKey });
  };

  onSearchModalConfirm = ({ key, item }) => {
    this.setState({ ...updateState('CLOSE_SEARCH_MODAL'), [key]: item });
  };

  getProgress = () => {
    const { type } = this.props;
    const { program, supplier, period, orderType, isProgramBased } = this.state;
    const complete =
      isProgramBased && !!program.name && !!supplier.name && !!period.name && !!orderType.name;
    return {
      canConfirm: complete || (!isProgramBased && supplier.name),
      isRequisitionProgramOrder: type === 'requisition' && isProgramBased,
      program: true,
      supplier: !(isProgramBased && !program.name),
      orderType: !!supplier.name,
      period: !!orderType.name,
      programShow: isProgramBased,
      supplierShow: true,
      orderTypeShow: isProgramBased && type === 'requisition',
      periodShow: isProgramBased && type === 'requisition',
    };
  };

  selectSearchValue = ({ key, selectedItem }) => {
    const { settings, database } = this.props;
    const { program, storeTag } = this.state;

    switch (key) {
      case 'program':
        this.setState({
          ...updateState('SELECT_PROGRAM'),
          storeTag: selectedItem.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS)),
          orderTypes: selectedItem.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS))
            .orderTypes,
          program: selectedItem,
        });
        break;
      case 'supplier':
        this.setState({ ...updateState('SELECT_SUPPLIER'), supplier: selectedItem });
        break;
      case 'orderType':
        this.setState({
          ...updateState('SELECT_ORDER_TYPE'),
          periods: getAllPeriodsForProgram(database, program, storeTag, selectedItem),
          orderType: selectedItem,
        });
        break;
      case 'period':
        this.setState({
          ...updateState('SELECT_PERIOD'),
          period: selectedItem,
        });
        break;
      default:
        break;
    }
  };

  getBaseSearchModalProps = key => ({
    queryString,
    sortByString,
    primaryFilterProperty: 'name',
    renderLeftText: item => `${item.name}`,
    onSelect: selectedItem => this.selectSearchValue({ key, selectedItem }),
  });

  getSearchModalProps = () => {
    const { programs, suppliers, orderTypes, periods, program } = this.state;

    return {
      program: {
        ...this.getBaseSearchModalProps('program'),
        options: programs,
      },
      supplier: {
        ...this.getBaseSearchModalProps('supplier'),
        options: suppliers,
        renderRightText: item => `(${item.code})`,
      },
      orderType: {
        ...this.getBaseSearchModalProps('orderType'),
        options: orderTypes,
        renderRightText: item =>
          `Max MOS: ${item.maxMOS} - Threshold MOS: ${item.thresholdMOS} - Max order per period ${
            item.maxOrdersPerPeriod
          }`,
      },
      period: {
        ...this.getBaseSearchModalProps('period'),
        options: periods,
        renderRightText: item =>
          `${item.toString()} - ${item.requisitionsForProgram(program)} Requisition(s)`,
      },
    };
  };

  renderSearchModal = () => {
    const { searchModalKey } = this.state;
    const { database } = this.props;
    const { [searchModalKey]: modalProps } = this.getSearchModalProps(database);
    return <AutocompleteSelector {...modalProps} />;
  };

  getPageInfoBaseProps = key => {
    const programValues = this.getProgramValues();
    const { isRequisitionProgramOrder, ...progress } = this.getProgress();

    return {
      title: programValues[key].name ? (
        <Icon name="md-checkmark" style={{ color: 'green' }} size={20} />
      ) : (
        <Text style={{ color: 'white' }}>{isRequisitionProgramOrder ? progressSteps[key] : 1}</Text>
      ),
      info: programValues[key].name || `Select the ${localization[key]} to use`,
      onPress: this.openSearchModal(key),
      shouldShow: progress[`${key}Show`],
      canEdit: progress[key],
      editableType: 'selectable',
    };
  };

  getPageInfoProps = () =>
    Array.from(Object.keys(this.getProgramValues())).map(key => this.getPageInfoBaseProps(key));

  getToggleBarProps = () => {
    const { type } = this.props;
    const { isProgramBased } = this.state;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return [
      { text: `Program ${buttonText}`, onPress: this.toggleChange, isOn: isProgramBased },
      { text: `General ${buttonText}`, onPress: this.toggleChange, isOn: !isProgramBased },
    ];
  };

  render() {
    const { onConfirm, onCancel, isOpen, type } = this.props;
    const { searchIsOpen, searchModalKey } = this.state;

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

        <Text style={localStyles.title}>
          {`${type[0].toUpperCase()}${type.slice(1, type.length)} Details`}
        </Text>

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

        <View style={localStyles.contentContainer}>
          <PageInfo columns={[this.getPageInfoProps()]} />
        </View>

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
            onPress={() => onConfirm(this.getProgramValues())}
            disabledColor={WARM_GREY}
            isDisabled={!this.getProgress().canConfirm}
            style={[globalStyles.button, localStyles.OKButton]}
            textStyle={[globalStyles.buttonText, localStyles.OKButtonText]}
          />
        </View>

        <PageContentModal
          isOpen={searchIsOpen}
          onClose={this.onSearchModalConfirm}
          title={searchModalTitles[searchModalKey]}
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
  isProgramBased: PropTypes.bool.isRequired,
  onToggleChange: PropTypes.func.isRequired,
};
