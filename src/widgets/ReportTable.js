import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import PropTypes from 'prop-types';
import { LIGHT_GREY } from '../globalStyles';
import { ReportRow } from './ReportRow';

export class ReportTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: props.headers,
      rows: null,
    };
  }

  componentDidMount() {
    const rows = this.props.rows.map((data, index) => {
      return {
        id: index,
        data: data,
      };
    });
    this.setState({ rows: rows });
  }

  renderItem = ({ item }) => {
    return <ReportRow rowData={item} />;
  };

  renderHeader = () => {
    return <ReportRow rowData={this.state.headers} header />;
  };

  render() {
    return (
      <View style={[localStyles.container]}>
        {this.renderHeader()}
        <FlatList
          data={this.state.rows}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
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
