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
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;


export class Navigator extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      navigationState: getNewNavState(undefined, { type: INITIAL_ACTION }),
    };
    this.renderNavigationBar = this.renderNavigationBar.bind(this);
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
    const windowWidth = Dimensions.get('window').width; // Used to centre the centreComponent
    const renderRightComponent = () => (
      <View style={[
        localStyles.horizontalContainer,
        { width: windowWidth * 0.75, justifyContent: 'flex-end' }]}
      >
        <View style={{
          position: 'absolute',
          width: windowWidth * 0.5,
          height: APPBAR_HEIGHT,
          right: windowWidth * 0.25,
          top: 0,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        >
          <View style={[localStyles.horizontalContainer]}>
            {this.props.renderCentreComponent && this.props.renderCentreComponent()}
          </View>
        </View>
        {this.props.renderRightComponent && this.props.renderRightComponent()}
      </View>
    );
    return (
      <NavigationHeader
        {...props}
        navigationProps={props}
        renderTitleComponent={this.renderTitleComponent}
        renderRightComponent={renderRightComponent}
        style={this.props.navBarStyle}
      />
    );
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
      <NavigationCardStack
        direction={'horizontal'}
        navigationState={{ ...this.state.navigationState }} // Clone so CardStack detects change
        onNavigate={this.handleNavigation}
        renderScene={this.renderScene}
        renderOverlay={this.renderNavigationBar}
        cardStyle={{ backgroundColor: this.props.backgroundColor }}
      />
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
  switch (action.type) {
    case INITIAL_ACTION:
      return {
        index: 0,
        key: 'root',
        children: [{ key: 'root' }],
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
}

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
});
