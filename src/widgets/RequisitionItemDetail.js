/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { PageInfo } from './PageInfo';

import { getPageInfoColumns } from '../pages/dataTableUtilities';

import { WHITE, SUSSOL_ORANGE } from '../globalStyles';

const RequisitionItemDetailsComponent = ({ item }) => (
  <View style={{ paddingLeft: 50 }}>
    <PageInfo
      titleColor={SUSSOL_ORANGE}
      infoColor={WHITE}
      columns={getPageInfoColumns('requisitionItemDetail')(item)}
    />
  </View>
);

RequisitionItemDetailsComponent.propTypes = { item: PropTypes.object.isRequired };

export const RequisitionItemDetails = React.memo(RequisitionItemDetailsComponent);
