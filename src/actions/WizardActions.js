/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const WIZARD_ACTIONS = {
  NEXT_TAB: 'Wizard/NEXT_TAB',
  SWITCH_TAB: 'Wizard/SWITCH_TAB',
  COMPLETE: 'Wizard/COMPLETE',
  PREVIOUS_TAB: 'Wizard/PREVIOUS_TAB',
};

export const WizardActions = {
  nextTab: () => ({ type: WIZARD_ACTIONS.NEXT_TAB }),
  switchTab: tab => ({ type: WIZARD_ACTIONS.SWITCH_TAB, payload: { tab } }),
  complete: () => ({ type: WIZARD_ACTIONS.COMPLETE }),
  previousTab: () => ({ type: WIZARD_ACTIONS.PREVIOUS_TAB }),
};
