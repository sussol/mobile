/* eslint-disable prefer-destructuring */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { generateUUID } from 'react-native-database';
import { extractBreaches, vaccineDisposalAdjustments } from '../utilities/modules/vaccines';

import { GenericPage } from './GenericPage';
import {
  FinaliseButton,
  MiniToggleBar,
  TextEditor,
  ExpiryTextInput,
  GenericChoiceList,
  PageContentModal,
  IconCell,
  BreachTable,
} from '../widgets';

import { DARK_GREY, FINALISED_RED, SUSSOL_ORANGE, SOFT_RED } from '../globalStyles/index';
import { ConfirmModal } from '../widgets/modals/index';

/**
 * CONSTANTS
 */

// Titles for each modal
const MODAL_TITLES = itemBatch => ({
  location: 'Place this batch of vaccines in a fridge',
  vvmStatus: 'How many vials have a failed VVM status?',
  breach: `Temperature breaches for ${itemBatch && itemBatch.item.name} - Batch: ${itemBatch &&
    itemBatch.batch}`,
});

// Columns available for this component
const COLUMNS = {
  batch: { key: 'batch', title: 'BATCH', sortable: false, width: 1.5, alignText: 'center' },
  expiry: { key: 'expiryDate', title: 'EXPIRY', sortable: false, width: 1.5, alignText: 'center' },
  arrived: { key: 'arrived', title: 'ARRIVED', sortable: false, width: 1, alignText: 'center' },
  fridge: { key: 'location', title: 'FRIDGE', sortable: false, width: 1.5, alignText: 'center' },
  breach: { key: 'breach', title: 'BREACH', sortable: false, width: 1, alignText: 'center' },
  vvm: { key: 'vvmStatus', title: 'VVM STATUS', sortable: false, width: 2, alignText: 'center' },
  dispose: { key: 'dispose', title: 'DISPOSE', sortable: false, width: 1.5, alignText: 'center' },
  quantity: {
    key: 'totalQuantity',
    title: 'QUANTITY',
    sortable: false,
    width: 1,
    alignText: 'center',
  },
};

// Columns usable for a certain module or item
const VACCINE_COLUMN_KEYS = ['batch', 'expiry', 'quantity', 'fridge', 'breach', 'vvm', 'dispose'];

/**
 * HELPER METHODS
 */
const getColumns = columnKeys => columnKeys.map(columnKey => COLUMNS[columnKey]);

// Creates a row object for use within this component.
const createRowObject = (itemBatch, extraData = { vvmStatus: null, option: null }) => ({
  ...itemBatch,
  totalQuantity: itemBatch.totalQuantity,
  hasBreached: itemBatch.hasBreached,
  ...extraData,
});

/**
 * Component used for displaying all ItemBatches for a particular
 * item. No changes are made internally until the apply changes
 * button is pressed.
 */
export class ManageVaccineItemPage extends React.Component {
  constructor(props) {
    super(props);

    this.FRIDGES = null;
    this.REASONS = null;
    this.VVMREASON = null;

    this.state = {
      data: null,
      isModalOpen: false,
      modalKey: null,
      currentBatch: null,
      hasFridges: false,
    };
  }

  /**
   * COMPONENT METHODS
   */
  componentDidMount = () => {
    const { database, item } = this.props;
    this.FRIDGES = database.objects('Location').filter(({ isFridge }) => isFridge);
    const hasFridges = this.FRIDGES && this.FRIDGES.length > 0;

    const reasonsQuery = ['type = $0 && isActive = $1', 'vaccineDisposalReason', true];
    const reasons = database.objects('Options', ...reasonsQuery);
    this.REASONS = reasons.filtered('NOT title CONTAINS[c] $0', 'vvm');
    this.VVMREASON = reasons.filtered('title CONTAINS[c] $0', 'vvm')[0];

    const data = item.batches.map(itemBatch => createRowObject(itemBatch));
    this.setState({ data, hasFridges });
  };

  /**
   * HELPER METHODS
   */
  getModalTitle = () => {
    const { modalKey, currentBatch } = this.state;
    return MODAL_TITLES(currentBatch)[modalKey];
  };

  getFridgeDescription = ({ location, vvmStatus, option }) => {
    const { hasFridges } = this.state;
    if (hasFridges && vvmStatus !== false && !option) {
      return (location && location.description) || 'Unnasigned';
    }
    return (!hasFridges && 'No fridges') || ((!vvmStatus || option) && 'Discarded');
  };

