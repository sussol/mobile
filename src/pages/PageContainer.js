/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { Keyboard } from 'react-native';

import { getCurrentRouteName } from '../navigation/selectors';

const mapStateToProps = ({ nav }) => ({ currentRouteName: getCurrentRouteName(nav) });

const extractPropsForPage = props => {
  const { currentRouteName, screenProps, navigation, ...restOfProps } = props;
  const { navigate, goBack, state } = navigation;
  const { params, routeName: thisPageRouteName, ...restOfNavigationState } = state;
  const isCurrentRoute = thisPageRouteName === currentRouteName;
  const navigateTo = (routeName, title, otherParams, type = 'push') => {
    Keyboard.dismiss(); // Dismiss keyboard before navigating to a different scene.
    const push = () => navigate(routeName, { title, ...otherParams });
    const navigationFunctions = {
      push,
      replace: () => {
        goBack();
        push();
      },
      goBack,
    };
    const navigationFunction = navigationFunctions[type] || push;
    navigationFunction();
  };
  return {
    topRoute: isCurrentRoute,
    ...screenProps,
    ...params,
    ...restOfNavigationState,
    navigateTo,
    ...restOfProps,
    navigation,
  };
};

function Page(props) {
  const { page: SpecificPage } = props;
  return <SpecificPage {...extractPropsForPage(props)} />;
}

export const PageContainer = connect(mapStateToProps)(Page);

export default PageContainer;

Page.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types, react/require-default-props
  page: PropTypes.any,
};
