import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReportCell } from './ReportCell';
import PropTypes from 'prop-types';
export class ReportRow extends React.Component {
  render() {
    let rowStyle;
    let elements;
    let increment = 0;
    if (this.props.header) {
      rowStyle = {
        marginBottom: 1,
      };
      elements = this.props.rowData.map((cell, index) => {
        increment++;
        return (
          <ReportCell id={0} key={increment} index={index}>
            {cell}
          </ReportCell>
        );
      });
    } else {
      elements = this.props.rowData.data.map(cell => {
        increment++;
        return (
          <ReportCell id={this.props.rowData.id} key={increment}>
            {cell}
          </ReportCell>
        );
      });
    }
    return <View style={[localStyles.container, rowStyle]}>{elements}</View>;
  }
}

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 50,
  },
});

ReportRow.propTypes = {
  rowData: PropTypes.object.isRequired,
  header: PropTypes.bool.isRequired,
};
