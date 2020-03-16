/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { PencilIcon, ChevronDownIcon } from './icons';

import { SUSSOL_ORANGE } from '../globalStyles';
import { programStrings, modalStrings } from '../localization';

const getLocalisation = ({ stepKey }) => {
  const errorString = {
    program: programStrings.no_programs,
    supplier: programStrings.no_suppliers,
    orderType: programStrings.no_order_types,
    period: programStrings.no_periods,
  };
  const placeholders = {
    program: programStrings.select_a_program,
    supplier: programStrings.select_a_supplier,
    orderType: programStrings.select_an_order_type,
    period: programStrings.select_a_period,
    name: modalStrings.give_your_stocktake_a_name,
  };

  return { placeholder: placeholders[stepKey], errorString: errorString[stepKey] };
};

/**
 * Component rendering a sequential step in a process, according to it's
 * current status.
 *
 * COMPLETE   = The step is complete, render a tick and is pressable.
 * CURRENT    = The current step to complete, render an arrow and is pressable.
 * INCOMPLETE = A future step, no icon and no pressable.
 * ERROR      = A step not able to be completed, render an X and is not pressable.
 *
 * @prop  {Object} data          The data object the step represents. Used for displaying details
 * @prop  {String} field         The field in the data object to display
 * @prop  {String} type          The type of step, select (dropdown) or input (text field).
 * @prop  {String} stepKey       A string key for this step.
 * @prop  {String} status        The status of this step (as above)
 * @prop  {Func}   getModalData  Callback for fetching this steps modal data
 * @prop  {Func}   onPress       Callback for pressing this step (opens modal)
 * @state {Array} modalData      Data to pass to the modal on opening and for determining if the
 *                               current step is in an error state. Fetched when the status of this
 *                               step changes, and stored for performance as to not re-fetch every
 *                               re-render.
 */
export const Step = memo(props => {
  const [modalData, setModalData] = useState([]);
  const { data, field, type, stepKey, status, getModalData, onPress } = props;
  // Each stepKey used with this component has a placeholder/error string in getLocalisation.
  const { placeholder, errorString } = getLocalisation({ stepKey });
  // Calculate the errorState in this component after fetching modalData. If there is no
  // modalData and the status is CURRENT, the step is in an error state - display the
  // error string and a new icon.
  const internalStatus =
    !(modalData && modalData.length) && status === 'CURRENT' && getModalData ? 'ERROR' : status;
  const Container =
    internalStatus === 'ERROR' || internalStatus === 'INCOMPLETE' ? View : TouchableOpacity;
  // Fetch modalData when the status is current and store it in state.
  useEffect(() => {
    if (status !== 'CURRENT' || !getModalData) return;
    setModalData(getModalData());
  }, [status, internalStatus]);

  const onSelection = () => {
    onPress({ selection: modalData, key: stepKey });
  };

  /** Inner components */

  // Render a red X on error state, nothing on incomplete status, a green tick when
  // complete or a orange arrow on the current step.
  const StepIcon = () => {
    const { iconContainerStyle } = localStyles;
    const icons = {
      ERROR: <Ionicons name="ios-close" color="red" size={30} />,
      COMPLETE: <Ionicons name="md-checkmark" color="green" size={30} />,
      CURRENT: <Ionicons name="md-arrow-round-forward" color={SUSSOL_ORANGE} size={30} />,
      INCOMPLETE: null,
    };

    return <View style={iconContainerStyle}>{icons[internalStatus]}</View>;
  };

  // Render a pencil on text editing or a down arrow for list selections.
  const EditIcon = () => {
    if (internalStatus === 'ERROR') return null;

    return <View>{type === 'input' ? <PencilIcon /> : <ChevronDownIcon />}</View>;
  };

  // Render the error string if in an error state, the title if there is
  // data/the step is complete and a placeholder otherwise.
  const TextDisplay = () => {
    const { textContainerStyle, textStyle } = localStyles;
    // Display either data[field] if field was passed, or just data if it is a string.
    const text = (data && data[field]) || data;
    // If in an ERROR state, return the error string.
    const error = internalStatus === 'ERROR' && errorString;
    return (
      <View style={textContainerStyle}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={textStyle}>
          {error || text || placeholder}
        </Text>
      </View>
    );
  };

  /** Render */
  const { containerStyle } = localStyles;
  return (
    <Container onPress={onSelection}>
      <View style={containerStyle}>
        <StepIcon />
        <TextDisplay />
        <EditIcon />
      </View>
    </Container>
  );
});

export default Step;

Step.defaultProps = {
  field: '',
  type: 'select',
  getModalData: null,
  data: null,
};

Step.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onPress: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  stepKey: PropTypes.string.isRequired,
  field: PropTypes.string,
  getModalData: PropTypes.func,
  type: PropTypes.string,
};

const localStyles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10%',
  },
  textContainerStyle: { width: '30%', justifyContent: 'center' },
  iconContainerStyle: { width: '5%' },
  textStyle: { color: 'white' },
});
