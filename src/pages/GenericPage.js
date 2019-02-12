/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericTablePage } from 'react-native-generic-table-page';

/**
 * A generic mSupply Mobile page. Adds database change notification functionality
 * to the react-native-generic-table-page.
 *
 * Extending classes should implement the following fields:
 *
 * @prop  {array}  dataTypesSynchronised  Data types visible in the table displayed
 *                                        on this page that should cause an update
 *                                        if changed by sync.
 *
 * @prop  {array}  dataTypesLinked        Data types visible in the table displayed
 *                                        on this page that should cause an update
 *                                        if changed somewhere other than sync.
 *
 * @prop  {string} dataTypeFinalisable    The data type that can be finalised on this
 *                                        page that should cause an update if changed
 *                                        by being finalised.
 */
export class GenericPage extends React.Component {
  componentWillMount() {
    const { database } = this.props;

    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = database.addListener(this.onDatabaseEvent);
  }

  /**
   * Refresh data every time the page becomes the top route, so that changes will show
   * when a user returns to the page using the back button.
   */
  componentWillReceiveProps(props) {
    const { topRoute, refreshData } = this.props;
    if (!topRoute && props.topRoute) refreshData();
  }

  componentWillUnmount() {
    const { database } = this.props;
    database.removeListener(this.databaseListenerId);
  }

  // Refetch data and render the list any time a listener is triggered for a data type
  // that a page subscribes to listen to or if record is finalised.
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    // TODO: use or remove |changeType|.

    const {
      database,
      dataTypesSynchronised,
      dataTypesLinked,
      dataTypeFinalisable,
      refreshData,
    } = this.props;

    const { isLoading } = database;

    // For sync we may want to listen to different data sources.
    const dataTypesArray = causedBy === 'sync' ? dataTypesSynchronised : dataTypesLinked;

    // An optimisation hack to ensure that |refreshData| is not triggered on every database
    // event for a given write (e.g. finalising a big invoice would refresh and re-render
    // a table for every line saved/updated/deleted, which would reduce app performance
    // during big database writes).
    const isLoadingTemp = isLoading; // TODO: refactor according to React best practices.

    // Do not update table for every listener event while database is loading (if |dataTypesLinked|
    // rather than |dataTypesSynchronised|). This will be bypassed if |recordType| is finalised.
    // This ensures the work involved in a big finalisation will be ignored, but will notify at the
    // end when updating the parent (i.e. the finalised stocktake/transaction/requisition is
    // updated).
    if (
      (!isLoadingTemp && dataTypesArray && dataTypesArray.includes(recordType)) ||
      (recordType === dataTypeFinalisable && record.isFinalised)
    ) {
      refreshData();
    }
  }

  render() {
    return <GenericTablePage {...this.props} />;
  }
}

export default GenericPage;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
GenericPage.propTypes = {
  database: PropTypes.object.isRequired,
  dataTypesSynchronised: PropTypes.array,
  dataTypesLinked: PropTypes.array,
  dataTypeFinalisable: PropTypes.string,
  refreshData: PropTypes.func.isRequired,
  topRoute: PropTypes.bool,
  isDataCircular: PropTypes.bool,
};

GenericPage.defaultProps = {
  isDataCircular: true,
};
