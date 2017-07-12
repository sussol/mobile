/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

export function wrapInPageContainer(Page, props) {
  return <Page {...extractPropsForPage(props)} />;
}

function extractPropsForPage(props) {
  const { screenProps, navigation, ...restOfProps } = props;
  const { params, ...restOfNavigationState } = navigation.state;
  const navigateTo = (routeName, title, otherParams) =>
    navigation.navigate(routeName, { title, ...otherParams });
  return { ...screenProps, ...params, ...restOfNavigationState, navigateTo, ...restOfProps };
}
