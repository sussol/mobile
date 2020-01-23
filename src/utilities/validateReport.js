/**
 * Check if the given parameter is a valid Report based
 * on its data structure and type and return a boolean.
 *
 * @param   {object}  parsedData  The data to check.
 * @param   {string}  type        Type of Report to check.
 */

import Ajv from 'ajv';

// Expected json structure for Table reports
const tableReportSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        header: {
          type: 'array',
        },
        rows: {
          type: 'array',
          items: { type: 'array' },
        },
        formatters: {
          type: 'array',
        },
      },
      required: ['header', 'rows', 'formatters'],
    },
  },
  required: ['data'],
};

// Expected json structure for BarChart, LineChart or PieChart reports
const otherReportSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    data: {
      type: 'array',
      items: {
        label: { type: 'string' },
        values: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              x: { type: ['string', 'number'] },
              y: { type: ['string', 'number'] },
            },
            required: ['x', 'y'],
          },
        },
        required: ['label', 'values'],
      },
    },
  },
  required: ['name', 'data'],
};

export const validateReport = (parsedData, type) => {
  const ajv = new Ajv({ coerceTypes: true });
  switch (type) {
    case 'Table': {
      return ajv.validate(tableReportSchema, parsedData);
    }
    case 'BarChart': {
      return ajv.validate(otherReportSchema, parsedData);
    }
    case 'LineChart': {
      return ajv.validate(otherReportSchema, parsedData);
    }
    case 'PieChart': {
      return ajv.validate(otherReportSchema, parsedData);
    }
    default:
      return null;
  }
};
