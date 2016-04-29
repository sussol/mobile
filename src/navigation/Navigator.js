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

export default class Navigator extends Component {

  componentWillMount() {
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
        navigationProps={props}
        renderTitleComponent={this.renderTitleComponent}
      />
    );
  }

  renderScene(props) {
    return (
      <View style={[styles.navBarOffset, styles.main]}>
        {this.props.renderScene(props)}
      </View>
    );
  }

  renderTitleComponent(props) {
    return (
      <NavigationHeader.Title>
        {props.scene.navigationState.title && props.scene.navigationState.title}
      </NavigationHeader.Title>
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

Navigator.propTypes = {
  renderScene: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  navBarOffset: {
    marginTop: NavigationHeader.HEIGHT,
  },
});
