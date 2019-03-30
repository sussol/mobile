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
import { AutocompleteSelector, PageInfo, ToggleBar, PageButton, TextEditor } from '..';

import { SETTINGS_KEYS } from '../../settings';
import { getAllPrograms, getAllPeriodsForProgram } from '../../utilities/byProgram';

const getProgressStep = isProgram => ({
  program: 1,
  supplier: isProgram ? 2 : 1,
  orderType: 3,
  period: 4,
  name: null,
});

const localization = {
  program: 'program',
  supplier: 'supplier',
  orderType: 'order type',
  period: 'period',
  programTitle: 'Select a Program to use',
  supplierTitle: 'Select a Supplier to use',
  orderTypeTitle: 'Select a Order Type to use',
  periodTitle: 'Select a Period to use',
  nameTitle: 'Give your stock take a name',
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
        name: '',
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
    case 'SELECT_NAME':
    case 'SELECT_PERIOD':
    case 'SELECT_SUPPLIER':
    case 'CLOSE_SEARCH_MODAL':
      newState = { searchIsOpen: false, textEditIsOpen: false };
      break;
    case 'OPEN_SEARCH_MODAL':
      newState = { searchIsOpen: true };
      break;
    case 'OPEN_COMMENT_MODAL':
      newState = { textEditIsOpen: true };
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
      textEditIsOpen: false,
      isProgramBased: true,
      searchModalKey: 'supplier',
      program: {},
      supplier: {},
      orderType: {},
      period: {},
      programs: null,
      suppliers: null,
      orderTypes: null,
      periods: null,
      name: '',
    };
  }

  componentDidMount = () => {
    const { settings, database } = this.props;
    const programs = getAllPrograms(settings, database);
    const suppliers = database.objects('Name').filtered('isSupplier = $0', true);
    this.setState({ programs, suppliers });
  };

  getProgramValues = () => {
    const { program, supplier, orderType, period, name } = this.state;
    return { program, supplier, orderType, period, name };
  };

  toggleChange = () => {
    const { isProgramBased } = this.state;
    this.setState({ ...updateState('RESET_ALL'), isProgramBased: !isProgramBased });
  };

  openSearchModal = searchModalKey => () => {
    const stateEvent = searchModalKey === 'name' ? 'OPEN_COMMENT_MODAL' : 'OPEN_SEARCH_MODAL';
    this.setState({ ...updateState(stateEvent), searchModalKey });
  };

  onSearchModalConfirm = ({ key, item }) => {
    this.setState({ ...updateState('CLOSE_SEARCH_MODAL'), [key]: item });
  };

  getProgress = () => {
    const { type } = this.props;
    const { program, supplier, period, orderType, isProgramBased } = this.state;
    const isRequisition = type === 'requisition';
    const isProgramRequisition = isRequisition && isProgramBased;
    const complete =
      isProgramBased && !!program.name && !!supplier.name && !!period.name && !!orderType.name;
    return {
      canConfirm:
        (complete && isProgramRequisition) ||
        (isRequisition && !isProgramBased && supplier.name) ||
        (!isRequisition && isProgramBased && program.name) ||
        (!isRequisition && !isProgramBased),
      isProgramRequisition,
      program: true,
      name: true,
      supplier: !(isProgramBased && !program.name),
      orderType: !!supplier.name,
      period: !!orderType.name,
      programShow: isProgramBased,
      supplierShow: isRequisition,
      orderTypeShow: isProgramRequisition,
      periodShow: isProgramRequisition,
      nameShow: !isRequisition,
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
      case 'name':
        this.setState({
          ...updateState('SELECT_NAME'),
          name: selectedItem,
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

  renderTextEditorModal = () => {
    const { name } = this.state;
    return (
      <TextEditor
        text={name}
        onEndEditing={selectedItem => this.selectSearchValue({ key: 'name', selectedItem })}
      />
    );
  };

  renderSearchModal = () => {
    const { searchModalKey, textEditIsOpen } = this.state;
    const { database } = this.props;
    const { [searchModalKey]: modalProps } = this.getSearchModalProps(database);

    if (textEditIsOpen) {
      return this.renderTextEditorModal();
    }
    return <AutocompleteSelector {...modalProps} />;
  };

  getPageInfoBaseProps = key => {
    const { name, isProgramBased } = this.state;
    const programValues = this.getProgramValues();
    const { isProgramRequisition, ...progress } = this.getProgress();

    let info;
    if ((programValues[key] && programValues[key].name) || (key === 'name' && name)) {
      info = programValues[key].name || name;
    } else {
      info = localization[`${key}Title`];
    }

    return {
      title: programValues[key].name ? (
        <Icon name="md-checkmark" style={{ color: 'green' }} size={20} />
      ) : (
        <Text style={{ color: 'white', fontSize: 20 }}>{getProgressStep(isProgramBased)[key]}</Text>
      ),
      info,
      onPress: this.openSearchModal(key),
      shouldShow: progress[`${key}Show`],
      canEdit: progress[key],
      editableType: key === 'name' ? 'text' : 'selectable',
      infoSize: 20,
      infoColor: 'white',
      editableColor: 'white',
    };
  };

  getPageInfoProps = () =>
    Array.from(Object.keys(getProgressStep())).map(key => this.getPageInfoBaseProps(key));

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
    const { searchIsOpen, searchModalKey, textEditIsOpen } = this.state;

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

        {(searchIsOpen || textEditIsOpen) && (
          <PageContentModal
            isOpen={searchIsOpen || textEditIsOpen}
            onClose={this.onSearchModalConfirm}
            title={localization[`${searchModalKey}Title`]}
            coverScreen
          >
            {this.renderSearchModal()}
          </PageContentModal>
        )}
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
    paddingLeft: '38%',
    paddingRight: '30%',
    height: '30%',
    marginTop: 50,
  },
  textInput: {
    justifyContent: 'space-between',
    paddingLeft: 20,
    maxHeight: 35,
    minWidth: 500,
    marginTop: '2%',
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
