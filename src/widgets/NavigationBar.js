/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { textStyles } from '../globalStyles';
import { BadgeSet } from './BadgeSet';
import { generalStrings } from '../localization';

export class NavigationBar extends React.Component {
  state = {
    badge: [{ title: '', type: 'unfinalised', Count: 0 }],
  };

  routeList = {
    customerRequisitions: 'ResponseRequisition',
    supplierRequisitions: 'RequestRequisition',
    supplierInvoices: 'SupplierInvoice',
    stocktakes: 'Stocktake',
    customerInvoices: 'CustomerInvoice',
  };

  componentWillReceiveProps(props) {
    if (props.routeName in this.routeList) {
      const dataType = this.getDataTypeFromRouteName(props);
      this.refreshData(dataType);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getDataTypeFromRouteName(props) {
    return props.routeName in this.routeList ? this.routeList[props.routeName] : '';
  }

  refreshData = dataType => {
    const { database, routeName } = this.props;

    this.setState({
      badge: [
        {
          count:
            dataType !== ''
              ? database.objects(dataType).filtered('status != "finalised"').length
              : 0,
          type: 'unfinalised',
          title: `${generalStrings.unfinalised} ${generalStrings[routeName]}`,
        },
      ],
    });
  };

  render() {
    const { onPressBack, LeftComponent, CentreComponent, RightComponent } = this.props;
    const { badge } = this.state;
    return (
      <View style={localStyles.container}>
        <View style={localStyles.leftSection}>
          <TouchableOpacity onPress={onPressBack} style={localStyles.backButton}>
            {onPressBack && <Icon name="chevron-left" style={localStyles.backIcon} />}
          </TouchableOpacity>
          {LeftComponent && (
            <BadgeSet
              info={badge}
              popoverPosition="bottom"
              mainWrapperStyle={localStyles.badgeSetWrapper}
            >
              <LeftComponent />
            </BadgeSet>
          )}
        </View>
        <View style={localStyles.centreSection}>{CentreComponent && <CentreComponent />}</View>
        <View style={localStyles.rightSection}>{RightComponent && <RightComponent />}</View>
      </View>
    );
  }
}

export default NavigationBar;

/* eslint-disable react/forbid-prop-types */
NavigationBar.propTypes = {
  database: PropTypes.object.isRequired,
  onPressBack: PropTypes.func,
  LeftComponent: PropTypes.any,
  CentreComponent: PropTypes.any,
  RightComponent: PropTypes.any,
  routeName: PropTypes.string,
};

NavigationBar.defaultProps = {
  onPressBack: null,
  LeftComponent: null,
  CentreComponent: null,
  RightComponent: null,
  routeName: null,
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const sectionStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 20,
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: STATUSBAR_HEIGHT,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    height: HEADER_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  backIcon: {
    marginRight: 30,
    ...textStyles,
  },
  leftSection: {
    ...sectionStyle,
  },
  centreSection: {
    ...sectionStyle,
    justifyContent: 'center',
  },
  rightSection: {
    ...sectionStyle,
    justifyContent: 'flex-end',
  },
  badgeSetWrapper: {
    right: -60,
  },
});
