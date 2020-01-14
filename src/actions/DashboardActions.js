/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const DASHBOARD_ACTION_TYPES = {
  SWITCH_REPORT: 'Dashboard/switchReport',
};

export const DashboardActions = {
  switchReport: reportID => ({ type: DASHBOARD_ACTION_TYPES.SWITCH_REPORT, payload: { reportID } }),
};
