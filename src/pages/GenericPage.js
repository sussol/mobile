/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { GenericTablePage } from 'react-native-generic-table-page';

/**
* A generic mSupply Mobile page, adding database change notification functionality
* to the standard react-native-generic-table-page.
* Extending classes should own the following fields:
* @field  {array}  dataTypesSynchronised      Data types visible in the table displayed
*         																		 on this page, that should therefore cause
*         																		 an update if changed by sync
* @field  {string} finalisableDataType        The data type that can be finalised on this
*         																		 page, that should therefore cause an update
*         																		 if changed by being finalised
*/
export class GenericPage extends GenericTablePage {

  /**
   * If overridden, first two lines of this method should be duplicated. May need to be overridden
   * to populate selection in state if CheckableCells are used and need to remember their selected
   * state.
   */
  componentWillMount() {
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
    this.refreshData();
  }

  componentWillUnmount() {
    this.props.database.removeListener(this.databaseListenerId);
  }

  // Refetch data and render the list any time sync changes data displayed, or the
  // record is finalised
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    // Ensure sync updates are immediately visible
    if (causedBy === 'sync' &&
        this.dataTypesSynchronised.indexOf(recordType) >= 0) this.refreshData();
    // Ensure finalising updates data for the primary data type
    else if (recordType === this.finalisableDataType && record.isFinalised) {
      this.refreshData();
      if (this.dataTableRef) this.dataTableRef.scrollTo({ y: 0 });
    }
  }

}
