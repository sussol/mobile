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

import { formatExpiryDate } from '../../utilities';

import { PageInfo, CloseIcon } from '..';

import { tableStrings, generalStrings } from '../../localization/index';
import { DARKER_GREY, SUSSOL_ORANGE } from '../../globalStyles';

/**
 * Modal like component. Opens a small pop-over at the bottom of the screen
 * displaying item details.
 *
 * @param {Bool}   isOpen     Indicator if this modal is open.
 * @param {Object} item       Realm Item object to display details for.
 * @param {Func}   onClose    Callback for closing the modal.
 * @param {Any}    modalProps Any additional props for the modal component.
 */
export const ItemDetailsComponent = ({ isOpen, item, onClose, ...modalProps }) => {
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

  const { modalContainer, scrollView, scrollViewContentContainer, headerRow } = localStyles;
  return (
    <Modal style={modalContainer} isOpen={isOpen} {...modalProps}>
      {isOpen && item && (
        <>
          <View style={headerRow}>
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
        </>
      )}
    </Modal>
  );
};

/**
 * This component re-renders only when isOpen changes, or the underlying
 * item object changes.
 */
const propsAreEqual = (
  { item: prevItem, isOpen: prevIsOpen },
  { item: nextItem, isOpen: nextIsOpen }
) => {
  const itemsEqual = prevItem === nextItem;
  const isOpenEqual = prevIsOpen === nextIsOpen;
  return itemsEqual && isOpenEqual;
};

export const ItemDetails = React.memo(ItemDetailsComponent, propsAreEqual);

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

ItemDetailsComponent.defaultProps = {
  item: null,
  swipeToClose: false,
  backdropPressToClose: false,
  position: 'bottom',
  backdrop: false,
};

ItemDetailsComponent.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  swipeToClose: PropTypes.bool,
  backdropPressToClose: PropTypes.bool,
  position: PropTypes.string,
  backdrop: PropTypes.bool,
};
