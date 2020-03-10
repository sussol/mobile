/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { FinaliseButton, SyncState, BackButton, MsupplyMan } from '../widgets';
import { navigationStyles } from '../globalStyles/navigationStyles';
import { ROUTES, FINALISABLE_PAGES } from './constants';
import {
  MenuPage,
  RealmExplorer,
  CustomerRequisitionPage,
  CustomerRequisitionsPage,
  SupplierRequisitionsPage,
  CustomerInvoicesPage,
  SupplierInvoicePage,
  SupplierInvoicesPage,
  StocktakesPage,
  StocktakeManagePage,
  StocktakeEditPage,
  CustomerInvoicePage,
  SupplierRequisitionPage,
  DispensingPage,
  PrescriptionPage,
  CashRegisterPage,
  SettingsPage,
  DashboardPage,
  StockPage,
} from '../pages';

export const DEFAULT_SCREEN_OPTIONS = {
  headerLeft: () => <BackButton />,
  headerTitleAlign: 'center',
  headerTitle: MsupplyMan,
  headerRight: () => <SyncState />,
  headerStyle: navigationStyles.headerStyle,
  headerLeftContainerStyle: navigationStyles.headerLeftContainerStyle,
  headerRightContainerStyle: navigationStyles.headerRightContainerStyle,
};

const FINALISABLE_SCREEN_OPTIONS = {
  headerRight: () => <FinaliseButton />,
};

export const MainStackNavigator = createStackNavigator();

const ROUTE_NAME_TO_PAGE = {
  [ROUTES.MENU]: MenuPage,
  [ROUTES.REALM_EXPLORER]: RealmExplorer,
  [ROUTES.CUSTOMER_REQUISITION]: CustomerRequisitionPage,
  [ROUTES.CUSTOMER_REQUISITIONS]: CustomerRequisitionsPage,
  [ROUTES.SUPPLIER_REQUISITION]: SupplierRequisitionPage,
  [ROUTES.SUPPLIER_REQUISITIONS]: SupplierRequisitionsPage,
  [ROUTES.CUSTOMER_INVOICE]: CustomerInvoicePage,
  [ROUTES.CUSTOMER_INVOICES]: CustomerInvoicesPage,
  [ROUTES.SUPPLIER_INVOICE]: SupplierInvoicePage,
  [ROUTES.SUPPLIER_INVOICES]: SupplierInvoicesPage,
  [ROUTES.STOCK]: StockPage,
  [ROUTES.STOCKTAKES]: StocktakesPage,
  [ROUTES.STOCKTAKE_MANAGER]: StocktakeManagePage,
  [ROUTES.STOCKTAKE_EDITOR]: StocktakeEditPage,
  [ROUTES.DISPENSARY]: DispensingPage,
  [ROUTES.PRESCRIPTION]: PrescriptionPage,
  [ROUTES.CASH_REGISTER]: CashRegisterPage,
  [ROUTES.SETTINGS]: SettingsPage,
  [ROUTES.DASHBOARD]: DashboardPage,
};

export const Pages = Object.values(ROUTES).reduce((acc, route) => {
  if (!ROUTE_NAME_TO_PAGE[route]) return acc;
  return [
    ...acc,
    <MainStackNavigator.Screen
      key={route}
      name={route}
      options={route in FINALISABLE_PAGES ? FINALISABLE_SCREEN_OPTIONS : DEFAULT_SCREEN_OPTIONS}
      component={ROUTE_NAME_TO_PAGE[route]}
    />,
  ];
}, []);
