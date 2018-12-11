import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { LIGHT_GREY } from '../globalStyles';
import { ReportRow } from './ReportRow';

export class ReportTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ID: props.ID,
      storeID: props.storeID,
      reportID: props.reportID,
      title: props.title,
      label: props.label,
      type: props.type,
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
    return <ReportRow rowData={item} header={false} />;
  };

  renderHeader = () => {
    return <ReportRow rowData={this.state.headers} header={true} />;
  };

  extractKey = item => {
    return item.id;
  };

  render() {
    if (!(this.state.rows && this.state.headers)) return null;
    return (
      <FlatList
        data={this.state.rows}
        renderItem={this.renderItem}
        extraData={this.state}
        keyExtractor={this.extractKey}
        ListHeaderComponent={this.renderHeader}
        style={localStyles.container}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_GREY,

    width: '100%',
  },
});

ReportTable.propTypes = {
  ID: PropTypes.string.isRequired,
  storeID: PropTypes.string.isRequired,
  reportID: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  headers: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};
