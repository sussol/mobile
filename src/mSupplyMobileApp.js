/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable global-require */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AppState, View } from 'react-native';

import { Scheduler } from 'sussol-utilities';

import { MainStackNavigator } from './navigation/Navigator';

import { FirstUsePage } from './pages';

import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import { FinaliseButton, SyncState, Spinner, BackButton, MsupplyMan } from './widgets';
import { FinaliseModal, LoginModal } from './widgets/modals';

import { ROUTES } from './navigation';
import { syncCompleteTransaction, setSyncError, openSyncModal } from './actions/SyncActions';
import { FinaliseActions } from './actions/FinaliseActions';
import { migrateDataToVersion } from './dataMigration';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import Settings from './settings/MobileAppSettings';
import Database from './database/BaseDatabase';
import { UIDatabase } from './database';
import { SETTINGS_KEYS } from './settings';

import globalStyles, { SUSSOL_ORANGE } from './globalStyles';
import { LoadingIndicatorContext } from './context/LoadingIndicatorContext';
import { UserActions } from './actions';

import { SupplierCredit } from './widgets/modalChildren/SupplierCredit';
import { ModalContainer } from './widgets/modals/ModalContainer';
import { SupplierCreditActions } from './actions/SupplierCreditActions';

import { selectTitle } from './selectors/supplierCredit';
import { MenuPage } from './pages/MenuPage';
import { RealmExplorer } from './pages/RealmExplorer';
import { CustomerRequisitionPage } from './pages/CustomerRequisitionPage';
import { CustomerRequisitionsPage } from './pages/CustomerRequisitionsPage';
import { SupplierRequisitionsPage } from './pages/SupplierRequisitionsPage';
import { SupplierInvoicePage } from './pages/SupplierInvoicePage';
import { SupplierInvoicesPage } from './pages/SupplierInvoicesPage';
import { StockPage } from './pages/StockPage';
import { CustomerInvoicePage } from './pages/CustomerInvoicePage';
import { CustomerInvoicesPage } from './pages/CustomerInvoicesPage';
import { StocktakesPage } from './pages/StocktakesPage';
import { StocktakeManagePage } from './pages/StocktakeManagePage';
import { StocktakeEditPage } from './pages/StocktakeEditPage';
import { DispensingPage } from './pages/DispensingPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SupplierRequisitionPage } from './pages/SupplierRequisitionPage';
import { navigationStyles } from './globalStyles/navigationStyles';
import { CashRegisterPage } from './pages/CashRegisterPage';
import { selectIsSyncing } from './selectors/sync';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.

class MSupplyMobileAppContainer extends React.Component {
  constructor(props, ...otherArgs) {
    super(props, ...otherArgs);

    migrateDataToVersion(UIDatabase, Settings);
    this.userAuthenticator = new UserAuthenticator(UIDatabase, Settings);
    this.syncAuthenticator = new SyncAuthenticator(Settings);
    this.synchroniser = new Synchroniser(
      Database,
      this.syncAuthenticator,
      Settings,
      props.dispatch
    );
    this.postSyncProcessor = new PostSyncProcessor(UIDatabase, Settings);
    this.scheduler = new Scheduler();
    const isInitialised = this.synchroniser.isInitialised();
    this.scheduler.schedule(this.synchronise, SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      const { currentUser } = this.props;
      if (currentUser !== null) {
        // Only re-authenticate if currently logged in.
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);
    this.state = {
      isInitialised,
      isLoading: false,
      appState: null,
    };
  }

  componentDidMount = () => {
    if (!__DEV__) {
      AppState.addEventListener('change', this.onAppStateChange);
    }
  };

  componentWillUnmount = () => {
    if (!__DEV__) {
      AppState.removeEventListener('change', this.onAppStateChange);
    }

    this.scheduler.clearAll();
  };

  onAppStateChange = nextAppState => {
    const { appState } = this.state;
    const { dispatch } = this.props;
    if (nextAppState?.match(/inactive|background/)) dispatch(UserActions.setTime());
    if (appState?.match(/inactive|background/) && nextAppState === 'active') {
      dispatch(UserActions.active());
    }

    this.setState({ appState: nextAppState });
  };

  onAuthentication = user => {
    const { dispatch } = this.props;
    dispatch(UserActions.login(user));
    this.postSyncProcessor.setUser(user);
  };

  onInitialised = () => {
    this.setState({ isInitialised: true });
    this.postSyncProcessor.processAnyUnprocessedRecords();
  };

  runWithLoadingIndicator = async functionToRun => {
    UIDatabase.isLoading = true;
    // We here set up an asynchronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay for the javascript thread
    // to unblock and allow the spinner animation to start up. The |functionToRun| should
    // not be run inside a |setTimeout| as that relegates to a lower priority, resulting
    // in very slow performance.
    await new Promise(resolve => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });
    functionToRun();
    this.setState({ isLoading: false });
    UIDatabase.isLoading = false;
  };

