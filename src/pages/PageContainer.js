/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentRouteName } from '../navigation';

function mapStateToProps({ navigation }) {
  return {
    currentRouteName: getCurrentRouteName(navigation),
  };
}

export const PageContainer = connect(
  mapStateToProps,
)(Page);

function Page(props) {
  const SpecificPage = props.page;
  return <SpecificPage {...extractPropsForPage(props)} />;
}

Page.propTypes = {
  page: PropTypes.any,
};

// TODO If the page we're going to has a key value pair in FINALISABLE_PAGES, get the finaliseItem
// details corresponding to that key. Set the new state and render the finalise Button
// if (FINALISABLE_PAGES[key]) {
//   const { recordToFinaliseKey, ...finaliseItem } = FINALISABLE_PAGES[key];
//   finaliseItem.record = extraProps[recordToFinaliseKey];
//   this.setState({ finaliseItem: finaliseItem });
//   navigationProps.renderRightComponent = this.renderFinaliseButton;
// }

function extractPropsForPage(props) {
  const { currentRouteName, screenProps, navigation, ...restOfProps } = props;
  const { navigate, goBack, state } = navigation;
  const { params, routeName: thisPageRouteName, ...restOfNavigationState } = state;
  const isCurrentRoute = thisPageRouteName === currentRouteName;
  const navigateTo = (routeName, title, otherParams, type = 'push') => {
    const push = () => navigate(routeName, { title, ...otherParams });
    // TODO dismissKeyboard
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
  };
}
