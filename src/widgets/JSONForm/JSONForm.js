/* eslint-disable react/forbid-prop-types */
/* eslint-disable max-len */
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import pointer from 'json-pointer';
import { withTheme } from '@rjsf/core';
import Ajv from 'ajv';
import { JSONFormContainer } from './JSONFormContainer';
import { JSONFormField } from './fields/index';
import { JSONFormTemplate } from './templates/index';
import { JSONFormWidget } from './widgets/index';
import { JSONFormErrorList } from './JSONFormErrorList';
import { PageButton } from '../PageButton';
import { JSONFormContext } from './JSONFormContext';

const ajvErrors = require('ajv-errors');

const ajv = new Ajv({
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  unknownFormats: 'ignore',
  jsonPointers: true,
});

ajvErrors(ajv);

const defaultTheme = {
  // Widgets are the lowest level input components. TextInput, Checkbox
  // etc, which are rendered depending on the JSON Schema or, if provided,
  // can be forced to be a specific widget with the uiSchema
  // The default, schema type to widget map, is here:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/b78d9ef280eddf5bda0f97e5a3445c6a1fd35c99/packages/core/src/utils.js#L13
  // You can specify an alternate widget to the the default for a type using the uiSchema.
  // i.e. if the type is "string", but you want to use the DateWidget, in the uiSchema you can specify [fieldName]: {"ui:widget": "date"}
  // https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/
  widgets: {
    TextWidget: JSONFormWidget.Text,
    URLWidget: () => null,
    EmailWidget: () => null,
    TextareaWidget: () => null,
    CheckboxWidget: JSONFormWidget.Checkbox,
    CheckboxesWidget: JSONFormWidget.Checkboxes,
    PasswordWidget: () => null,
    RadioWidget: () => null,
    SelectWidget: JSONFormWidget.Select,
    RangeWidget: () => null,
    DateWidget: JSONFormWidget.DatePicker,
  },

  // Fields are like containers for a row in the form.
  // Can override the DataTypeField components, which are like containers for each of
  // the 'rows' of the form, if needed. See:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/StringField.js
  //
  // Additionally overriding schemas with anyOf/oneOf fields etc is possible. The full list of overrideable fields:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/index.js
  // NOTE: It is possible to create any field component to contain a property by specifying the field in the uiSchema which allows a developer to not only override but also create.
  // https://github.com/rjsf-team/react-jsonschema-form/blob/b78d9ef280eddf5bda0f97e5a3445c6a1fd35c99/packages/core/src/components/fields/SchemaField.js#L29-L36
  fields: {
    TitleField: JSONFormField.Title,
    DescriptionField: JSONFormField.Description,

    AnyOfField: JSONFormField.AnyOf,
    OneOfField: JSONFormField.OneOf,

    // Examples of type override
    // StringField: JSONFormField.String,
    // BooleanField: JSONFormField.Boolean,
  },

  // Templates define the layout of each row and are passed components for users to
  // change the layout of each of the rows in the form.
  // See:
  // https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-templates/
  FieldTemplate: JSONFormTemplate.Field,
  ObjectFieldTemplate: JSONFormTemplate.ObjectField,
  ArrayFieldTemplate: JSONFormTemplate.ArrayField,

  // ErrorList is a component which is rendered at the top of the form when validation errors
  // occur
  ErrorList: JSONFormErrorList,

  formContext: JSONFormContext,

  // tagName is a container around the entire form. When the form is a controlled input, there is no access
  // to formData until submit, and the form tries to submit the form HTML style. The FormContainer provided
  // mocks some HTML functionality to make this RN Compatible.
  tagName: JSONFormContainer,
};

class FocusController {
  registered = [];

  useRegisteredRef = () => {
    const ref = useRef();
    this.useRegister(ref);
    return ref;
  };

  useRegister = ref => {
    useEffect(() => {
      this.register(ref);
      return () => {
        // Remove this ref from registered refs when unmounted.
        this.registered = this.registered.filter(registeredRef => registeredRef !== ref);
      };
    }, []);
  };

  register = ref => {
    this.registered.push(ref);
  };

  next = ref => {
    const currIdx = this.registered.findIndex(registeredRef => registeredRef === ref);

    const nextIdx = (currIdx + 1) % this.registered.length;
    const nextRef = this.registered[nextIdx];

    nextRef?.current?.focus?.();

    this.currentIdx = nextIdx;
  };
}