  synchronise = async () => {
    const { dispatch, isSyncing } = this.props;
    const { isInitialised } = this.state;

    if (!isInitialised || isSyncing) return;

    try {
      const syncUrl = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);
      const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
      const syncSitePasswordHash = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);

      await this.syncAuthenticator.authenticate(syncUrl, syncSiteName, null, syncSitePasswordHash);

      // True if most recent call to |this.synchroniser.synchronise()| failed.
      const lastSyncFailed = this.synchroniser.lastSyncFailed();
      const lastPostSyncProcessingFailed = this.postSyncProcessor.lastPostSyncProcessingFailed();
      await this.synchroniser.synchronise();
      if (lastSyncFailed || lastPostSyncProcessingFailed) {
        // If last sync was interrupted, it did not enter this block. If the app was closed, it did
        // not store any records left in the sync queue, so tables should be checked for unprocessed
        // records. If the last processing of the record queue was interrupted by app crash then all
        // records need to be checked.
        this.postSyncProcessor.processAnyUnprocessedRecords();
      } else {
        this.postSyncProcessor.processRecordQueue();
      }
      dispatch(syncCompleteTransaction());
    } catch (error) {
      dispatch(setSyncError(error.message));
    }
  };

  renderFinaliseButton = () => {
    const { finaliseItem, openFinaliseModal } = this.props;
    return (
      <FinaliseButton isFinalised={finaliseItem.record.isFinalised} onPress={openFinaliseModal} />
    );
  };

  renderLoadingIndicator = () => {
    const { isLoading } = this.state;
    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={isLoading} color={SUSSOL_ORANGE} />
      </View>
    );
  };

  getOptions = () => ({
    headerLeft: () => <BackButton />,
    headerTitleAlign: 'center',
    headerTitle: MsupplyMan,
    headerRight: () => <SyncState />,
    headerStyle: navigationStyles.headerStyle,
    headerLeftContainerStyle: navigationStyles.headerLeftContainerStyle,
    headerRightContainerStyle: navigationStyles.headerRightContainerStyle,
  });

  render() {
    const {
      finaliseItem,
      currentUser,
      finaliseModalOpen,
      closeFinaliseModal,
      closeSupplierCreditModal,
      supplierCreditModalOpen,
      creditTitle,
    } = this.props;
    const { isInitialised, isLoading } = this.state;

    if (!isInitialised) {
      return <FirstUsePage synchroniser={this.synchroniser} onInitialised={this.onInitialised} />;
    }

    return (
      <LoadingIndicatorContext.Provider value={this.runWithLoadingIndicator}>
        <View style={globalStyles.appBackground}>
          <MainStackNavigator.Navigator
            initialRouteName={ROUTES.ROOT}
            screenOptions={this.getOptions()}
          >
            <MainStackNavigator.Screen name={ROUTES.ROOT} component={MenuPage} />

            <MainStackNavigator.Screen
              name={ROUTES.CUSTOMER_REQUISITION}
              component={CustomerRequisitionPage}
            />

            <MainStackNavigator.Screen
              name={ROUTES.CUSTOMER_REQUISITIONS}
              component={CustomerRequisitionsPage}
            />

            <MainStackNavigator.Screen
              name={ROUTES.SUPPLIER_REQUISITION}
              component={SupplierRequisitionPage}
            />
            <MainStackNavigator.Screen
              name={ROUTES.SUPPLIER_REQUISITIONS}
              component={SupplierRequisitionsPage}
            />

            <MainStackNavigator.Screen
              name={ROUTES.SUPPLIER_INVOICE}
              component={SupplierInvoicePage}
            />
            <MainStackNavigator.Screen
              name={ROUTES.SUPPLIER_INVOICES}
              component={SupplierInvoicesPage}
            />

            <MainStackNavigator.Screen
              name={ROUTES.CUSTOMER_INVOICE}
              component={CustomerInvoicePage}
            />
            <MainStackNavigator.Screen
              name={ROUTES.CUSTOMER_INVOICES}
              component={CustomerInvoicesPage}
            />

            <MainStackNavigator.Screen name={ROUTES.STOCK} component={StockPage} />

            <MainStackNavigator.Screen name={ROUTES.STOCKTAKES} component={StocktakesPage} />
            <MainStackNavigator.Screen
              name={ROUTES.STOCKTAKE_MANAGER}
              component={StocktakeManagePage}
            />
            <MainStackNavigator.Screen
              name={ROUTES.STOCKTAKE_EDITOR}
              component={StocktakeEditPage}
            />

            <MainStackNavigator.Screen name={ROUTES.DISPENSARY} component={DispensingPage} />
            <MainStackNavigator.Screen name={ROUTES.PRESCRIPTION} component={PrescriptionPage} />

            <MainStackNavigator.Screen name={ROUTES.CASH_REGISTER} component={CashRegisterPage} />

            <MainStackNavigator.Screen name={ROUTES.REALM_EXPLORER} component={RealmExplorer} />
            <MainStackNavigator.Screen name={ROUTES.SETTINGS} component={SettingsPage} />
            <MainStackNavigator.Screen name={ROUTES.DASHBOARD} component={DashboardPage} />
          </MainStackNavigator.Navigator>

          <FinaliseModal
            isOpen={finaliseModalOpen}
            onClose={closeFinaliseModal}
            finaliseItem={finaliseItem}
            user={currentUser}
          />
          <SyncModal onPressManualSync={this.synchronise} />
          <LoginModal
            authenticator={this.userAuthenticator}
            settings={Settings}
            isAuthenticated={!!currentUser}
            onAuthentication={this.onAuthentication}
          />
          {isLoading && this.renderLoadingIndicator()}
          <ModalContainer
            isVisible={supplierCreditModalOpen}
            onClose={closeSupplierCreditModal}
            title={creditTitle}
            fullScreen
          >
            <SupplierCredit />
          </ModalContainer>
        </View>
      </LoadingIndicatorContext.Provider>
    );
  }
}

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  const closeFinaliseModal = () => dispatch(FinaliseActions.closeModal());
  const closeSupplierCreditModal = () => dispatch(SupplierCreditActions.close());

  const onOpenSyncModal = () => dispatch(openSyncModal());

  return {
    dispatch,
    onOpenSyncModal,
    openFinaliseModal,
    closeFinaliseModal,
    closeSupplierCreditModal,
  };
};

const mapStateToProps = state => {
  const { finalise, supplierCredit } = state;
  const { open: supplierCreditModalOpen } = supplierCredit;
  const { finaliseModalOpen } = finalise;

  const isSyncing = selectIsSyncing(state);

  return {
    isSyncing,
    currentUser: state.user.currentUser,
    finaliseModalOpen,
    supplierCreditModalOpen,
    creditTitle: selectTitle(state),
  };
};

MSupplyMobileAppContainer.defaultProps = {
  currentUser: null,
  finaliseItem: null,
  creditTitle: '',
};

MSupplyMobileAppContainer.propTypes = {
  isSyncing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  finaliseItem: PropTypes.object,
  currentUser: PropTypes.object,
  finaliseModalOpen: PropTypes.bool.isRequired,
  openFinaliseModal: PropTypes.func.isRequired,
  closeFinaliseModal: PropTypes.func.isRequired,
  closeSupplierCreditModal: PropTypes.func.isRequired,
  supplierCreditModalOpen: PropTypes.bool.isRequired,
  creditTitle: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(MSupplyMobileAppContainer);
