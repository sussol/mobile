/**
 * Check if the given parameter is a valid Report based
 * on its data structure and type and return a boolean.
 *
 * @param   {object}  parsedData  The data to check.
 * @param   {string}  type        Type of Report to check.
 */

import Ajv from 'ajv';

// Expected json structure for Table reports
/**
 *   {
 *      data: {
 *        header: [...],
 *        rows: [...],
 *        formatters: [...],
 *      },
 *   }
 */
const tableReportSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        header: {
          type: 'array',
          items: { type: 'string' },
        },
        rows: {
          type: 'array',
          items: { type: 'array' },
        },
        formatters: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['header', 'rows'],
    },
  },
  required: ['data'],
};

// Expected json structure for BarChart, LineChart or PieChart reports
/**
{
   "name": reportName,
   "data":[
      {
         "label": labelValue,
         "values":[
            {
               "x":"xValue",
               "y":"yValue"
            }
         ]
      }
   ]
}
*/

const defaultReportSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          values: {
            type: 'array',
            items: { $ref: '#/definitions/plotValues' },
          },
        },
        required: ['label', 'values'],
      },
    },
  },
  definitions: {
    plotValues: {
      type: 'object',
      properties: {
        x: { type: ['string', 'number'] },
        y: { type: ['string', 'number'] },
      },
      required: ['x', 'y'],
    },
  },
  required: ['name', 'data'],
};

const REPORTS_SCHEMAS = {
  Table: tableReportSchema,
  PieChart: defaultReportSchema,
  LineChart: defaultReportSchema,
  BarChart: defaultReportSchema,
};

export const validateReport = (parsedData, type) => {
  const ajv = new Ajv({ coerceTypes: true });
  return ajv.validate(REPORTS_SCHEMAS[type] || {}, parsedData);
};
