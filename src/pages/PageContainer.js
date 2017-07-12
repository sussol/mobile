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
  const navigateTo = (routeName, title) => navigation.navigate(routeName, { title });
  return { ...screenProps, ...navigation.state, navigateTo, ...restOfProps };
}
