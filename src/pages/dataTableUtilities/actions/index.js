/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { CellActionsLookup } from './cellActions';
import { RowActionsLookup } from './rowActions';
import { TableActionsLookup } from './tableActions';
import { PageActionsLookup } from './pageActions';

export { ACTIONS } from './constants';

export const PageActions = {
  ...CellActionsLookup,
  ...RowActionsLookup,
  ...TableActionsLookup,
  ...PageActionsLookup,
};
