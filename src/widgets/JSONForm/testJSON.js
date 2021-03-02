export const lotsOfRandomStuffSchema = {
  title: 'Object',
  description: 'Description',
  type: 'object',
  properties: {
    age5: {
      type: 'integer',
      title: 'Age',
      description: 'Age description',
    },
    age4: {
      type: 'integer',
      title: 'Age',
    },
    multipleChoicesList: {
      type: 'array',
      title: 'A multiple choices list',
      items: {
        type: 'string',
        enum: ['foo', 'bar', 'fuzz', 'qux'],
      },
      uniqueItems: true,
    },
    stringEnum: {
      type: 'string',
      description: 'string enum',
      title: 'string enum title',
      enum: ['a', 'b', 'c'],
    },
    numberEnum: {
      type: 'number',
      description: 'number enum',
      title: 'Number enum',
      enum: [1, 2, 3],
    },
    Toggle: {
      title: 'Toggle',
      description: 'toggle description',
      type: 'boolean',
      oneOf: [
        {
          title: 'Enable',
          const: true,
        },
        {
          title: 'Disable',
          const: false,
        },
      ],
    },
    firstName: {
      type: 'string',
      title: 'First name',
      default: 'Chuck',
    },
    age: {
      type: 'integer',
      title: 'Age',
    },
    date: {
      type: 'string',
      format: 'date',
    },
    age2: {
      type: 'integer',
      title: 'Age',
    },
    date2: {
      type: 'string',
      format: 'date',
    },
    age3: {
      type: 'integer',
      title: 'Age3',
      errorMessage: {
        type: 'JOSH',
      },
    },
    date3: {
      type: 'string',
      format: 'date',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        anyOf: [
          {
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              bar: {
                title: 'bar title',
                description: 'bar desc',
                type: 'string',
              },
            },
          },
        ],
      },
    },
  },
};

export const lotsOfStringInputsSchema = {
  title: 'Object',
  description: 'Description',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'First name',
      description: 'the first name of the person.. duh!',
      maxLength: 5,
    },
    age: {
      type: 'integer',
      title: 'Age',
      description: 'Age description',
    },
    name2: {
      type: 'string',
      title: 'First name',
      description: 'the first name of the person.. duh!',
      maxLength: 5,
    },
    age2: {
      type: 'integer',
      title: 'Age',
      description: 'Age description',
    },
    name3: {
      type: 'string',
      title: 'First name',
      description: 'the first name of the person.. duh!',
      maxLength: 5,
    },
    age3: {
      type: 'integer',
      title: 'Age',
      description: 'Age description',
    },
    name4: {
      type: 'string',
      title: 'First name',
      description: 'the first name of the person.. duh!',
      maxLength: 5,
    },
    age4: {
      type: 'integer',
      title: 'Age',
      description: 'Age description',
    },
  },
};
