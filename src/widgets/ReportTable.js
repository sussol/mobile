import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import PropTypes from 'prop-types';
import { LIGHT_GREY } from '../globalStyles';
import { ReportRow } from './ReportRow';

export class ReportTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      rows: this.props.rows,
    };
  }

  renderItem = ({ item, index }) => {
    return <ReportRow rowData={item} index={index} />;
  };

  renderHeader = () => {
    return <ReportRow rowData={this.state.headers} header index={0} />;
  };

  render() {
    return (
      <View style={[localStyles.container]}>
        {this.renderHeader()}
        <FlatList data={this.state.rows} renderItem={this.renderItem} keyExtractor={item => item} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_GREY,
  },
});

ReportTable.propTypes = {
  headers: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};
