/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  BackAndroid,
  Dimensions,
  Platform,
  NavigationExperimental,
  StyleSheet,
  View,
} from 'react-native';

const {
  CardStack: NavigationCardStack,
  Header: NavigationHeader,
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

const BACK_ACTION = 'backAction';
const PUSH_ACTION = 'push';
const REPLACE_ACTION = 'replace';
const REPLACE_PREVIOUS_AND_POP_ACTION = 'replacePreviousAndPop';
const INITIAL_ACTION = 'initial';

export class Navigator extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      navigationState: getNewNavState(undefined, { type: INITIAL_ACTION }),
    };
    this.renderNavigationBar = this.renderNavigationBar.bind(this);
    this.renderRightAndCentre = this.renderRightAndCentre.bind(this);
    this.renderRightComponent = this.renderRightComponent.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderTitleComponent = this.renderTitleComponent.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () =>
      this.onNavigate({ type: BACK_ACTION })
    );
  }

  onNavigate(action) {
    // If no action passed, stay in place.
    if (!action) return false;
    const oldState = this.state.navigationState;
    delete oldState.routes[oldState.index].topRoute; // Old top route no longer top
    const newState = getNewNavState(oldState, action);
    if (newState === this.state.navigationState) {
      return false;
    }
    // In order to get NavigationExperimental to re-render the new top route (so that
    // it will, e.g., re-fetch data in case it has changed), we need to deep copy the
    // old route and add a property so that the new route cannot be considered equal
    newState.routes[newState.index] = { ...newState.routes[newState.index] }; // Change reference
    newState.routes[newState.index].topRoute = true; // Change makeup of keys
    this.setState({ navigationState: newState });
    return true;
  }

  renderNavigationBar(props) {
    return (
      <NavigationHeader
        {...props}
        navigationProps={props}
        renderTitleComponent={this.renderTitleComponent}
        style={this.props.navBarStyle}
        onNavigateBack={() => this.onNavigate({ type: BACK_ACTION })}
        viewProps={this.props.headerViewProps}
      />
    );
  }

  /**
   * Renders the centre and right components of the navigation bar.
   * @return {object} Component that contains both the right and centre components
   */
  renderRightAndCentre() {
    return (
      <View style={[localStyles.horizontalContainer, localStyles.rightAndCentreInnerContainer]}>
        <View style={localStyles.centreComponentContainer}>
          <View style={[localStyles.horizontalContainer]}>
            {this.props.renderCentreComponent && this.props.renderCentreComponent()}
          </View>
        </View>
        <View style={localStyles.rightComponentContainer}>
          <View style={[localStyles.horizontalContainer]}>
            {this.renderRightComponent()}
          </View>
        </View>
      </View>
    );
  }

  /**
   * Return the right component provided by the renderRightComponent functin in
   * the navigation state, if there is one. Failing that, if a renderRightComponent
   * function was passed in through props, return the result.
   * @return {[type]} [description]
   */
  renderRightComponent() {
    // If the navigation state includes a function to render the right component,
    // it will override any passed through by props
    const navigationState = this.state.navigationState;
    const topmostCard = navigationState.routes[navigationState.routes.length - 1];
    if (typeof topmostCard.renderRightComponent === 'function') {
      return topmostCard.renderRightComponent();
    }
    return this.props.renderRightComponent && this.props.renderRightComponent();
  }

  renderScene(props) {
    return (
      <View style={[localStyles.main, props.style]}>
        {this.props.renderScene({ onNavigate: this.onNavigate, ...props })}
      </View>
    );
  }

  renderTitleComponent(props) {
    const title = String(props.scene.route.title || '');
    return (
      <NavigationHeader.Title>
        {title}
      </NavigationHeader.Title>
    );
  }

  render() {
    return (
      <View style={localStyles.main}>
        <NavigationCardStack
          direction={'horizontal'}
          navigationState={this.state.navigationState}
          renderScene={this.renderScene}
          renderHeader={this.renderNavigationBar}
          cardStyle={{ backgroundColor: this.props.backgroundColor }}
        />
        <View style={localStyles.rightAndCentreOuterContainer} {...this.props.headerViewProps}>
          {this.renderRightAndCentre()}
        </View>
      </View>
    );
  }
}

Navigator.propTypes = {
  renderScene: React.PropTypes.func.isRequired,
  renderRightComponent: React.PropTypes.func,
  renderCentreComponent: React.PropTypes.func,
  navBarStyle: View.propTypes.style,
  backgroundColor: React.PropTypes.string,
  headerViewProps: React.PropTypes.object,
};

/**
 * Given the current navigation state, and an action to perform, will return the
 * new navigation state. Essentially a navigation reducer.
 * @param  {object} currentState The current navigation state
 * @param  {object} action       A navigation action to perform, with a type and
 *                               optionally a key and title
 * @return {object}              The new navigation state
 */
function getNewNavState(currentState, action) {
  const { type, key, ...extraProps } = action;
  let newNavState;
  switch (type) {
    case INITIAL_ACTION:
      newNavState = {
        index: 0,
        key: 'root',
        routes: [{ key: 'root', ...extraProps }],
      };
      break;
    case PUSH_ACTION:
      // Don't push route if route already in navState (two pushes can happen if user quickly
      // double taps a navigation button)
      if (NavigationStateUtils.has(currentState, action.key)) {
        return currentState;
      }
      newNavState = NavigationStateUtils.push(currentState, { key: key, ...extraProps });
      break;
    case BACK_ACTION:
      newNavState = currentState.index > 0 ?
        NavigationStateUtils.pop(currentState) :
        currentState;
      break;
    // Replace current route with new route
    case REPLACE_ACTION:
      newNavState = NavigationStateUtils.replaceAtIndex(
        { ...currentState },
        currentState.index,
        { key: key, ...extraProps }
      );
      break;
    // Replace previous route and pop to it. Will error if at root
    case REPLACE_PREVIOUS_AND_POP_ACTION: {
      const newState = NavigationStateUtils.replaceAtIndex(
        currentState,
        currentState.index - 1,
        { key: key, ...extraProps }
      );
      newNavState = NavigationStateUtils.pop(newState);
      break;
    }
    default:
      newNavState = currentState;
  }

  return newNavState;
}

const WINDOW_WIDTH = Dimensions.get('window').width; // Used to centre the centreComponent
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56; // Taken from NavigationExperimental
const HORIZONTAL_MARGIN = Platform.OS === 'ios' ? 10 : 20;
const localStyles = StyleSheet.create({
  main: {
    flex: 1,
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAndCentreOuterContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  rightAndCentreInnerContainer: {
    width: WINDOW_WIDTH * 0.75,
    justifyContent: 'flex-end',
  },
  centreComponentContainer: {
    position: 'absolute',
    width: WINDOW_WIDTH * 0.5,
    height: APPBAR_HEIGHT,
    right: WINDOW_WIDTH * 0.25,
    top: 0,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rightComponentContainer: {
    flexDirection: 'column',
    height: APPBAR_HEIGHT,
    justifyContent: 'center',
    marginRight: HORIZONTAL_MARGIN,
  },
});
