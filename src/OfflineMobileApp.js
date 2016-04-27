/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
} from 'react-native';

import {
  CustomerInvoicesPage,
  MenuPage,
  SupplierInvoicesPage,
  StockPage,
  StocktakeEditor,
  StocktakeManager,
  StocktakesPage,
} from './pages';

import Synchronizer from './sync/Synchronizer';

const {
  CardStack: NavigationCardStack,
  Header: NavigationHeader,
  StateUtils: NavigationStateUtils,
  RootContainer: NavigationRootContainer,
} = NavigationExperimental;

const NavigationReducer = (currentState, action) => {
  switch (action.type) {
    case 'RootContainerInitialAction':
      return {
        index: 0,
        key: 'root',
        children: [{ key: 'menu' }],
      };
    case 'push':
      return NavigationStateUtils.push(currentState, { key: action.key });
    case 'back':
    case 'pop':
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
        style={styles.main}
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

  renderTitleComponent() {
    return (
      <NavigationHeader.Title>
        Hello
      </NavigationHeader.Title>
    );
  }

  renderScene(props) {
    const navigateTo = (key) => {
      props.onNavigate({ type: 'push', key });
    };
    switch (props.scene.navigationState.key) {
      case 'menu':
        return <MenuPage navigateTo={navigateTo} />;
      case 'stock':
        return <StockPage navigateTo={navigateTo} />;
      case 'stocktakes':
        return <StocktakesPage navigateTo={navigateTo} />;
      case 'stocktakeEditor':
        return <StocktakeEditor navigateTo={navigateTo} />;
      case 'stocktakeManager':
        return <StocktakeManager navigateTo={navigateTo} />;
      case 'customerInvoices':
        return <CustomerInvoicesPage navigateTo={navigateTo} />;
      case 'supplierInvoices':
        return <SupplierInvoicesPage navigateTo={navigateTo} />;
      default:
        return <MenuPage navigateTo={navigateTo} />;
    }
  }

  render() {
    return (
      <NavigationRootContainer
        reducer={NavigationReducer}
        ref={navRootContainer => { this.navRootContainer = navRootContainer; }}
        renderNavigation={this.renderNavigation}
        style={styles.navBarOffset}
      />
    );
  }
}

const styles = StyleSheet.create({
  navBarOffset: {
    marginTop: 64,
  },
});
