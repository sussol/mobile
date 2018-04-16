/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { GenericTablePage } from 'react-native-generic-table-page';

/**
 * A generic mSupply Mobile page, adding database change notification functionality
 * to the standard react-native-generic-table-page.
 * Extending classes should own the following fields:
 * @prop  {array}  dataTypesSynchronised      Data types visible in the table displayed
 *         																		 on this page, that should therefore cause
 *         																		 an update if changed by sync
 * @prop  {array}  dataTypesLiked            Data types visible in the table displayed
 *         																		 on this page, that should therefore cause
 *         																		 an update if changed somewhere rather then sync
 * @prop  {string} finalisableDataType        The data type that can be finalised on this
 *         																		 page, that should therefore cause an update
 *         																		 if changed by being finalised
 */
export class GenericPage extends React.Component {
  componentWillMount() {
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
  }

  /**
   * Refresh data every time the page becomes the top route, so that changes will show
   * when a user returns to the page using the back button.
   */
  componentWillReceiveProps(props) {
    if (!this.props.topRoute && props.topRoute) this.props.refreshData();
  }

  componentWillUnmount() {
    this.props.database.removeListener(this.databaseListenerId);
  }

  // Refetch data and render the list any time a listener is triggered for a data type
  // that a page subscribes to listen to or if record is finalised
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    // Below is a little hack to make sure that refreshData isn't triggered on every
    // database event in a given write I.e. finalising a big invoice would refresh and
    // re-render a table for every line saved/updated/deleted, slowing the app down
    // for big database writes.
    const isInTransaction = (
      this.props.database.database.realm.isInTransaction &&
      causedBy !== 'sync'
    );

    // For sync we may want to listen to different data sources
    const dataTypesArray =
      causedBy === 'sync' ? this.props.dataTypesSynchronised : this.props.dataTypesLinked;

    // If database is in a transaction, don't update table for every listener event (if
    // dataTypesLinked rather than dataTypesSynchronised)
    // If recordType is finalisable and is finalised, it'll bypass this.
    // So it'll ignore all the business in a big finalisation but notify at the end
    // When updating the parent (i.e. the finalised stocktake/transaction/requisition is updated)
    if (
      (!isInTransaction && dataTypesArray && dataTypesArray.includes(recordType)) ||
      (recordType === this.props.finalisableDataType && record.isFinalised)
    ) {
      this.props.refreshData();
    }
  }

  render() {
    return <GenericTablePage {...this.props} />;
  }
}

GenericPage.propTypes = {
  database: PropTypes.object.isRequired,
  dataTypesSynchronised: PropTypes.array,
  dataTypesLinked: PropTypes.array,
  finalisableDataType: PropTypes.string,
  refreshData: PropTypes.func.isRequired,
  topRoute: PropTypes.bool,
  isDataCircular: PropTypes.bool,
};

GenericPage.defaultProps = {
  isDataCircular: true,
};
