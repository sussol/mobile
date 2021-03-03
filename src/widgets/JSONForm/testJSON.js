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

export const booleanSchema = {
  title: 'Boolean',
  properties: {
    boolean: { type: 'boolean', title: 'Test boolean', default: true },
    enum1: {
      type: 'boolean',
      title: 'Test Enum - enumNames is not in JSON spec but works.. but doesnt validate',
      enum: [1, 'some other value'],
      enumNames: ['AAA', 'BBB'],
    },
    enum2: {
      type: 'boolean',
      title: 'Testing with enumNames - still not part of the JSON spec, but does validate',
      enum: [true, false],
      enumNames: ['Josh', 'Mark'],
      default: false,
    },
  },
};

export const selectSchema = {
  title: 'Select',
  type: 'object',
  properties: {
    josh: {
      type: 'string',
      title: 'String enum',
      enum: Array.from({ length: 30 }).map((_, i) => String(i)),
      default: '1',
    },
    test2: {
      type: 'number',
      title: 'Number enum',
      enum: [1, 2, 3],
    },
  },
  required: ['test2'],
};

export const selectUiSchema = {
  test2: {
    'ui:placeholder': 'Select an option',
  },
};

export const dateSchema = {
  title: 'Select',
  type: 'object',
  properties: {
    josh: {
      type: 'string',
      title: 'date enum',
      format: 'date',
      default: 'Default',
    },
    josh2: {
      type: 'string',
      title: 'some string',
      default: 'Default',
    },
  },
};

export const dateUiSchema = {
  josh: {
    'ui:placeholder': 'placeholder',
  },
};

export const testTongaUiSchema = {
  respondentContactData: {
    relationshipToPatient: {
      'ui:placeholder': 'Select a relationship',
    },
  },
  patientClinicalData: {
    comorbiditiesImmunocompromised: {
      'ui:placeholder': 'Please select, if applicable.',
    },
  },
};

export const testTongaSurvey = {
  type: 'object',
  title: 'Extra information',
  properties: {
    respondentContactData: {
      title: 'Respondent Contact Data',
      description: 'Contact data of the respondent if the respondent is not the patient.',
      type: 'object',
      properties: {
        firstName: {
          title: 'First Name',
          description: 'The first name of the respondent',
          type: 'string',
          maxLength: 50,
        },
        lastName: {
          title: 'Last Name',
          description: 'The last name of the respondent',
          type: 'string',
          maxLength: 50,
        },
        relationshipToPatient: {
          title: 'Relationship to patient',
          description: 'The relationship between the respondent and patient',
          type: 'string',
          enum: [
            'Mother',
            'Father',
            'Sister',
            'Brother',
            'Aunty',
            'Uncle',
            'Grandmother',
            'Grandfather',
            'Friend/Neighbour',
            'Other',
          ],
        },
      },
    },
    patientClinicalData: {
      title: 'Patient Clinical Data',
      description: 'The patients clinical data',
      type: 'object',
      properties: {
        comorbiditiesImmunocompromised: {
          title: 'Comorbidities / Immunocompromised',
          description: 'The patients comorbidities',
          type: 'string',
          enum: [
            'Diabetes',
            'Hypertension',
            'Asthma',
            'Cancer (all types)',
            'Cerebral Vascular Accident',
            'Chronic Kidney Disease',
            'Chronic Obstructive Airway Disease',
            'Immunocompromised',
            'Rheumatic Heart Disease',
            'Ischemic Heart Disease',
            'Other',
          ],
        },
        previousSeriousAllergicReactions: {
          title: 'Previous serious allergic reactions',
          description: 'Has the patient had any serious allergic reactions in the past?',
          type: 'boolean',
          default: false,
        },
        previousAdverseEventsFollowingImmunisation: {
          title: 'Previous adverse events following immunisation',
          description:
            'Has the patient had any adverse effects following an immunisation in the past?',
          type: 'boolean',
          default: false,
        },
        currentlyPregnant: {
          title: 'Currently Pregnant',
          description: 'Is the patient currently pregnant?',
          type: 'boolean',
          default: false,
        },
        currentlyLactating: {
          title: 'currentlyLactating',
          description: 'Is the patient currently lactating?',
          type: 'boolean',
          default: false,
        },
      },
    },
    'Covid 19 Status': {
      type: 'object',
      properties: {
        everTestedPositiveForCOVID19: {
          type: 'boolean',
          default: false,
          description: "Has the patient ever tested positive for COVID-19'",
          title: 'Ever tested positive for COVID-19',
        },
        'Date of diagnosis': {
          title: 'Date of diagnosis',
          format: 'date',
          type: 'string',
        },
      },
    },
    'Covid 19 Vaccination Data': {
      type: 'object',
      properties: {
        'Covid-19 Vaccine Type': {
          type: 'string',
          enum: ['Astra-zeneca', 'Pfizer', 'Moderna', 'Johnson & Johnson'],
          title: 'COVID-19 Vaccine type',
          description: 'The type of COVID-19 vaccine the patient is receiving',
          default: 'Astra-zeneca',
        },
        'Date COVID-19 vaccine dose 1': {
          type: 'string',
          format: 'date',
          title: 'Date COVID-19 vaccine dose 1',
          description: 'The date of the patients first Covid-19 vaccine',
        },
        'Date COVID-19 vaccine dose 2': {
          type: 'string',
          format: 'date',
          title: 'Date COVID-19 vaccine dose 2',
          description: 'The date of the patients second Covid-19 vaccine',
        },
        'Any AEFI experienced': {
          type: 'boolean',
          default: false,
          title: 'Any AEFI experienced',
          description: 'Has the patient experienced any AEFI',
        },
        'Reporting form for AEFI if AEFI experienced': {
          type: 'string',
          title: 'Reporting form for AEFI if AEFI experienced',
          description: 'I dunno what this is',
        },
      },
    },
  },
};
