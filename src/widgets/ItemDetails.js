/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import Modal from 'react-native-modalbox';

import { formatExpiryDate } from '../utilities';

import { PageInfo, CloseIcon } from '.';

import { tableStrings } from '../localization/index';
import { DARKER_GREY, SUSSOL_ORANGE } from '../globalStyles';

export const ItemDetails = ({ isOpen, item, onClose, ...modalProps }) => {
  if (!item) return null;

  const headers = {
    batch: 'Batch',
    expiryDate: 'Expiry',
    numberOfPacks: 'Quantity',
    category: 'Category',
    department: 'Department',
    usage: 'Monthly Usage',
  };

  const formatters = {
    expiryDate: expiryDate => formatExpiryDate(expiryDate),
  };

  const getRow = (title, info) => ({ info, title });

  const getBatchColumn = field =>
    item.batchesWithStock.map(itemBatch => {
      const title = headers[field];

      const data = itemBatch[field];
      const info = (formatters[field] && formatters[field](data)) || data || 'N/A';

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

    const categoryRow = { title: `${tableStrings.category}:`, info: categoryName || 'N/A' };
    const departmentRow = { title: `${tableStrings.department}:`, info: departmentName || 'N/A' };
    const usageRow = { title: `${tableStrings.monthly_usage_s}:`, info: Math.round(monthlyUsage) };

    return [[categoryRow, departmentRow, usageRow]];
  };

  const { modalContainer, scrollView, scrollViewContentContainer } = localStyles;
  return (
    <Modal style={modalContainer} isOpen={isOpen} {...modalProps}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 }}>
        <TouchableOpacity onPress={onClose}>
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        indicatorStyle="white"
        contentContainerStyle={scrollViewContentContainer}
        style={scrollView}
      >
        <PageInfo titleColor={SUSSOL_ORANGE} infoColor="white" columns={getItemInfo()} />
        <PageInfo titleColor={SUSSOL_ORANGE} infoColor="white" columns={getBatchInfo()} />
      </ScrollView>
    </Modal>
  );
};

const localStyles = {
  scrollView: {
    height: 170,
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
  },
  modalContainer: { height: 200, backgroundColor: DARKER_GREY },
  scrollViewContentContainer: { paddingLeft: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 },
};

ItemDetails.defaultProps = {
  item: null,
  swipeToClose: false,
  backdropPressToClose: false,
  position: 'bottom',
  backdrop: false,
};

ItemDetails.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired,
  swipeToClose: PropTypes.bool,
  backdropPressToClose: PropTypes.bool,
  position: PropTypes.string,
  backdrop: PropTypes.bool,
};
