/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { UIDatabase } from '../database';

export const selectHasItemsAndQuantity = ({ prescription }) => {
  const { transaction } = prescription;
  const { totalQuantity = 0, items = [] } = transaction || {};
  const hasItems = items.length > 0;
  const hasQuantity = totalQuantity > 0;
  return hasItems && hasQuantity;
};

export const selectPrescriptionPatient = ({ prescription }) => {
  const { transaction } = prescription;
  const { otherParty } = transaction || {};

  return otherParty;
};

export const selectPrescriptionPrescriber = ({ prescription }) => {
  const { transaction } = prescription;
  const { prescriber } = transaction || {};

  return prescriber;
};

export const selectPrescriberName = ({ prescription }) => {
  const currentPrescriber = selectPrescriptionPrescriber({ prescription });

  return `${currentPrescriber?.firstName} ${currentPrescriber?.lastName}`.trim();
};

export const selectPatientName = state => {
  const currentPatient = selectPrescriptionPatient(state);

  return `${currentPatient?.firstName} ${currentPatient?.lastName}`.trim();
};

export const selectItemSearchTerm = ({ prescription }) => {
  const { itemSearchTerm } = prescription;

  return itemSearchTerm;
};

export const selectItems = ({ prescription }) => {
  const { items } = prescription;

  return items;
};

export const selectFilteredAndSortedItems = createSelector(
  [selectItemSearchTerm, selectItems],
  (itemSearchTerm, items) => {
    // Filter the items by the entered search term.
    const filteredItems = items.filtered('name CONTAINS[c] $0', itemSearchTerm);

    // Keep the items sorted alphabetically.
    const sortedItems = filteredItems.sorted('name');

    // Split the items by quantity - showing out-of-stock items at the end of the list.
    const itemsWithStock = sortedItems.filtered('ANY batches.numberOfPacks > 0').slice();
    const itemsWithoutStock = sortedItems.filtered('ALL batches.numberOfPacks == 0').slice();

    return [...itemsWithStock, ...itemsWithoutStock];
  }
);

export const selectNumberOfItems = ({ prescription }) => {
  const { transaction } = prescription || {};
  return transaction?.items.length || 0;
};

export const selectPrescription = ({ prescription }) => prescription.transaction;

export const selectPrescriptionItems = createSelector(
  [selectPrescription, selectNumberOfItems],
  prescription => {
    const { items } = prescription ?? {};
    return items || [];
  }
);

export const selectTransactionCategoryName = ({ prescription }) => {
  const { transaction } = prescription;
  const { category } = transaction || {};
  const { name } = category || {};
  return name ?? '';
};

export const selectTransactionComment = ({ prescription }) => {
  const { transaction } = prescription;
  const { comment } = transaction || {};
  return comment ?? '';
};

export const selectPatientType = ({ prescription }) => {
  const { transaction } = prescription;
  const { user1 } = transaction || {};
  return user1 ?? '';
};

export const selectPrescriptionCategories = () =>
  UIDatabase.objects('PrescriptionCategory').map(({ name }) => name);
