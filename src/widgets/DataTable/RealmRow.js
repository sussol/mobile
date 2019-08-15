/* eslint-disable react/forbid-prop-types */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Row } from './index';

const RealmRow = React.memo(({ realmObject, ...props }) => {
  const [rowData, setRowData] = useState(realmObject);

  useEffect(() => {
    realmObject.addListener(() => {
      setRowData(realmObject);
    });
    return realmObject.removeAllListeners();
  }, []);

  return <Row rowData={rowData} {...props} />;
});

RealmRow.propTypes = {
  realmObject: PropTypes.object.isRequired,
};

export default RealmRow;
