/* eslint-disable react/forbid-prop-types */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Row } from './index';

class RealmRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount = () => {
    const { realmObject } = this.props;
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    realmObject.isValid();
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

    realmObject.batches.forEach(batch => {
      batch.addListener(() => {
        console.log('=================================');
        console.log('LISTNERE');
        console.log(realmObject.totalQuantity);
        console.log('=================================');
        // this.setState({ realmObject });
      });
    });
  };

  componentWillUnmount = () => {};

  render() {
    return <Row rowData={this.props.realmObject} l={{}} {...this.props} />;
  }
}

// const RealmRow = React.memo(({ realmObject, ...props }) => {
//   const [rowData, setRowData] = useState(realmObject);

//   useEffect(() => {
//     return realmObject.removeAllListeners();
//   }, []);

//   return <Row rowData={realmObject} {...props} />;
// });

RealmRow.propTypes = {
  realmObject: PropTypes.object.isRequired,
};

export default RealmRow;
