/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { vaccineStrings } from '../localization/index';

export const selectIsBreachModalOpen = ({ breach }) => {
  const { isModalOpen } = breach;

  return isModalOpen;
};

export const selectBreachModalTitle = ({ breach }) => {
  const { forBatch, forFridge } = breach;

  if (!forBatch && !forFridge) return '';

  if (forBatch) {
    const { batch } = breach;
    const { itemName } = batch;

    return `${vaccineStrings.temperature_breaches_for} ${itemName}`;
  }

  const { fridge } = breach;
  const { description } = fridge;

  return `${vaccineStrings.temperature_breaches_for} ${description}`;
};