  // Updates the currentBatch object held within state with new
  // values. Optional second parameter of fields to be used within
  // the setState call.
  updateObject = (extraObjectValues = {}, extraStateValues = {}) => {
    const { data, currentBatch } = this.state;
    const batchIndex = data.findIndex(({ id = 0 }) => currentBatch.id === id);
    // If something has gone wrong finding the batch, don't try to update
    if (batchIndex >= 0) data[batchIndex] = { ...currentBatch, ...extraObjectValues };
    this.setState({ data: [...data], ...extraStateValues });
  };

  getBreaches = () => {
    let { currentBatch } = this.state;
    if (currentBatch.parentBatch) currentBatch = currentBatch.parentBatch;
    const { database } = this.props;
    return extractBreaches({
      sensorLogs: database.objects('SensorLog').filtered('itemBatches.id = $0', currentBatch.id),
      database,
    });
  };

  /**
   * EVENT HANDLERS
   */
  // Called after entering the doses after toggling the VVM status to FAIL.
  // Will create a new row in the table with a quantity equal to the amount
  // entered and a VVM status of FAIL. Also updates the currentBatch objects
  // quantity.
  onSplitBatch = (splitValue = 0) => {
    const { currentBatch, data } = this.state;
    const { totalQuantity } = currentBatch;
    const parsedSplitValue = parseInt(splitValue, 10);
    let newObjectValues = {};

    if (parsedSplitValue > totalQuantity) {
      newObjectValues = {
        vvmStatus: false,
        option: this.VVMREASON || null,
        hasBreached: currentBatch.hasBreached,
      };
      // Account for 0 & NaN (From entering a non-numeric character)
    } else if (parsedSplitValue) {
      let parentBatch = currentBatch;
      if (currentBatch.parentBatch) parentBatch = currentBatch.parentBatch;
      const newBatchValues = {
        id: generateUUID(),
        totalQuantity: parsedSplitValue,
        vvmStatus: false,
        option: this.VVMREASON || null,
        hasBreached: currentBatch.hasBreached,
        parentBatch,
      };
      data.push(createRowObject(currentBatch, newBatchValues));
      newObjectValues = { vvmStatus: true, totalQuantity: totalQuantity - parsedSplitValue };
    }
    this.updateObject(newObjectValues, { isModalOpen: false });
  };

  onApplyChanges = shouldApply => () => {
    const { database, currentUser: user, navigateBack } = this.props;
    const { data: itemBatches } = this.state;
    this.onModalUpdate()();
    if (shouldApply) {
      vaccineDisposalAdjustments({ database, user, itemBatches });
      if (navigateBack) navigateBack();
    }
  };

  onDispose = ({ itemBatch } = {}) => ({ item: option }) => {
    if (option) return this.updateObject({ option }, { isModalOpen: false });
    return this.setState({ currentBatch: itemBatch }, () =>
      this.updateObject({ option: null, vvmStatus: true }, { isModalOpen: false })
    );
  };

  // Called on selecting a fridge in the fridge selection modal,
  // just update the location of the currentBatch and close the modal.
  onFridgeSelection = ({ item: location }) => {
    this.updateObject({ location }, { isModalOpen: false });
  };

  // Called on toggle the vvm toggle bar. If being set to PASS, will just update
  // the object held in the closure to a PASS VVM status. Otherwise, opens a
  // modal for a user to enter the doses affected and set the currentBatch.
  onVvmToggle = ({ modalKey, currentBatch }) => ({ newState }) => {
    if (!newState) return this.onModalUpdate({ modalKey, currentBatch })();
    return this.setState({ currentBatch }, () =>
      this.updateObject({ vvmStatus: true, option: null })
    );
  };

  // Method which controls all modals. Will open a modal corresponding to the
  // modal key in renderModal and set the passed itemBatch as the current
  // itemBatch. If called with no parameters, will clear the currentBatch
  // and close the modal.
  onModalUpdate = ({ modalKey, currentBatch } = {}) => () => {
    if (modalKey) this.setState({ modalKey, isModalOpen: true, currentBatch });
    else this.setState({ isModalOpen: false, currentBatch: null, modalKey: null });
  };