export const JSONForm = React.forwardRef(
  (
    { formData, onChange, theme = defaultTheme, children, options, onSubmit, surveySchema },
    ref
  ) => {
    const { uiSchema, jsonSchema } = surveySchema;
    const validator = useMemo(() => ajv.compile(jsonSchema), [jsonSchema]);
    const Form = useMemo(() => withTheme(theme), []);

    // Attach to the ref passed a method `submit` which will allow a caller
    // to programmatically call submit
    const formRef = useRef(null);
    useImperativeHandle(
      ref,
      () => ({
        submit: e => {
          formRef.current?.onSubmit(e);
        },
      }),
      []
    );

    return (
      <JSONFormContext.Provider value={options}>
        <Form
          liveValidate
          onChange={onChange}
          formData={formData}
          validate={(newFormData, errorHandlers) => {
            // Validate the form data, if there are any errors, an `errors` object is set on
            // on the validator object.
            validator(newFormData);
            // If there are any errors, us the errorHandlers object which is a mirrored schema
            // of the full JSON schema passed, where the value of each property is a function:
            // addError, which will add a custom error message against the field.
            validator.errors?.forEach(({ message, dataPath }) => {
              // Each of these errors have the shape defined here:
              // https://ajv.js.org/docs/api.html#validation-errors
              // the data path is a JSON pointer to where the validation error occurred in the
              // formData, since errorHandlers has the same shape as formData, use the
              // same pointer.
              const errorHandler = pointer.get(errorHandlers, dataPath);
              // NOTE: This addError function uses `this` internally - do not destructor.
              if (errorHandler?.addError) errorHandler.addError(message);
            });

            // The same ErrorHandlers object must be returned from this function, which should be
            // mutated by the error handler `addError` functions. The result of this validation
            // is then merged with the result of the internal validation of the component, rather
            // than overriding it.
            // https://github.com/rjsf-team/react-jsonschema-form/blob/64b167051d724df381b81dc2319e925266f99709/packages/core/src/validate.js#L254
            return errorHandlers;
          }}
          // eslint-disable-next-line arrow-body-style
          transformErrors={() => {
            // This function is used to transform errors generated from the Form components internal
            // validation, which occurs regardless of passing a custom validation function and merges
            // those errors with any errors generated from the custom validation. Overriding this
            // to return an empty array such that the merge results in only custom errors.
            // Since we use the same validation as the component, we still generate the same errors,
            // except when we override them with custom errors.
            // https://github.com/rjsf-team/react-jsonschema-form/blob/64b167051d724df381b81dc2319e925266f99709/packages/core/src/validate.js#L231-L233
            return [];
          }}
          onError={() => {
            // placeholder to prevent console.errors when validation fails.
          }}
          onSubmit={onSubmit}
          uiSchema={uiSchema ?? {}}
          schema={jsonSchema}
          ref={formRef}
        >
          {children ?? (
            <PageButton
              onPress={e => {
                formRef.current?.onSubmit(e);
              }}
            />
          )}
        </Form>
      </JSONFormContext.Provider>
    );
  }
);

JSONForm.defaultProps = {
  theme: defaultTheme,
  children: null,
  onSubmit: null,
  options: { focusController: new FocusController() },
  onChange: () => {},
  formData: {},
};

JSONForm.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func,
};

JSONForm.propTypes = {
  surveySchema: PropTypes.object.isRequired,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  options: PropTypes.object,
  theme: PropTypes.shape({
    widgets: PropTypes.shape({
      TextWidget: PropTypes.func,
      URLWidget: PropTypes.func,
      EmailWidget: PropTypes.func,
      TextareaWidget: PropTypes.func,
      CheckboxWidget: PropTypes.func,
      CheckboxesWidget: PropTypes.func,
      PasswordWidget: PropTypes.func,
      RadioWidget: PropTypes.func,
      SelectWidget: PropTypes.func,
      RangeWidget: PropTypes.func,
      DateWidget: PropTypes.func,
    }),
    fields: PropTypes.shape({
      TitleField: PropTypes.func,
      DescriptionField: PropTypes.func,
      AnyOfField: PropTypes.func,
      OneOfField: PropTypes.func,
    }),
    FieldTemplate: PropTypes.func,
    ObjectFieldTemplate: PropTypes.func,
    ArrayFieldTemplate: PropTypes.func,
    ErrorList: PropTypes.func,
    formContext: PropTypes.object,
    tagName: PropTypes.func,
  }),
};
