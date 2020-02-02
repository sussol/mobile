/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PageButton } from '../PageButton';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { SimpleTable } from '../SimpleTable';
import { PrescriptionCart } from '../PrescriptionCart';
import { FlexRow } from '../FlexRow';
import { FlexColumn } from '../FlexColumn';
import { FlexView } from '../FlexView';

import { getColumns } from '../../pages/dataTableUtilities';

import {
  selectHasItemsAndQuantity,
  selectItemSearchTerm,
  selectFilteredAndSortedItems,
  selectSelectedRows,
} from '../../selectors/prescription';

import { WizardActions } from '../../actions/WizardActions';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import { SearchBar } from '../SearchBar';
import { generalStrings } from '../../localization';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func}   chooseItem     Callback for selecting an item.
 * @prop {Func}   nextTab        Callback for transitioning to the next step.
 * @prop {Bool}   canProceed     Indicator whether this step is complete.
 * @prop {Bool}   isComplete     Indicator whether the prescription is complete.
 * @prop {String} itemSearchTerm String used for filtering items.
 * @prop {Func}   filterItems    Callback for filtering items.
 * @prop {Array}  items          Array of sorted and filtered items to choose from.
 * @prop {Object} selectedItems  Object of itemID:bool key value pairs, indicating if selected.
 */
const ItemSelectComponent = ({
  chooseItem,
  nextTab,
  canProceed,
  isComplete,
  itemSearchTerm,
  filterItems,
  items,
  selectedRows,
  onDelete,
}) => {
  const columns = React.useMemo(() => getColumns('itemSelect'), []);

  return (
    <>
      <PrescriptionInfo />
      <FlexRow flex={1}>
        <FlexView flex={10}>
          <SearchBar
            onChangeText={filterItems}
            value={itemSearchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.item_name}`}
          />
          <SimpleTable
            data={items}
            columns={columns}
            selectedRows={selectedRows}
            selectRow={chooseItem}
            isDisabled={isComplete}
          />
        </FlexView>
        <FlexColumn flex={15}>
          <PrescriptionCart isDisabled={isComplete} />

          <FlexRow justifyContent="flex-end">
            <PageButton text="Cancel" onPress={onDelete} />
            <PageButton isDisabled={!canProceed} text="Next" onPress={nextTab} />
          </FlexRow>
        </FlexColumn>
      </FlexRow>
    </>
  );
};

const mapDispatchToProps = dispatch => {
  const chooseItem = itemID => dispatch(PrescriptionActions.addItem(itemID));
  const nextTab = () => dispatch(WizardActions.nextTab());
  const updateQuantity = (id, quantity) => dispatch(PrescriptionActions.editQuantity(id, quantity));
  const filterItems = searchTerm => dispatch(PrescriptionActions.filter(searchTerm));
  const onDelete = () => dispatch(PrescriptionActions.cancelPrescription());
  return { onDelete, filterItems, nextTab, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { wizard } = state;
  const { isComplete } = wizard;
  const itemSearchTerm = selectItemSearchTerm(state);
  const items = selectFilteredAndSortedItems(state);
  const selectedRows = selectSelectedRows(state);
  const canProceed = selectHasItemsAndQuantity(state);

  return { selectedRows, itemSearchTerm, items, canProceed, isComplete };
};

ItemSelectComponent.propTypes = {
  chooseItem: PropTypes.func.isRequired,
  nextTab: PropTypes.func.isRequired,
  canProceed: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
  itemSearchTerm: PropTypes.string.isRequired,
  filterItems: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  selectedRows: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export const ItemSelect = connect(mapStateToProps, mapDispatchToProps)(ItemSelectComponent);
