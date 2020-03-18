/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { recordKeyExtractor, getItemLayout } from '../../pages/dataTableUtilities';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';
import { FlexRow } from '../FlexRow';
import { PageButton } from '../PageButton';

import { SupplierCreditActions } from '../../actions/SupplierCreditActions';
import {
  selectSortFields,
  selectSortedBatches,
  selectColumns,
  selectCategoryName,
} from '../../selectors/supplierCredit';

import { WHITE } from '../../globalStyles';
import { modalStrings, dispensingStrings } from '../../localization';
import { DropDown } from '../DropDown';
import { selectUsingSupplierCreditCategories } from '../../selectors/modules';
import { UIDatabase } from '../../database/index';

const SupplierCreditComponent = ({
  onSortColumn,
  sortKey,
  isAscending,
  batches,
  onEditReturnAmount,
  onSave,
  columns,
  usingSupplierCreditCategories,
  categoryName,
  onEditCategory,
}) => {
  const categories = React.useMemo(() => UIDatabase.objects('SupplierCreditCategory'), []);
  const categoryNames = React.useMemo(() => categories.map(({ name }) => name), []);
  const onSelectCategory = React.useCallback((_, index) => {
    onEditCategory(categories[index]);
  }, []);

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        onPress={onSortColumn}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const getCallback = () => onEditReturnAmount;

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;

      const rowKey = recordKeyExtractor(item);
      return (
        <DataTableRow
          rowData={item}
          rowKey={rowKey}
          columns={columns}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [columns]
  );

  return (
    <View style={localStyles.mainContainer}>
      {usingSupplierCreditCategories && (
        <DropDown
          headerValue={dispensingStrings.select_a_supplier_credit_category}
          values={categoryNames}
          selectedValue={categoryName}
          onValueChange={onSelectCategory}
        />
      )}
      <DataTable
        renderRow={renderRow}
        data={batches}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
      <FlexRow alignItems="flex-end" justifyContent="flex-end">
        <PageButton text={modalStrings.confirm} onPress={onSave} style={{ margin: 7 }} />
      </FlexRow>
    </View>
  );
};

const mapStateToProps = state => {
  const { sortKey, isAscending } = selectSortFields(state);
  const batches = selectSortedBatches(state);
  const columns = selectColumns(state);
  const categoryName = selectCategoryName(state);
  const usingSupplierCreditCategories = selectUsingSupplierCreditCategories(state);

  return { sortKey, categoryName, isAscending, batches, columns, usingSupplierCreditCategories };
};

const mapDispatchToProps = dispatch => ({
  onSortColumn: sortKey => dispatch(SupplierCreditActions.sort(sortKey)),
  onSave: () => dispatch(SupplierCreditActions.create()),
  onEditCategory: category => dispatch(SupplierCreditActions.editCategory(category)),
  onEditReturnAmount: (returnAmount, batchId) =>
    dispatch(SupplierCreditActions.editReturnAmount(returnAmount, batchId)),
});

export const SupplierCredit = connect(mapStateToProps, mapDispatchToProps)(SupplierCreditComponent);

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
};

SupplierCreditComponent.defaultProps = {
  categoryName: '',
};

SupplierCreditComponent.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  isAscending: PropTypes.bool.isRequired,
  batches: PropTypes.array.isRequired,
  onEditReturnAmount: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onEditCategory: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  usingSupplierCreditCategories: PropTypes.bool.isRequired,
  categoryName: PropTypes.string,
};
