/* @flow weak */

/**
 * OfflineMobile Android Index
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

const BACK_ACTION = 'BackAction';
const PUSH_ACTION = 'push';
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
    this.handleNavigation = this.handleNavigation.bind(this);
  }

  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', () =>
      this.handleNavigation({ type: BACK_ACTION })
    );
  }

  handleNavigation(action) {
    if (!action) {
      return false;
    }
    const newState = getNewNavState(this.state.navigationState, action);
    if (newState === this.state.navigationState) {
      return false;
    }
    this.setState({
      navigationState: newState,
    });
    return true;
  }

  renderNavigationBar(props) {
    return (
      <NavigationHeader
        {...props}
        navigationProps={props}
        renderTitleComponent={this.renderTitleComponent}
        style={this.props.navBarStyle}
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
    const topmostCard = navigationState.children[navigationState.children.length - 1];
    if (typeof topmostCard.renderRightComponent === 'function') {
      return topmostCard.renderRightComponent();
    }
    return this.props.renderRightComponent && this.props.renderRightComponent();
  }

  renderScene(props) {
    return (
      <View style={[localStyles.navBarOffset, localStyles.main, props.style]}>
        {this.props.renderScene(props)}
      </View>
    );
  }

  renderTitleComponent(props) {
    const title = String(props.scene.navigationState.title || '');
    return (
      <NavigationHeader.Title>
        {title}
      </NavigationHeader.Title>
    );
  }

  render() {
    return (
      <View style={ localStyles.main }>
        <NavigationCardStack
          direction={'horizontal'}
          navigationState={{ ...this.state.navigationState }} // Clone so CardStack detects change
          onNavigate={this.handleNavigation}
          renderScene={this.renderScene}
          renderOverlay={this.renderNavigationBar}
          cardStyle={{ backgroundColor: this.props.backgroundColor }}
        />
      <View style={localStyles.rightAndCentreOuterContainer}>
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
  switch (type) {
    case INITIAL_ACTION:
      return {
        index: 0,
        key: 'root',
        children: [{ key: 'root', ...extraProps }],
      };
    case PUSH_ACTION:
      return NavigationStateUtils.push(currentState, { key: key, ...extraProps });
    case BACK_ACTION:
      return currentState.index > 0 ?
        NavigationStateUtils.pop(currentState) :
        currentState;
    default:
      return currentState;
  }
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
  navBarOffset: {
    marginTop: NavigationHeader.HEIGHT,
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
