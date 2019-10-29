/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { getCurrentRouteName } from '../navigation/selectors';

const mapStateToProps = ({ nav }) => ({ currentRouteName: getCurrentRouteName(nav) });

const extractPropsForPage = props => {
  const { currentRouteName, screenProps, navigation, ...restOfProps } = props;
  const { state } = navigation;
  const { params, routeName: thisPageRouteName, ...restOfNavigationState } = state;

  return {
    ...screenProps,
    ...params,
    ...restOfNavigationState,
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