  /**
   * RENDER HELPERS
   */
  renderCell = (key, itemBatch) => {
    const { hasFridges } = this.state;
    const { vvmStatus, option } = itemBatch;
    const usingFridge = vvmStatus !== false && hasFridges && !option;

    const modalUpdateProps = { modalKey: key, currentBatch: itemBatch };
    const emptyCell = { type: 'text', cellContents: '' };

    switch (key) {
      default:
        return { type: 'text', cellContents: itemBatch[key] };
      case 'expiryDate':
        return <ExpiryTextInput text={itemBatch[key]} />;
      case 'location':
        return (
          <IconCell
            text={this.getFridgeDescription(itemBatch)}
            disabled={!usingFridge}
            icon={usingFridge ? 'caret-up' : 'times'}
            iconColour={usingFridge ? SUSSOL_ORANGE : SOFT_RED}
            onPress={this.onModalUpdate(modalUpdateProps)}
          />
        );
      case 'breach':
        if (!itemBatch.hasBreached) return emptyCell;
        return (
          <IconCell
            icon="warning"
            iconSize={30}
            onPress={this.onModalUpdate(modalUpdateProps)}
            iconColour={FINALISED_RED}
          />
        );
      case 'dispose':
        return (
          <IconCell
            text={option && option.title}
            icon={option ? 'times' : 'trash'}
            iconSize={option ? 20 : 30}
            onPress={option ? this.onDispose({ itemBatch }) : this.onModalUpdate(modalUpdateProps)}
            iconColour={option ? 'red' : DARK_GREY}
          />
        );
      case 'vvmStatus':
        return (
          <MiniToggleBar
            leftText="PASS"
            rightText="FAIL"
            currentState={vvmStatus}
            onPress={this.onVvmToggle(modalUpdateProps)}
          />
        );
    }
  };

  renderModal = () => {
    const { modalKey, currentBatch } = this.state;
    if (!currentBatch) return null;

    switch (modalKey) {
      case 'location': {
        return (
          <GenericChoiceList
            data={this.FRIDGES}
            keyToDisplay="description"
            onPress={this.onFridgeSelection}
            highlightValue={
              currentBatch && currentBatch.location ? currentBatch.location.description : null
            }
          />
        );
      }
      case 'dispose': {
        return (
          <GenericChoiceList
            data={this.REASONS}
            keyToDisplay="title"
            onPress={this.onDispose()}
            highlightValue={currentBatch && currentBatch.option ? currentBatch.option.title : null}
          />
        );
      }
      case 'vvmStatus': {
        return <TextEditor text="" onEndEditing={this.onSplitBatch} />;
      }
      case 'breach': {
        return (
          <BreachTable
            {...this.props}
            breaches={this.getBreaches()}
            itemBatchFilter={currentBatch && currentBatch.parentBatch}
          />
        );
      }

      default: {
        return null;
      }
    }
  };

  renderTopRightComponent = () => (
    <FinaliseButton
      text="Apply Changes"
      onPress={this.onModalUpdate({ modalKey: 'applyChanges' })}
      isFinalised={false}
      fontStyle={{ fontSize: 18 }}
    />
  );

  render() {
    const { database, genericTablePageStyles, topRoute } = this.props;
    const { data, isModalOpen, modalKey } = this.state;
    return (
      <GenericPage
        data={data || []}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderTopRightComponent}
        onEndEditing={this.onEndEditing}
        columns={getColumns(VACCINE_COLUMN_KEYS)}
        database={database}
        topRoute={topRoute}
        isDataCircular={true}
        {...genericTablePageStyles}
      >
        {isModalOpen && modalKey !== 'applyChanges' && (
          <PageContentModal
            isOpen={isModalOpen}
            onClose={this.onModalUpdate()}
            title={this.getModalTitle()}
          >
            {this.renderModal()}
          </PageContentModal>
        )}
        {isModalOpen && modalKey === 'applyChanges' && (
          <ConfirmModal
            isOpen={isModalOpen}
            questionText="Are you sure you want to apply these changes?"
            confirmText="Yes"
            cancelText="No"
            onConfirm={this.onApplyChanges(true)}
            onCancel={this.onApplyChanges(false)}
          />
        )}
      </GenericPage>
    );
  }
}

ManageVaccineItemPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  topRoute: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  navigateBack: PropTypes.func.isRequired,
};

export default ManageVaccineItemPage;
