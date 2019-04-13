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
import { getAllPrograms, getAllPeriodsForProgram } from '../../utilities';
import SequentialSteps from '../SequentialSteps';

// TODO: Proper localization
const localization = {
  title: {
    program: 'Select a Program to use',
    supplier: 'Select a Supplier to use',
    orderType: 'Select a Order Type to use',
    period: 'Select a Period to use',
    name: 'Give your stocktake a name',
  },
  error: {
    program: 'No programs available',
    supplier: 'No suppliers available',
    orderType: 'No order types available',
    period: 'No periods available',
  },
  label: {
    program: 'program',
    supplier: 'supplier',
    orderType: 'order type',
    period: 'period',
  },
};

const newState = {
  RESET_ALL: {
    program: null,
    supplier: null,
    period: null,
    periods: null,
    orderType: null,
    orderTypes: null,
    name: null,
    currentStepKey: null,
    isProgramBased: true,
  },
  SELECT_PROGRAM: {
    period: {},
    periods: null,
    supplier: {},
    orderType: {},
    orderTypes: null,
    modalIsOpen: false,
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
      steps: null,
      modalIsOpen: false,
      isProgramBased: true,
      currentStepKey: null,
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
    this.setCurrentSteps(true);
    this.setState({ programs, suppliers });
  };

  onConfirmRequisition = () => {
    const { onConfirm } = this.props;
    const { supplier: otherStoreName, orderType } = this.state;
    onConfirm({ ...this.state, otherStoreName, orderType: orderType && orderType.name });
    this.setState({ ...newState.RESET_ALL }, () => this.setCurrentSteps());
  };

  onToggleChange = () => {
    const { isProgramBased } = this.state;
    this.setState({ ...newState.RESET_ALL, isProgramBased: !isProgramBased }, () =>
      this.setCurrentSteps(true)
    );
  };

  // Open a modal - in case it is an earlier step in the process,
  // set the current step to the step number corresponding with
  // the onPress event.
  onModalTransition = ({ key: currentStepKey }) => {
    if (currentStepKey) this.setState({ modalIsOpen: true, currentStepKey });
    else this.setState({ modalIsOpen: false });
  };

  getSequentialStepsProps = () => {
    const { name, programs, suppliers, orderTypes, periods } = this.state;
    const getBaseProps = key => ({
      name: this.state[key] && this.state[key].name,
      placeholder: localization.title[key],
      errorText: localization.error[key],
      key,
    });

    return {
      program: { ...getBaseProps('program'), error: !!(programs && programs.length === 0) },
      supplier: { ...getBaseProps('supplier'), error: !!(suppliers && suppliers.length === 0) },
      orderType: { ...getBaseProps('orderType'), error: !!(orderTypes && orderTypes.length === 0) },
      period: { ...getBaseProps('period'), error: !!(periods && periods.length === 0) },
      name: { name, placeholder: localization.title[name], key: name, type: 'input' },
    };
  };

  // Initial set up or update the current steps property to reflect the current state
  setCurrentSteps = setNewCurrentKey => {
    const { isProgramBased } = this.state;
    const { type } = this.props;

    const sequentialSteps = this.getSequentialStepsProps();
    const stepKeys = {
      requisition: isProgramBased ? ['program', 'supplier', 'orderType', 'period'] : ['supplier'],
      stocktake: isProgramBased ? ['program', 'name'] : ['name'],
    };
    const steps = stepKeys[type].map(step => sequentialSteps[step]);
    if (setNewCurrentKey) this.setState({ steps, currentStepKey: steps[0].key });
    else this.setState({ steps });

    return steps;
  };

  setNewValue = ({ key, selectedItem }) => {
    const { settings, database, type } = this.props;
    const { program, storeTag, isProgramBased } = this.state;
    const periodScheduleName = storeTag && storeTag.periodScheduleName;

    let nextState;
    switch (key) {
      case 'program':
        nextState = {
          ...newState.SELECT_PROGRAM,
          storeTag: selectedItem.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS)),
          program: selectedItem,
          currentStepKey: type === 'requisition' ? 'supplier' : 'name',
        };
        break;
      case 'supplier':
        nextState = {
          ...newState.SELECT_SUPPLIER,
          supplier: selectedItem,
          orderTypes:
            program &&
            program.getStoreTagObject(settings.get(SETTINGS_KEYS.THIS_STORE_TAGS)).orderTypes,

          currentStepKey: isProgramBased ? 'orderType' : 'complete',
        };
        break;
      case 'orderType':
        nextState = {
          ...newState.SELECT_ORDER_TYPE,
          periods: getAllPeriodsForProgram(database, program, periodScheduleName, selectedItem),
          orderType: selectedItem,
          currentStepKey: 'period',
        };
        break;
      case 'period':
        nextState = {
          ...newState.SELECT_PERIOD,
          period: selectedItem,
          currentStepKey: 'complete',
        };
        break;
      case 'name':
        nextState = {
          ...newState.SELECT_NAME,
          name: selectedItem,
          currentStepKey: 'complete',
        };
        break;
      default:
        break;
    }

    this.setState(nextState, () => this.setCurrentSteps());
  };

  getSearchModalProps = () => {
    const { programs, suppliers, orderTypes, periods, program, orderType } = this.state;

    const getBaseProps = key => ({
      queryString: 'code BEGINSWITH[c] $0',
      sortByString: 'name',
      primaryFilterProperty: 'name',
      renderLeftText: item => `${item.name}`,
      onSelect: selectedItem => this.setNewValue({ key, selectedItem }),
    });

    return {
      program: {
        ...getBaseProps('program'),
        options: programs,
        queryStringSecondary: 'name BEGINSWITH[c] $0',
        renderRightText: item =>
          item.parsedProgramSettings ? item.parsedProgramSettings.elmisCode : '',
      },
      supplier: {
        ...getBaseProps('supplier'),
        options: suppliers,
        secondaryFilterProperty: 'code',
        renderRightText: item => `(${item.code})`,
      },
      orderType: {
        ...getBaseProps('orderType'),
        options: orderTypes,
        renderRightText: item =>
          `Max MOS: ${item.maxMOS} - Threshold MOS: ${item.thresholdMOS} - Max orders per period: ${
            item.maxOrdersPerPeriod
          }`,
      },
      period: {
        ...getBaseProps('period'),
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

  renderModal = () => {
    const { currentStepKey } = this.state;
    if (currentStepKey === 'name') return this.renderTextEditor();
    return <AutocompleteSelector {...this.getSearchModalProps()[currentStepKey]} />;
  };

  renderToggleBar = () => {
    const { type } = this.props;
    const { isProgramBased } = this.state;
    const buttonText = type === 'requisition' ? 'order' : 'stocktake';
    return (
      <ToggleBar
        toggles={[
          { text: `Program ${buttonText}`, onPress: this.onToggleChange, isOn: isProgramBased },
          { text: `General ${buttonText}`, onPress: this.onToggleChange, isOn: !isProgramBased },
        ]}
      />
    );
  };

  render() {
    const { onCancel, isOpen, type, database } = this.props;
    const { modalIsOpen, steps, currentStepKey } = this.state;
    if (!(steps || currentStepKey)) return null;

    return (
      <PageContentModal
        isOpen={isOpen}
        style={{ ...globalStyles.modal, backgroundColor: DARK_GREY }}
        swipeToClose={false}
        onClose={() => {
          this.setState({ ...newState.RESET_ALL }, () => {
            this.setCurrentSteps(true);
            onCancel();
          });
        }}
        title={`${type[0].toUpperCase()}${type.slice(1, type.length)} Details`}
      >
        <View style={localStyles.toggleContainer}>{this.renderToggleBar()}</View>

        <SequentialSteps
          database={database}
          steps={steps}
          onPress={this.onModalTransition}
          currentStepKey={currentStepKey}
        />

        <PageButton
          text="OK"
          onPress={this.onConfirmRequisition}
          isDisabled={!(currentStepKey === 'complete')}
          disabledColor={WARM_GREY}
          style={localStyles.okButton}
          textStyle={{ ...globalStyles.buttonText, color: 'white' }}
        />

        {modalIsOpen && (
          <PageContentModal
            isOpen={modalIsOpen}
            onClose={this.onModalTransition}
            title={localization.title[currentStepKey]}
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
