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

export class NavigationBar extends React.Component {
  state = {
    unfinalisedCount: 0,
  };

  componentWillReceiveProps(props) {
    const dataType = this.getDataTypeFromRouteName(props);
    if (dataType) this.refreshData(dataType);
  }

  getDataTypeFromRouteName(props) {
    switch (props.routeName) {
      case 'customerRequisitions':
        return 'ResponseRequisition';
      case 'supplierRequisitions':
        return 'RequestRequisition';
      case 'supplierInvoices':
        return 'SupplierInvoice';
      case 'stocktakes':
        return 'Stocktake';
      case 'customerInvoices':
        return 'CustomerInvoice';
      default:
        return '';
    }
  }

  refreshData = (dataType) => {
    this.setState({
      unfinalisedCount: this.props.database
        .objects(dataType).filtered('status != "finalised"').length,
    });
  }

  render() {
    const { onPressBack, LeftComponent, CentreComponent, RightComponent } = this.props;
    return (
      <View style={localStyles.container} >
        <View style={localStyles.leftSection}>
          <TouchableOpacity onPress={onPressBack} style={localStyles.backButton}>
            {onPressBack && <Icon name={'chevron-left'} style={localStyles.backIcon} />}
          </TouchableOpacity>
          {LeftComponent && <BadgeSet
            MainElement={<LeftComponent />}
            unfinalisedCount={this.state.unfinalisedCount}
            popoverPosition={'bottom'}
            mainWrapperStyle={localStyles.badgeSetWrapper}
          />}
        </View>
        <View style={localStyles.centreSection} >
          {CentreComponent && <CentreComponent />}
        </View>
        <View style={localStyles.rightSection}>
          {RightComponent && <RightComponent />}
        </View>
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
  currentTitle: PropTypes.string,
};

NavigationBar.defaultProps = {
  onPressBack: null,
  LeftComponent: null,
  CentreComponent: null,
  RightComponent: null,
  currentTitle: null,
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
