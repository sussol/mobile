/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Navigator from '../navigation/Navigator';

const initialState = Navigator.router.getStateForAction(
  Navigator.router.getActionForPathAndParams('root')
);

const navigationReducer = (state = initialState, action) => {
  const nextState = Navigator.router.getStateForAction(action, state);
  return nextState || state;
};

export default navigationReducer;
