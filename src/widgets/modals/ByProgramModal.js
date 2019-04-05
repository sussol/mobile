/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import { PageContentModal } from './PageContentModal';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { AutocompleteSelector, ToggleBar, PageButton, TextEditor } from '..';

import { SETTINGS_KEYS } from '../../settings';
import { getAllPrograms, getAllPeriodsForProgram } from '../../utilities/byProgram';
import SequentialSteps from '../SequentialSteps';

const localization = {
  program: 'program',
  supplier: 'supplier',
  orderType: 'order type',
  period: 'period',
  programTitle: 'Select a Program to use',
  supplierTitle: 'Select a Supplier to use',
  orderTypeTitle: 'Select a Order Type to use',
  periodTitle: 'Select a Period to use',
  nameTitle: 'Give your stocktake a name',
  programError: 'No programs available',
  supplierError: 'No suppliers available',
  orderTypeError: 'No order types available',
  periodError: 'No periods available',
};

const newState = {
  RESET_ALL: {
    program: null,
    otherStoreName: null,
    period: null,
    periods: null,
    orderType: null,
    orderTypes: null,
    name: null,
    currentStep: 0,
  },
  SELECT_PROGRAM: {
    period: {},
    periods: null,
    otherStoreName: {},
    orderType: {},
    orderTypes: null,
    modalIsOpen: false,
    currentStep: 1,
  },
  SELECT_ORDER_TYPE: { period: {}, periods: null, modalIsOpen: false },
  SELECT_NAME: { modalIsOpen: false },
  SELECT_PERIOD: { modalIsOpen: false },
  SELECT_SUPPLIER: { modalIsOpen: false },
};

