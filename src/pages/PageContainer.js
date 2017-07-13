/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

export function wrapInPageContainer(Page, props) {
  return <Page {...extractPropsForPage(props)} />;
}

// TODO If the page we're going to has a key value pair in FINALISABLE_PAGES, get the finaliseItem
// details corresponding to that key. Set the new state and render the finalise Button
// if (FINALISABLE_PAGES[key]) {
//   const { recordToFinaliseKey, ...finaliseItem } = FINALISABLE_PAGES[key];
//   finaliseItem.record = extraProps[recordToFinaliseKey];
//   this.setState({ finaliseItem: finaliseItem });
//   navigationProps.renderRightComponent = this.renderFinaliseButton;
// }

function extractPropsForPage(props) {
  const { screenProps, navigation, ...restOfProps } = props;
  const { navigate, goBack, state } = navigation;
  const { params, ...restOfNavigationState } = state;
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
  return { ...screenProps, ...params, ...restOfNavigationState, navigateTo, ...restOfProps };
}
