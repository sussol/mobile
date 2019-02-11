import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  createReduxContainer,
} from 'react-navigation-redux-helpers';
import AppNavigator from './Navigator';

const ReduxNavigation = (props) => {
  const { nav, dispatch, screenProps } = props;
  const ReduxNavigator = createReduxContainer(AppNavigator, 'root');
  return (
    <ReduxNavigator
      state={nav}
      dispatch={dispatch}
      screenProps={screenProps}
    />
  );
};

ReduxNavigation.propTypes = {
  nav: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  nav: state.nav,
});

export default connect(mapStateToProps)(ReduxNavigation);
