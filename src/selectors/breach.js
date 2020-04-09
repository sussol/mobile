/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { vaccineStrings } from '../localization';

export const selectIsBreachModalOpen = ({ breach }) => {
  const { isModalOpen } = breach;

  return isModalOpen;
};

export const selectBreachModalTitle = ({ breach }) => {
  const { forItem, forBatch, forFridge } = breach;

  if (!forBatch && !forFridge && !forItem) return '';

  if (forBatch || forItem) {
    const { itemName } = breach;

    return `${vaccineStrings.temperature_breaches_for} ${itemName}`;
  }

  const { fridgeName } = breach;

  return `${vaccineStrings.temperature_breaches_for} ${fridgeName}`;
};
