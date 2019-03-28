/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, Text } from 'react-native';

import { PageContentModal } from './PageContentModal';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { AutocompleteSelector, PageInfo, ToggleBar, PageButton } from '..';

import { SETTINGS_KEYS } from '../../settings';
import { getAllPrograms, getAllPeriodsForProgram } from '../../utilities/byProgram';

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
  programTitle: 'Select a Program to use',
  supplierTitle: 'Select a Supplier to use',
  orderTypeTitle: 'Select a Order Type to use',
  periodTitle: 'Select a Period to use',
};

const updateState = command => {
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
        periods: null,
        orderType: {},
        orderTypes: null,
        searchIsOpen: false,
      };
      break;
    case 'SELECT_ORDER_TYPE':
      newState = { period: {}, periods: null, searchIsOpen: false };
      break;
    case 'SELECT_PERIOD':
    case 'SELECT_SUPPLIER':
    case 'CLOSE_SEARCH_MODAL':
      newState = { searchIsOpen: false };
      break;
    case 'OPEN_SEARCH_MODAL':
      newState = { searchIsOpen: true };
      break;
    default:
      break;
  }

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
    const periodScheduleName = storeTag && storeTag.periodScheduleName;
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
          periods: getAllPeriodsForProgram(database, program, periodScheduleName, selectedItem),
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
    queryString: 'name BEGINSWITH[c] $0',
    sortByString: 'name',
    primaryFilterProperty: 'name',
    renderLeftText: item => `${item.name}`,
    onSelect: selectedItem => this.selectSearchValue({ key, selectedItem }),
  });

  getSearchModalProps = () => {
    const { programs, suppliers, orderTypes, periods, program, orderType } = this.state;

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
          `${item.toString()} - ${item.requisitionsForOrderType(
            program,
            orderType
          )} Requisition(s)`,
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
        <Text style={{ color: 'white', fontSize: 20 }}>
          {isRequisitionProgramOrder ? progressSteps[key] : 1}
        </Text>
      ),
      info: programValues[key].name || `Select the ${localization[key]} to use`,
      onPress: this.openSearchModal(key),
      shouldShow: progress[`${key}Show`],
      canEdit: progress[key],
      editableType: 'selectable',
      infoSize: 20,
      infoColor: 'white',
    };
  };

  getPageInfoProps = () =>
    Array.from(Object.keys(progressSteps)).map(key => this.getPageInfoBaseProps(key));

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
      <PageContentModal
        isOpen={isOpen}
        style={{ ...globalStyles.modal, backgroundColor: DARK_GREY }}
        swipeToClose={false}
        onClose={() => {
          this.setState({ ...updateState('RESET_ALL') }, onCancel);
        }}
        title={`${type[0].toUpperCase()}${type.slice(1, type.length)} Details`}
      >
        <View style={localStyles.toggleContainer}>
          <ToggleBar toggles={this.getToggleBarProps()} />
        </View>

        <View style={localStyles.contentContainer}>
          <PageInfo columns={[this.getPageInfoProps()]} />
          <View style={{ marginLeft: '18%', marginTop: 20 }}>
            <PageButton
              text="OK"
              onPress={() =>
                this.setState({ ...updateState('RESET_ALL') }, onConfirm(this.getProgramValues()))
              }
              isDisabled={!this.getProgress().canConfirm}
              disabledColor={WARM_GREY}
              style={{ ...globalStyles.button, backgroundColor: SUSSOL_ORANGE }}
              textStyle={{ ...globalStyles.buttonText, color: 'white' }}
            />
          </View>
        </View>

        <PageContentModal
          isOpen={searchIsOpen}
          onClose={this.onSearchModalConfirm}
          title={localization[`${searchModalKey}Title`]}
          coverScreen
        >
          {this.renderSearchModal()}
        </PageContentModal>
      </PageContentModal>
    );
  }
}

export default ByProgramModal;

const localStyles = StyleSheet.create({
  toggleContainer: {
    width: 292,
    alignSelf: 'center',
    marginTop: 10,
  },
  contentContainer: {
    minWidth: '100%',
    paddingLeft: '32%',
    height: '30%',
    marginTop: 50,
  },
});

ByProgramModal.propTypes = {
  database: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
};
