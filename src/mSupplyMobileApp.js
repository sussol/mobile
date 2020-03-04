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
import {
  BackHandler,
  Image,
  AppState,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Scheduler } from 'sussol-utilities';
import { NavigationActions } from '@react-navigation/core';
import { MainStackNavigator } from './navigation/Navigator';

import { FirstUsePage } from './pages';

import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import { FinaliseButton, NavigationBar, SyncState, Spinner } from './widgets';
import { FinaliseModal, LoginModal } from './widgets/modals';

import { getCurrentRouteName, ROUTES } from './navigation';
import { syncCompleteTransaction, setSyncError } from './actions/SyncActions';
import { FinaliseActions } from './actions/FinaliseActions';
import { migrateDataToVersion } from './dataMigration';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import Settings from './settings/MobileAppSettings';
import Database from './database/BaseDatabase';
import { UIDatabase } from './database';
import { SETTINGS_KEYS } from './settings';

import globalStyles, { textStyles, SUSSOL_ORANGE } from './globalStyles';
import { LoadingIndicatorContext } from './context/LoadingIndicatorContext';
import { UserActions } from './actions';
import { debounce } from './utilities';
import { SupplierCredit } from './widgets/modalChildren/SupplierCredit';
import { ModalContainer } from './widgets/modals/ModalContainer';
import { SupplierCreditActions } from './actions/SupplierCreditActions';
import { PrescriptionActions } from './actions/PrescriptionActions';
import { selectTitle } from './selectors/supplierCredit';
import { MenuPage } from './pages/MenuPage';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.

class MSupplyMobileAppContainer extends React.Component {
  handleBackEvent = debounce(
    () => {
      const { dispatch, prevRouteName, currentRouteName } = this.props;
      const { syncModalIsOpen } = this.state;

      // If finalise or sync modals are open, close them rather than navigating.
      if (syncModalIsOpen) {
        this.setState({ syncModalIsOpen: false });
        return true;
      }
      // If we are on base screen (e.g. home), back button should close app as we can't go back.
      if (!this.getCanNavigateBack()) {
        BackHandler.exitApp();
      } else {
        dispatch({ ...NavigationActions.back(), payload: { prevRouteName } });
      }
      if (currentRouteName === ROUTES.PRESCRIPTION) {
        UIDatabase.write(() => {
          UIDatabase.delete(
            'Transaction',
            UIDatabase.objects('Prescription').filtered('status != $0', 'finalised')
          );
          dispatch(PrescriptionActions.deletePrescription());
        });
      }

      return true;
    },
    400,
    true
  );

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
      syncModalIsOpen: false,
      appState: null,
    };
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackEvent);

    if (!__DEV__) {
      AppState.addEventListener('change', this.onAppStateChange);
    }
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackEvent);

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

  getCanNavigateBack = () => {
    const { navigationState } = this.props;

    return navigationState?.index !== 0;
  };

  // eslint-disable-next-line class-methods-use-this
  getCurrentRouteName(navigationState) {
    if (!navigationState) return null;

    const route = navigationState?.routes[navigationState?.index];

    // dive into nested navigators
    if (route.routes) return getCurrentRouteName(route);

    return route.routeName;
  }

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
    const { syncState, dispatch } = this.props;
    const { isInitialised } = this.state;

    if (!isInitialised || syncState.isSyncing) return; // Ignore if syncing.

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

  renderLogo = () => {
    const { isInAdminMode } = this.state;

    return (
      <TouchableWithoutFeedback
        delayLongPress={3000}
        onLongPress={() => this.setState({ isInAdminMode: !isInAdminMode })}
      >
        <Image resizeMode="contain" source={require('./images/logo.png')} />
      </TouchableWithoutFeedback>
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

  renderPageTitle = () => {
    const { currentTitle } = this.props;
    return <Text style={textStyles}>{currentTitle}</Text>;
  };

  renderSyncState = () => {
    const { syncState } = this.props;
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row' }}
        onPress={() => this.setState({ syncModalIsOpen: true })}
      >
        <SyncState state={syncState} />
      </TouchableOpacity>
    );
  };

  render() {
    const {
      finaliseItem,
      navigationState,
      syncState,
      currentUser,
      finaliseModalOpen,
      closeFinaliseModal,
      closeSupplierCreditModal,
      supplierCreditModalOpen,
      creditTitle,
    } = this.props;
    const { isInitialised, isLoading, syncModalIsOpen } = this.state;

    if (!isInitialised) {
      return (
        <FirstUsePage
          synchroniser={this.synchroniser}
          onInitialised={this.onInitialised}
          syncState={syncState}
        />
      );
    }

    return (
      <LoadingIndicatorContext.Provider value={this.runWithLoadingIndicator}>
        <View style={globalStyles.appBackground}>
          <NavigationBar
            routeName={this.getCurrentRouteName(navigationState)}
            onPressBack={this.getCanNavigateBack() ? this.handleBackEvent : null}
            LeftComponent={this.getCanNavigateBack() ? this.renderPageTitle : null}
            CentreComponent={this.renderLogo}
            RightComponent={
              finaliseItem && finaliseItem?.visibleButton
                ? this.renderFinaliseButton
                : this.renderSyncState
            }
          />
          <MainStackNavigator.Navigator>
            <MainStackNavigator.Screen name="root" component={MenuPage} />
          </MainStackNavigator.Navigator>

          <FinaliseModal
            database={UIDatabase}
            isOpen={finaliseModalOpen}
            onClose={closeFinaliseModal}
            finaliseItem={finaliseItem}
            user={currentUser}
            runWithLoadingIndicator={this.runWithLoadingIndicator}
          />
          <SyncModal
            database={UIDatabase}
            isOpen={syncModalIsOpen}
            state={syncState}
            onPressManualSync={this.synchronise}
            onClose={() => this.setState({ syncModalIsOpen: false })}
          />
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

  return { dispatch, openFinaliseModal, closeFinaliseModal, closeSupplierCreditModal };
};

const mapStateToProps = state => {
  const { finalise, sync: syncState, supplierCredit } = state;
  const { open: supplierCreditModalOpen } = supplierCredit;
  const { finaliseModalOpen } = finalise;

  return {
    syncState,
    currentUser: state.user.currentUser,
    finaliseModalOpen,
    supplierCreditModalOpen,
    creditTitle: selectTitle(state),
  };
};

MSupplyMobileAppContainer.defaultProps = {
  currentUser: null,
  currentTitle: '',
  finaliseItem: null,
  creditTitle: '',
};

MSupplyMobileAppContainer.propTypes = {
  currentTitle: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  finaliseItem: PropTypes.object,
  navigationState: PropTypes.object.isRequired,
  syncState: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  prevRouteName: PropTypes.string.isRequired,
  finaliseModalOpen: PropTypes.bool.isRequired,
  openFinaliseModal: PropTypes.func.isRequired,
  closeFinaliseModal: PropTypes.func.isRequired,
  closeSupplierCreditModal: PropTypes.func.isRequired,
  supplierCreditModalOpen: PropTypes.bool.isRequired,
  currentRouteName: PropTypes.string.isRequired,
  creditTitle: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(MSupplyMobileAppContainer);
