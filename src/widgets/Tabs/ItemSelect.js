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

import { UIDatabase } from '../../database';
import { getColumns } from '../../pages/dataTableUtilities';
import {
  selectPrescriber,
  selectItem,
  switchTab,
  editQuantity,
} from '../../reducers/PrescriptionReducer';

import { PrescriptionCart } from '../PrescriptionCart';
import { FlexRow } from '../FlexRow';
import { FlexColumn } from '../FlexColumn';
import { FlexView } from '../FlexView';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func} transaction    Underlying realm Transaction for this script.
 * @prop {Func} chooseItem     Callback for selecting an item.
 * @prop {Func} nextTab        Callback for transitioning to the next step.
 * @prop {Func} updateQuantity Callback for updating an items quantity.
 */
const ItemSelectComponent = ({ transaction, chooseItem, nextTab, updateQuantity }) => {
  const columns = getColumns('itemSelect');
  const disabledRows = UIDatabase.objects('Item').reduce(
    (acc, value) => ({ ...acc, [value.id]: value.totalQuantity <= 0 }),
    {}
  );

  const selectedRows = transaction.items.reduce(
    (acc, { item }) => ({ ...acc, [item.id]: true }),
    {}
  );
  return (
    <>
      <PrescriptionInfo />
      <FlexRow flex={1}>
        <FlexView flex={10}>
          <SimpleTable
            data={UIDatabase.objects('Item')}
            columns={columns}
            disabledRows={disabledRows}
            selectedRows={selectedRows}
            selectRow={chooseItem}
          />
        </FlexView>
        <FlexColumn flex={15}>
          <PrescriptionCart items={transaction.items.slice()} onChangeQuantity={updateQuantity} />
          <PageButton text="Next" onPress={() => nextTab(1)} style={{ alignSelf: 'flex-end' }} />
        </FlexColumn>
      </FlexRow>
    </>
  );
};

const mapDispatchToProps = dispatch => {
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const chooseItem = itemID => dispatch(selectItem(itemID));
  const nextTab = currentTab => dispatch(switchTab(currentTab + 1));
  const updateQuantity = (id, quantity) => dispatch(editQuantity(id, quantity));
  return { nextTab, choosePrescriber, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { prescription } = state;
  return { ...prescription };
};

ItemSelectComponent.propTypes = {
  transaction: PropTypes.object.isRequired,
  chooseItem: PropTypes.func.isRequired,
  nextTab: PropTypes.func.isRequired,
  updateQuantity: PropTypes.func.isRequired,
};

export const ItemSelect = connect(mapStateToProps, mapDispatchToProps)(ItemSelectComponent);
