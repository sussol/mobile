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
    const dataTypesArray = causedBy === 'sync' ? this.props.dataTypesSynchronised
                                               : this.props.dataTypesLinked;
    if ((dataTypesArray && dataTypesArray.indexOf(recordType) >= 0) ||
        (recordType === this.props.finalisableDataType && record.isFinalised)) {
      this.props.refreshData();
    }
  }

  render() {
    return (
      <GenericTablePage
        {...this.props}
      />
    );
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
