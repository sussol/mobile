/* eslint-disable react/no-unused-state */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from '../GenericPage';
import { expansionPageStyles } from '../../globalStyles';

/**
 * Renders page to be displayed in StocktakeEditPage -> expansion.
 *
 * @prop  {Realm}         database       App wide database.
 * @prop  {Realm.object}  stocktakeItem  The stocktakeItem, a parent of
 *                                       StocktakeBatches in this expansion
 */
export class RequisitionRegimenModalTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { forceUpdate: [] };
  }

  onEndEditing = (key, rowData, newValue) => {
    const { database, requisition } = this.props;
    const { parsedCustomData } = requisition;
    const { regimenData } = parsedCustomData;

    const rowIndex = regimenData.findIndex(row => row.code === rowData.code);
    regimenData[rowIndex][key] = newValue;

    database.write(() => {
      requisition.saveCustomData(parsedCustomData);
      database.save('Requisition', requisition);
    });

    this.setState({ forceUpdate: [...regimenData] });
  };

  renderCell = (key, regimenRow) => {
    const { requisition } = this.props;
    const isEditable = !requisition.isFinalised;

    switch (key) {
      default:
        return {
          cellContents: regimenRow[key],
        };
      case 'value': {
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: regimenRow.value || '',
          keyboardType: regimenRow.type === 'string' ? 'default' : null,
        };
      }
      case 'comment': {
        return {
          type: isEditable ? 'editable' : 'text',
          cellContents: regimenRow.comment || '',
          keyboardType: 'default',
        };
      }
    }
  };

  getData = () => {
    const { requisition } = this.props;
    const { parsedCustomData } = requisition;
    const { regimenData } = parsedCustomData;
    return regimenData;
  };

  render() {
    const { database, genericTablePageStyles } = this.props;

    return (
      <GenericPage
        data={this.getData()}
        renderCell={this.renderCell}
        hideSearchBar={true}
        dontRenderSearchBar={true}
        renderDataTableFooter={null} // Overrides default generic pages footer.
        onEndEditing={this.onEndEditing}
        database={database}
        pageStyles={expansionPageStyles}
        {...genericTablePageStyles}
        columns={[
          {
            key: 'name',
            width: 4,
            title: 'Question',
            alignText: 'left',
          },
          {
            key: 'value',
            width: 1,
            title: 'Value',
            alignText: 'right',
          },
          {
            key: 'comment',
            width: 5,
            title: 'Comment',
            alignText: 'right',
          },
        ]}
      />
    );
  }
}

export default RequisitionRegimenModalTable;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
RequisitionRegimenModalTable.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  requisition: PropTypes.object.isRequired,
};
