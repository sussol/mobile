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

import { DARK_GREY, SUSSOL_ORANGE } from '../globalStyles/index';
import { ConfirmModal } from '../widgets/modals/index';

/**
 * CONSTANTS
 */

// Titles for each modal
const MODAL_TITLES = itemBatch => ({
  location: 'Place this batch of vaccines in a fridge',
  vvmStatus: 'How many vials have a failed VVM status?',
  dispose: 'How many vials are being disposed of?',
  disposalReason: 'What is the reason for disposal?',
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
  childrenBatches: [],
  totalQuantity: itemBatch.totalQuantity,
  hasBreached: itemBatch.hasBreached,
  ...itemBatch,
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
    this.HAS_FRIDGES = null;
    this.REASONS = null;
    this.VVMREASON = null;

    this.state = {
      data: null,
      isModalOpen: false,
      modalKey: null,
      currentBatch: null,
    };
  }

  /**
   * COMPONENT METHODS
   */
  componentDidMount = () => {
    const { database, item } = this.props;
    this.FRIDGES = database.objects('Location').filter(({ isFridge }) => isFridge);
    this.HAS_FRIDGES = this.FRIDGES && this.FRIDGES.length > 0;

    const reasonsQuery = ['type = $0 && isActive = $1', 'vaccineDisposalReason', true];
    const reasons = database.objects('Options', ...reasonsQuery);
    this.REASONS = reasons.filtered('NOT title CONTAINS[c] $0', 'vvm');
    this.VVMREASON = reasons.filtered('title CONTAINS[c] $0', 'vvm')[0];

    const data = item.batches
      .filtered('numberOfPacks > 0')
      .map(itemBatch => createRowObject(itemBatch));
    this.setState({ data });
  };

  /**
   * HELPER METHODS
   */
  getModalTitle = () => {
    const { modalKey, currentBatch } = this.state;
    return MODAL_TITLES(currentBatch)[modalKey];
  };

  getFridgeDescription = ({ location, vvmStatus, option }) => {
    if (this.HAS_FRIDGES && vvmStatus !== false && !option) {
      return (location && location.description) || 'Unnasigned';
    }
    return (!this.HAS_FRIDGES && 'No fridges') || ((!vvmStatus || option) && 'Discarded');
  };

  // Updates the currentBatch object held within state with new
  // values. Optional second parameter of fields to be used within
  // the setState call. Optional third parameter of a batch to use
  // rather than the currentBatch.
  updateObject = (extraObjectValues = {}, extraStateValues = {}, batchToUpdate = null) => {
    const { data } = this.state;
    let { currentBatch } = this.state;
    if (batchToUpdate) currentBatch = batchToUpdate;
    const { childrenBatches, parentBatch } = currentBatch;

    const batchIndex = data.findIndex(({ id = 0 }) => currentBatch.id === id);
    // If something has gone wrong finding the batch, don't try to update
    if (batchIndex >= 0) {
      data[batchIndex] = { ...currentBatch, ...extraObjectValues };
      // Update all references on an update for children and parents.
      if (childrenBatches.length > 0) {
        childrenBatches.forEach(childBatch => {
          childBatch.parentBatch = data[batchIndex];
        });
      }
      if (parentBatch && parentBatch.childrenBatches.length > 0) {
        const childBatchIndex = parentBatch.childrenBatches.findIndex(
          ({ id }) => id === currentBatch.id
        );
        if (childBatchIndex >= 0) parentBatch.childrenBatches[childBatchIndex] = data[batchIndex];
      }
    }
    this.setState({ data: [...data], ...extraStateValues });
  };

  removeRow = ({ itemBatch }) => {
    const { data } = this.state;
    const { parentBatch, id: batchId } = itemBatch;
    if (parentBatch) {
      const childIndex = parentBatch.childrenBatches.findIndex(({ id }) => id === batchId);
      if (childIndex >= 0) parentBatch.childrenBatches.splice(childIndex, 1);
    }
    const dataIndex = data.findIndex(batch => batch.id === batchId);
    data.splice(dataIndex, 1);
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

  findBatchWithSameReason = ({ itemBatch }) => {
    const { data } = this.state;
    const { option, batch: batchCode, id } = itemBatch;
    const batchesWithSameReason = data.filter(
      ({ option: matchingOption, batch: matchingBatch, id: matchingId }) =>
        (matchingOption && matchingOption.id) === option.id &&
        matchingBatch === batchCode &&
        matchingId !== id
    );
    if (batchesWithSameReason.length > 0) return batchesWithSameReason[0];
    return null;
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
    let parsedSplitValue = parseInt(splitValue, 10);
    let newObjectValues = {};
    // let batchToUpdate = currentBatch;

    // Account for 0 & NaN (From entering a non-numeric character)
    if (parsedSplitValue <= 0 || Number.isNaN(parsedSplitValue)) return;

    // This is a parent, find any children that are failing and consolidate
    // them before doing any other operations.
    if (!currentBatch.parentBatch) {
      const child = this.findBatchWithSameReason({
        itemBatch: { ...currentBatch, option: this.VVMREASON },
      });
      if (child) {
        // setState would be to slow, need an instant assignment.
        currentBatch.totalQuantity = child.totalQuantity + currentBatch.totalQuantity;
        this.removeRow({ itemBatch: child });
        parsedSplitValue += child.totalQuantity;
      }
    }

    // Fully updating, not creation of rows.
    if (parsedSplitValue >= currentBatch.totalQuantity) {
      newObjectValues = {
        ...newObjectValues,
        vvmStatus: false,
        option: this.VVMREASON || null,
        hasBreached: currentBatch.hasBreached,
      };
    } else {
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
      const childBatch = createRowObject(currentBatch, newBatchValues);
      data.push(childBatch);
      currentBatch.childrenBatches.push(childBatch);
      newObjectValues = {
        vvmStatus: true,
        totalQuantity: currentBatch.totalQuantity - parsedSplitValue,
      };
    }
    this.updateObject(newObjectValues, { isModalOpen: false }, currentBatch);
  };

  onApplyChanges = shouldApply => async () => {
    const { navigateBack, runWithLoadingIndicator } = this.props;
    this.onModalUpdate()();
    if (shouldApply) {
      await runWithLoadingIndicator(() => {
        const { database, currentUser: user } = this.props;
        const { data: itemBatches } = this.state;
        database.write(() => {
          itemBatches
            .filter(batch => !batch.option)
            .forEach(itemBatch => {
              database.update('ItemBatch', {
                id: itemBatch.id,
                location: itemBatch.location,
              });
            });
        });
        vaccineDisposalAdjustments({ database, user, itemBatches });
      });
      if (navigateBack) navigateBack();
    }
  };

  // Called on cancelling a disposal. Find if the batches
  // parent has an Option applied. If not, apply the totalQuantity
  // of this batch to the parent, otherwise just clear the option
  // from this batch, there can be no other batches with the same
  // option to consolidate with.
  onRemoveDisposal = ({ itemBatch }) => () => {
    const { parentBatch } = itemBatch;
    if (parentBatch && !parentBatch.option) {
      this.removeRow({ itemBatch });
      return this.updateObject(
        {
          totalQuantity: parentBatch.totalQuantity + itemBatch.totalQuantity,
        },
        {},
        parentBatch
      );
    }
    if (!parentBatch) {
      const batchesWithNoReason = itemBatch.childrenBatches.filter(batch => !batch.option);
      if (batchesWithNoReason.length > 0) {
        const [batchWithNoReason] = batchesWithNoReason;
        this.removeRow({ itemBatch: batchWithNoReason });
        return this.updateObject(
          {
            option: null,
            vvmStatus: null,
            totalQuantity: itemBatch.totalQuantity + batchWithNoReason.totalQuantity,
          },
          { isModalOpen: false },
          itemBatch
        );
      }
    }
    return this.updateObject({ option: null, vvmStatus: null }, { isModalOpen: false }, itemBatch);
  };

  // After selecting a reason for disposal, try to find a matching
  // batch with the same reason, and same batch code. If succesful,
  // apply split value to that batch, otherwise, apply reason to
  // this ItemBatch.
  onDispose = ({ item: option }) => {
    const { currentBatch, data } = this.state;
    const { totalQuantity } = currentBatch;

    const batchWithSameReason = this.findBatchWithSameReason({
      itemBatch: { ...currentBatch, option },
    });
    if (batchWithSameReason) {
      return this.updateObject(
        { totalQuantity: batchWithSameReason.totalQuantity + totalQuantity },
        { isModalOpen: false, modalKey: null, currentBatch: null },
        batchWithSameReason
      );
    }
    if (currentBatch.parentBatch) data.push(currentBatch);

    return this.updateObject({ option, vvmStatus: null }, { isModalOpen: false });
  };

  // On applying a reason, a split value is entered by the user.
  // If this split value is:
  // Not numeric or less than 0, ignore the action.
  // >= the batches totalQuantity - open a modal to select a reason and apply it.
  // < totalQuantity - create a new rowObject with a totalQuantity equal to the
  // split value, update the currentBatches totalQuantity and set the new batch
  // as the new currentBatch, then open a modal for reason selection.
  onEnterReasonSplitValue = (splitValue = 0) => {
    const { currentBatch: baseBatch } = this.state;
    const { totalQuantity } = baseBatch;
    let currentBatch;
    let parentBatch = baseBatch;
    if (baseBatch.parentBatch) parentBatch = baseBatch.parentBatch;

    let parsedSplitValue = parseInt(splitValue, 10);
    if (parsedSplitValue <= 0 || Number.isNaN(parsedSplitValue)) return;

    if (parsedSplitValue < totalQuantity) {
      currentBatch = createRowObject(parentBatch, {
        id: generateUUID(),
        totalQuantity: parsedSplitValue,
        hasBreached: parentBatch.hasBreached,
        parentBatch,
      });
      parentBatch.childrenBatches.push(currentBatch);
    }
    if (parsedSplitValue >= totalQuantity) {
      parsedSplitValue = 0;
      currentBatch = baseBatch;
    }
    this.updateObject(
      { totalQuantity: totalQuantity - parsedSplitValue },
      {
        modalKey: 'disposalReason',
        currentBatch,
        isModalOpen: true,
      }
    );
  };

  // Called on selecting a fridge in the fridge selection modal,
  // just update the location of the currentBatch and close the modal.
  onFridgeSelection = ({ item: location }) => {
    this.updateObject({ location }, { isModalOpen: false });
  };

  // Called on toggle the vvm toggle bar. If prior to toggling VVM Status is:
  // Null - just set to true.
  // True - Split the batch, open a modal.
  // False - If the batch has a parent with a passed VVM status, apply the total
  // Quantity of this row to that batch and delete this row. Otherwise, just set
  // this VVM status to true.
  onVvmToggle = ({ modalKey, currentBatch }) => () => {
    const { vvmStatus, parentBatch } = currentBatch;
    let batchToUpdate = currentBatch;
    let updateObject = {};
    if (vvmStatus === null) updateObject = { vvmStatus: true, option: null };
    else if (vvmStatus === true) return this.onModalUpdate({ modalKey, currentBatch })();
    else {
      updateObject = { vvmStatus: true, option: null };
      if (parentBatch && parentBatch.vvmStatus) {
        const { totalQuantity } = parentBatch;
        this.removeRow({ itemBatch: currentBatch });
        updateObject.totalQuantity = totalQuantity + currentBatch.totalQuantity;
        batchToUpdate = parentBatch;
      }
    }
    return this.updateObject(updateObject, {}, batchToUpdate);
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
    const { vvmStatus, option } = itemBatch;
    const usingFridge = vvmStatus !== false && this.HAS_FRIDGES && !option;

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
            iconColour={SUSSOL_ORANGE}
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
            iconColour={SUSSOL_ORANGE}
          />
        );
      case 'dispose':
        return (
          <IconCell
            text={option && option.title}
            icon={option ? 'times' : 'trash'}
            iconSize={option ? 20 : 30}
            onPress={
              option ? this.onRemoveDisposal({ itemBatch }) : this.onModalUpdate(modalUpdateProps)
            }
            iconColour={option ? SUSSOL_ORANGE : DARK_GREY}
          />
        );
      case 'vvmStatus':
        return (
          <MiniToggleBar
            leftText="PASS"
            rightText="FAIL"
            currentState={vvmStatus}
            onPress={this.onVvmToggle(modalUpdateProps)}
            disabled={!!option}
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
      case 'disposalReason': {
        return (
          <GenericChoiceList
            data={this.REASONS}
            keyToDisplay="title"
            onPress={this.onDispose}
            highlightValue={currentBatch && currentBatch.option ? currentBatch.option.title : null}
          />
        );
      }
      case 'dispose':
      case 'vvmStatus': {
        return (
          <TextEditor
            text=""
            onEndEditing={
              modalKey === 'vvmStatus' ? this.onSplitBatch : this.onEnterReasonSplitValue
            }
          />
        );
      }
      case 'breach': {
        return (
          <BreachTable
            {...this.props}
            breaches={this.getBreaches()}
            itemBatchFilter={
              currentBatch && currentBatch.parentBatch ? currentBatch.parentBatch : currentBatch
            }
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
  runWithLoadingIndicator: PropTypes.func.isRequired,
};

export default ManageVaccineItemPage;
