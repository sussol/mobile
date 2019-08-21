import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createReduxContainer } from 'react-navigation-redux-helpers';
import AppNavigator from './Navigator';

const ReduxNavigator = createReduxContainer(AppNavigator, 'root');

const ReduxNavigation = props => {
  const { nav, dispatch, screenProps } = props;

  return <ReduxNavigator state={nav} dispatch={dispatch} screenProps={screenProps} />;
};

const mapStateToProps = state => ({
  nav: state.nav,
});

/* eslint-disable react/forbid-prop-types */
ReduxNavigation.propTypes = {
  nav: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ReduxNavigation);
