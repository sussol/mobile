/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';

import { formatExpiryDate } from '../../utilities';

import { PageInfo } from '../PageInfo/PageInfo';

import { tableStrings, generalStrings } from '../../localization';
import { DARKER_GREY, SUSSOL_ORANGE } from '../../globalStyles';

export const ItemDetailsComponent = ({ item }) => {
  const headers = {
    batch: generalStrings.batch_name,
    expiryDate: generalStrings.expiry_date,
    numberOfPacks: generalStrings.quantity,
    category: tableStrings.category,
    department: tableStrings.department,
    usage: tableStrings.monthly_usage_s,
  };

  const formatters = {
    expiryDate: expiryDate => formatExpiryDate(expiryDate),
  };

  const getRow = (title, info) => ({ info, title });

  const getBatchColumn = field =>
    item.batchesWithStock.map(itemBatch => {
      const title = headers[field];

      const data = itemBatch[field];
      const info =
        (formatters[field] && formatters[field](data)) || data || generalStrings.not_available;

      return getRow(title, info);
    });

  const getBatchInfo = () => {
    const batchNameColumn = getBatchColumn('batch');
    const expiryDateColumn = getBatchColumn('expiryDate');
    const quantityColumn = getBatchColumn('numberOfPacks');

    return [batchNameColumn, expiryDateColumn, quantityColumn];
  };

  const getItemInfo = () => {
    const { categoryName, departmentName, monthlyUsage } = item;

    const categoryRow = {
      title: `${tableStrings.category}:`,
      info: categoryName || generalStrings.not_available,
    };
    const departmentRow = {
      title: `${tableStrings.department}:`,
      info: departmentName || generalStrings.not_available,
    };
    const usageRow = { title: `${tableStrings.monthly_usage_s}:`, info: Math.round(monthlyUsage) };

    return [[categoryRow, departmentRow, usageRow]];
  };

  return (
    <ScrollView indicatorStyle="white" style={localStyles.container}>
      <PageInfo titleColor={SUSSOL_ORANGE} infoColor="white" columns={getItemInfo()} />
      <PageInfo titleColor={SUSSOL_ORANGE} infoColor="white" columns={getBatchInfo()} />
    </ScrollView>
  );
};

export const ItemDetails = React.memo(ItemDetailsComponent);

const localStyles = {
  container: {
    height: 250,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 50,
    backgroundColor: DARKER_GREY,
  },
};

ItemDetailsComponent.propTypes = {
  item: PropTypes.object.isRequired,
};
