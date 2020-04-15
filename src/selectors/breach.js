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
  const { forItem, forFridge } = breach;

  if (!forFridge && !forItem) return '';

  if (forItem) {
    const { itemName } = breach;

    return `${vaccineStrings.temperature_breaches_for} ${itemName}`;
  }

  const { fridgeName } = breach;

  return `${vaccineStrings.temperature_breaches_for} ${fridgeName}`;
};
