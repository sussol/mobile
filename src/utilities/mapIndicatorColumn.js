/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Map indicator attribute to data table column.
 *
 * @param {IndicatorAttribute} indicatorAttribute
 */
const mapIndicatorColumn = ({ valueType: type, description: key, description: title }) => ({
  type,
  key,
  title,
  width: 10,
  sortable: false,
  editable: false,
});

export { mapIndicatorColumn };