export class ByProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Values used for deriving current UI state
      currentStep: 0,
      steps: null,
      modalIsOpen: false,
      isProgramBased: true,
      // New requisition or stocktake values
      program: null,
      supplier: null,
      orderType: null,
      period: null,
      name: null,
      // Data stored for performance
      storeTag: null,
      programs: null,
      suppliers: null,
      orderTypes: null,
      periods: null,
    };
  }

  // Store unchanging select modal options and set the default
  // steps array.
  componentDidMount = () => {
    const { settings, database } = this.props;
    const programs = getAllPrograms(settings, database);
    const suppliers = database.objects('Name').filtered('isSupplier = $0', true);
    this.setCurrentSteps();
    this.setState({ programs, suppliers });
  };

  getProgramValues = () => {
    const { program, supplier, orderType, period, name } = this.state;
    return { program, supplier, orderType, period, name };
  };

  getStepNumbers = () => {
    const { isProgramBased } = this.state;
    return {
      program: 0,
      supplier: isProgramBased ? 1 : 0,
      orderType: 2,
      period: 3,
      name: isProgramBased ? 1 : 0,
    };
  };

  // Open a modal - in case it is an earlier step in the process,
  // set the current step to the step number corresponding with
  // the onPress event.
  openModal = ({ stepNumber }) => {
    this.setState({ modalIsOpen: true, currentStep: stepNumber });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  // Initial set up or update the current steps property to reflect the current state
  setCurrentSteps = () => {
    const { isProgramBased } = this.state;
    const { type } = this.props;

    const sequentialSteps = this.getSequentialStepsProps();
    const stepKeys = {
      requisition: isProgramBased ? ['program', 'supplier', 'orderType', 'period'] : ['supplier'],
      stocktake: isProgramBased ? ['program', 'name'] : ['name'],
    };

    this.setState({ steps: stepKeys[type].map(step => sequentialSteps[step]) });
  };

  getSequentialStepsProps = () => {
    const { name } = this.state;
    const stepNumbers = this.getStepNumbers();
    const programValues = this.getProgramValues();

    const baseProps = key => ({
      name: programValues[key] && programValues[key].name,
      placeholder: localization[`${key}Title`],
      stepNumber: stepNumbers[key],
      key,
      error: this.state[`${key}s`] ? this.state[`${key}s`].length === 0 : false,
      errorText: localization[`${key}Error`],
    });

    return {
      program: baseProps('program'),
      supplier: baseProps('supplier'),
      name: { name, placeholder: localization.nameTitle, key: name, type: 'input' },
      orderType: baseProps('orderType'),
      period: baseProps('period'),
    };
  };

  toggleChange = () => {
    const { isProgramBased } = this.state;
    this.setState({ ...newState.RESET_ALL, isProgramBased: !isProgramBased }, () =>
      this.setCurrentSteps()
    );
  };

  setNewValue = ({ key, selectedItem }) => {
    const { settings, database } = this.props;
    const { program, storeTag, isProgramBased } = this.state;
    const periodScheduleName = storeTag && storeTag.periodScheduleName;

    let nextState;
    switch (key) {
      case 'program':
        nextState = {
          ...newState.SELECT_PROGRAM,
          storeTag: selectedItem.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS)),
          program: selectedItem,
          currentStep: 1,
        };
        break;
      case 'supplier':
        nextState = {
          ...newState.SELECT_SUPPLIER,
          supplier: selectedItem,
          orderTypes:
            program &&
            program.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS)).orderTypes,
          currentStep: isProgramBased ? 2 : 1,
        };
        break;
      case 'orderType':
        nextState = {
          ...newState.SELECT_ORDER_TYPE,
          periods: getAllPeriodsForProgram(database, program, periodScheduleName, selectedItem),
          orderType: selectedItem,
          currentStep: 3,
        };
        break;
      case 'period':
        nextState = {
          ...newState.SELECT_PERIOD,
          period: selectedItem,
          currentStep: 4,
        };
        break;
      case 'name':
        nextState = {
          ...newState.SELECT_NAME,
          name: selectedItem,
          currentStep: 3,
        };
        break;
      default:
        break;
    }
    this.setState(nextState, () => this.setCurrentSteps());
  };

  getBaseSearchModalProps = key => ({
    queryString: 'code BEGINSWITH[c] $0',
    sortByString: 'name',
    primaryFilterProperty: 'name',
    renderLeftText: item => `${item.name}`,
    onSelect: selectedItem => this.setNewValue({ key, selectedItem }),
  });

  getSearchModalProps = () => {
    const { programs, suppliers, orderTypes, periods, program, orderType } = this.state;

    return {
      program: {
        ...this.getBaseSearchModalProps('program'),
        options: programs,
        queryStringSecondary: 'name BEGINSWITH[c] $0',
        renderRightText: item =>
          item.parsedProgramSettings ? item.parsedProgramSettings.elmisCode : '',
      },
      supplier: {
        ...this.getBaseSearchModalProps('supplier'),
        options: suppliers,
        secondaryFilterProperty: 'code',
        renderRightText: item => `(${item.code})`,
      },
      orderType: {
        ...this.getBaseSearchModalProps('orderType'),
        options: orderTypes,
        renderRightText: item =>
          `Max MOS: ${item.maxMOS} - Threshold MOS: ${item.thresholdMOS} - Max orders per period: ${
            item.maxOrdersPerPeriod
          }`,
      },
      period: {
        ...this.getBaseSearchModalProps('period'),
        options: periods,
        renderRightText: item =>
          `${item.toString()} - ${item.requisitionsForOrderType(program, orderType)}/${
            orderType.maxOrdersPerPeriod
          } Requisition(s)`,
      },
    };
  };

  renderTextEditor = () => {
    const { name } = this.state;
    return (
      <TextEditor
        text={name}
        onEndEditing={selectedItem => this.setNewValue({ key: 'name', selectedItem })}
      />
    );
  };

  renderSearchModal = () => {
    const { steps, currentStep } = this.state;
    if (!steps || currentStep >= steps.length) return null;
    const { [steps[currentStep].key]: modalProps } = this.getSearchModalProps();
    return <AutocompleteSelector {...modalProps} />;
  };

  renderModal = () => {
    const { currentStep, steps } = this.state;
    const { key } = steps[currentStep];
    if (key === 'name') return this.renderTextEditor();
    return this.renderSearchModal();
  };

  getToggleBarProps = () => {
    const { type } = this.props;
    const { isProgramBased } = this.state;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return [
      { text: `Program ${buttonText}`, onPress: this.toggleChange, isOn: isProgramBased },
      { text: `General ${buttonText}`, onPress: this.toggleChange, isOn: !isProgramBased },
    ];
  };

  onConfirmRequisition = () => {
    const { onConfirm } = this.props;
    onConfirm(this.getProgramValues());
    this.setState({ ...newState.RESET_ALL }, () => this.setCurrentSteps());
  };

  render() {
    const { onCancel, isOpen, type, database } = this.props;
    const { modalIsOpen, currentStep, steps } = this.state;
    if (!steps) return null;
    return (
      <PageContentModal
        isOpen={isOpen}
        style={{ ...globalStyles.modal, backgroundColor: DARK_GREY }}
        swipeToClose={false}
        onClose={() => {
          this.setState({ ...newState.RESET_ALL }, () => onCancel());
        }}
        title={`${type[0].toUpperCase()}${type.slice(1, type.length)} Details`}
      >
        <View style={localStyles.toggleContainer}>
          <ToggleBar toggles={this.getToggleBarProps()} />
        </View>

        <SequentialSteps
          database={database}
          currentStep={currentStep}
          steps={steps}
          onPress={this.openModal}
        />

        <PageButton
          text="OK"
          onPress={this.onConfirmRequisition}
          isDisabled={!(currentStep >= steps.length)}
          disabledColor={WARM_GREY}
          style={localStyles.okButton}
          textStyle={{ ...globalStyles.buttonText, color: 'white' }}
        />

        {modalIsOpen && (
          <PageContentModal
            isOpen={modalIsOpen}
            onClose={this.closeModal}
            title={localization[`${steps[currentStep].key}Title`]}
            coverScreen
          >
            {this.renderModal()}
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
    marginVertical: 20,
  },
  okButton: {
    ...globalStyles.button,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
    marginTop: 60,
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
