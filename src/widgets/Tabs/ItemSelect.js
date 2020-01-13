/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';

import { PageButton } from '../PageButton';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { SimpleTable } from '../SimpleTable';
import { PrescriptionCart } from '../PrescriptionCart';
import { FlexRow } from '../FlexRow';
import { FlexColumn } from '../FlexColumn';
import { FlexView } from '../FlexView';

import { UIDatabase } from '../../database';
import { getColumns } from '../../pages/dataTableUtilities';

import { selectHasItemsAndQuantity } from '../../selectors/prescription';

import { WizardActions } from '../../actions/WizardActions';
import { PrescriptionActions } from '../../actions/PrescriptionActions';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func} transaction    Underlying realm Transaction for this script.
 * @prop {Func} chooseItem     Callback for selecting an item.
 * @prop {Func} nextTab        Callback for transitioning to the next step.
 * @prop {Func} updateQuantity Callback for updating an items quantity.
 */
const ItemSelectComponent = ({
  transaction,
  chooseItem,
  nextTab,
  updateQuantity,
  canProceed,
  isComplete,
}) => {
  const columns = React.useMemo(() => getColumns('itemSelect'), []);
  const disabledRows = UIDatabase.objects('Item').reduce(
    (acc, value) => ({ ...acc, [value.id]: value.totalQuantity <= 0 }),
    {}
  );

  const selectedRows = transaction.items.reduce(
    (acc, { item }) => ({ ...acc, [item.id]: true }),
    {}
  );

  const itemSelection = React.useMemo(() => {
    const sortedItems = UIDatabase.objects('Item').sorted('name');
    const itemsWithStock = sortedItems.filtered('ANY batches.numberOfPacks > 0').slice();
    const itemsWithoutStock = sortedItems.filtered('ALL batches.numberOfPacks == 0').slice();
    return [...itemsWithStock, ...itemsWithoutStock];
  }, []);

  return (
    <>
      <PrescriptionInfo />
      <FlexRow flex={1}>
        <FlexView flex={10}>
          <SimpleTable
            data={itemSelection}
            columns={columns}
            disabledRows={disabledRows}
            selectedRows={selectedRows}
            selectRow={chooseItem}
            isDisabled={isComplete}
          />
        </FlexView>
        <FlexColumn flex={15}>
          <ScrollView>
            <PrescriptionCart
              items={transaction.items.slice()}
              onChangeQuantity={updateQuantity}
              isDisabled={isComplete}
            />
          </ScrollView>
          <PageButton
            isDisabled={!canProceed}
            text="Next"
            onPress={nextTab}
            style={{ alignSelf: 'flex-end' }}
          />
        </FlexColumn>
      </FlexRow>
    </>
  );
};

const mapDispatchToProps = dispatch => {
  const chooseItem = itemID => dispatch(PrescriptionActions.addItem(itemID));
  const nextTab = () => dispatch(WizardActions.nextTab());
  const updateQuantity = (id, quantity) => dispatch(PrescriptionActions.editQuantity(id, quantity));
  return { nextTab, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { prescription, wizard } = state;
  const { isComplete } = wizard;
  const { transaction } = prescription;

  const canProceed = selectHasItemsAndQuantity(state);

  return { transaction, canProceed, isComplete };
};

ItemSelectComponent.propTypes = {
  transaction: PropTypes.object.isRequired,
  chooseItem: PropTypes.func.isRequired,
  nextTab: PropTypes.func.isRequired,
  updateQuantity: PropTypes.func.isRequired,
  canProceed: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
};

export const ItemSelect = connect(mapStateToProps, mapDispatchToProps)(ItemSelectComponent);
