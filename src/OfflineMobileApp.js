/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
} from 'react-native';

import {
  CustomerInvoicePage,
  CustomerInvoicesPage,
  CustomerPage,
  CustomersPage,
  MenuPage,
  StockHistoriesPage,
  StockHistoryPage,
  StockPage,
  StocktakeEditPage,
  StocktakeManagePage,
  StocktakesPage,
  SupplierInvoicePage,
  SupplierInvoicesPage,
} from './pages';

import Synchronizer from './sync/Synchronizer';

const {
  CardStack: NavigationCardStack,
  Header: NavigationHeader,
  StateUtils: NavigationStateUtils,
  RootContainer: NavigationRootContainer,
} = NavigationExperimental;

const BACK_ACTION = NavigationRootContainer.getBackAction().type;
const PUSH_ACTION = 'push';
const INITIAL_ACTION = 'RootContainerInitialAction';

const NavigationReducer = (currentState, action) => {
  switch (action.type) {
    case INITIAL_ACTION:
      return {
        index: 0,
        key: 'root',
        children: [{ key: 'menu' }],
      };
    case PUSH_ACTION:
      return NavigationStateUtils.push(currentState, {
        key: action.key,
        title: action.title,
      });
    case BACK_ACTION:
      return currentState.index > 0 ?
        NavigationStateUtils.pop(currentState) :
        currentState;
    default:
      return currentState;
  }
};

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
  }

  componentWillMount() {
    this.synchronizer.synchronize();
    this.renderNavigation = this.renderNavigation.bind(this);
    this.renderNavigationBar = this.renderNavigationBar.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderTitleComponent = this.renderTitleComponent.bind(this);
  }

  renderNavigation(navigationState, onNavigate) {
    return (
      <NavigationCardStack
        navigationState={navigationState}
        onNavigate={onNavigate}
        renderScene={this.renderScene}
        renderOverlay={this.renderNavigationBar}
      />
    );
  }

  renderNavigationBar(props) {
    return (
      <NavigationHeader
        {...props}
        renderTitleComponent={this.renderTitleComponent}
      />
    );
  }

  renderTitleComponent(props) {
    return (
      <NavigationHeader.Title>
        {props.scene.navigationState.title && props.scene.navigationState.title}
      </NavigationHeader.Title>
    );
  }

  renderScene(props) {
    const navigateTo = (key, title) => {
      props.onNavigate({ type: 'push', key, title });
    };
    let page;
    switch (props.scene.navigationState.key) {
      case 'menu':
        page = <MenuPage navigateTo={navigateTo} />;
        break;
      case 'customers':
        page = <CustomersPage navigateTo={navigateTo} />;
        break;
      case 'customer':
        page = <CustomerPage navigateTo={navigateTo} />;
        break;
      case 'stock':
        page = <StockPage navigateTo={navigateTo} />;
        break;
      case 'stocktakes':
        page = <StocktakesPage navigateTo={navigateTo} />;
        break;
      case 'stocktakeEditor':
        page = <StocktakeEditPage navigateTo={navigateTo} />;
        break;
      case 'stocktakeManager':
        page = <StocktakeManagePage navigateTo={navigateTo} />;
        break;
      case 'customerInvoices':
        page = <CustomerInvoicesPage navigateTo={navigateTo} />;
        break;
      case 'customerInvoice':
        page = <CustomerInvoicePage navigateTo={navigateTo} />;
        break;
      case 'supplierInvoices':
        page = <SupplierInvoicesPage navigateTo={navigateTo} />;
        break;
      case 'supplierInvoice':
        page = <SupplierInvoicePage navigateTo={navigateTo} />;
        break;
      case 'stockHistories':
        page = <StockHistoriesPage navigateTo={navigateTo} />;
        break;
      case 'stockHistory':
        page = <StockHistoryPage navigateTo={navigateTo} />;
        break;
      default:
        page = <MenuPage navigateTo={navigateTo} />;
    }
    return (
      <View style={[styles.navBarOffset, styles.main]}>
        {page}
      </View>
    );
  }

  render() {
    return (
      <NavigationRootContainer
        reducer={NavigationReducer}
        ref={navRootContainer => { this.navRootContainer = navRootContainer; }}
        renderNavigation={this.renderNavigation}
      />
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  navBarOffset: {
    marginTop: NavigationHeader.HEIGHT,
  },
});
