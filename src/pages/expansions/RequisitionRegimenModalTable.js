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
    this.state = {
      customData: [],
    };
  }

  componentDidMount() {
    const { requisition } = this.props;
    // const { customData } = this.state;
    // const { database } = this.props;
    // const { otherData } = customData;
    // const newData = {
    //   ...otherData,
    //   regimenData: [
    //     {
    //       name: 'Number of RDT this month',
    //       type: 'real',
    //       default: '0',
    //       comment: 'this is an additional and very helpful comment',
    //       code: '09k',
    //     },
    //     {
    //       code: 'AnotherOne',
    //       name: 'Regimen Data Name',
    //       type: 'string',
    //       default: 'units',
    //       isRequired: true,
    //     },
    //   ],
    // };
    // database.write(() => {
    //   requisition.saveCustomData(newData);
    //   database.save('Requisition', requisition);
    // });

    this.setState({
      customData: requisition.parsedCustomData,
    });
  }

  onEndEditing = (key, rowData, newValue) => {
    const { customData } = this.state;
    const { database, requisition } = this.props;
    const { regimenData, otherData } = customData;

    const newRegimenData = [...regimenData];
    const rowIndex = newRegimenData.findIndex(row => row.code === rowData.code);

    newRegimenData[rowIndex][key] = newValue;
    const newData = { ...otherData, regimenData: newRegimenData };

    database.write(() => {
      requisition.saveCustomData(newData);
      database.save('Requisition', requisition);
    });

    this.setState({ customData: newData });
  };

  refreshData = () => {
    const { customData } = this.state;
    this.setState({ ...customData });
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

  render() {
    const { database, genericTablePageStyles } = this.props;
    const { customData } = this.state;
    const { regimenData } = customData;

    return (
      <GenericPage
        data={regimenData}
        renderCell={this.renderCell}
        refreshData={this.refreshData}
        hideSearchBar={true}
        renderDataTableFooter={null} // Overrides default generic pages footer.
        dontRenderSearchBar={true}
        onEndEditing={this.onEndEditing}
        columns={[
          {
            key: 'name',
            width: 5,
            title: 'Question',
            alignText: 'left',
          },
          {
            key: 'value',
            width: 1,
            title: 'Value',
            alignText: 'center',
          },
          {
            key: 'comment',
            width: 5,
            title: 'Comment',
            alignText: 'left',
          },
        ]}
        dataTypesLinked={['Requisition']}
        database={database}
        pageStyles={expansionPageStyles}
        {...genericTablePageStyles}
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
