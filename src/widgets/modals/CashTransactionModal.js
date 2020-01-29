/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_KEYS,
  CASH_TRANSACTION_TYPES,
} from '../../utilities/modules/dispensary/constants';

import { BottomModalContainer, BottomTextEditor } from '../bottomModals';
import { GenericChoiceList } from '../modalChildren';
import { PageButton } from '../PageButton';
import { PencilIcon, ChevronDownIcon } from '../icons';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { ToggleBar } from '../ToggleBar';

const placeholderName = 'Choose a name';
const placeholderAmount = 'Enter transaction amount';
const placeholderReason = 'Choose a reason';
const placeholderReasonDisabled = 'N/A';
const placeholderDescription = 'Enter a description';

export const CashTransactionModal = ({ onConfirm }) => {
  const [name, setName] = useState(null);
  const [amount, setAmount] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState(null);

  const [isCashIn, setIsCashIn] = useState(true);
  const [textBuffer, setTextBuffer] = useState('');

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const names = useMemo(() => UIDatabase.objects('Name'));
  const reasons = useMemo(() => UIDatabase.objects('Options'));
  const type = useMemo(
    () => (isCashIn ? CASH_TRANSACTION_TYPES.CASH_IN : CASH_TRANSACTION_TYPES.CASH_OUT),
    [isCashIn]
  );

  const isValidTransaction = useMemo(() => !!name && !!amount && (isCashIn || !!reason), [
    name,
    amount,
    reason,
    isCashIn,
  ]);

  const onCreate = useCallback(() => onConfirm({ name, amount, type, reason, description }), [
    name,
    type,
    amount,
    reason,
    description,
  ]);

  const onChangeText = text => setTextBuffer(text);

  const resetBottomModal = () => {
    setIsNameModalOpen(false);
    setIsAmountModalOpen(false);
    setIsReasonModalOpen(false);
    setIsDescriptionModalOpen(false);
  };

  const onPressName = () => {
    resetBottomModal();
    setIsNameModalOpen(true);
  };

  const onPressAmount = () => {
    resetBottomModal();
    setIsAmountModalOpen(true);
    setTextBuffer(amount);
  };

  const onPressReason = () => {
    resetBottomModal();
    setIsReasonModalOpen(true);
  };

  const onPressDescription = () => {
    resetBottomModal();
    setIsDescriptionModalOpen(true);
    setTextBuffer(description);
  };

  const onSubmitName = ({ item }) => {
    setName(item);
    setIsNameModalOpen(false);
  };

  const onSubmitAmount = () => {
    setAmount(parseFloat(textBuffer));
    setIsAmountModalOpen(false);
  };

  const onSubmitReason = ({ item }) => {
    setReason(item);
    setIsReasonModalOpen(false);
  };

  const onSubmitDescription = () => {
    setDescription(textBuffer);
    setIsDescriptionModalOpen(false);
  };

  const toggleTransactionType = () => setIsCashIn(!isCashIn);

  const toggles = useMemo(
    () => [
      { text: 'Cash in', onPress: toggleTransactionType, isOn: isCashIn },
      { text: 'Cash out', onPress: toggleTransactionType, isOn: !isCashIn },
    ],
    [isCashIn]
  );

  const PressReason = useCallback(
    () =>
      isCashIn ? (
        <TouchableOpacity style={localStyles.containerStyle}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{placeholderReasonDisabled}</Text>
          </View>
          <View style={localStyles.iconContainerStyle} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{reason?.title ?? placeholderReason}</Text>
          </View>
          <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>
      ),
    [isCashIn, reason]
  );

  return (
    <View style={localStyles.modalContainerStyle}>
      <ToggleBar toggles={toggles} />
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressName}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{name?.name ?? placeholderName}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressAmount}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{amount ?? placeholderAmount}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <PressReason />
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressDescription}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{description ?? placeholderDescription}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <BottomModalContainer
        isOpen={isNameModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={names}
          keyToDisplay={CASH_TRANSACTION_KEYS.NAME}
          onPress={onSubmitName}
          highlightValue={name?.name}
        />
      </BottomModalContainer>
      <BottomTextEditor
        isOpen={isAmountModalOpen}
        buttonText="Confirm"
        value={textBuffer}
        placeholder={placeholderAmount}
        onChangeText={onChangeText}
        onConfirm={onSubmitAmount}
      />
      <BottomModalContainer
        isOpen={isReasonModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={reasons}
          keyToDisplay={CASH_TRANSACTION_KEYS.REASON}
          onPress={onSubmitReason}
          highlightValue={reason?.title}
        />
      </BottomModalContainer>
      <BottomTextEditor
        isOpen={isDescriptionModalOpen}
        buttonText="Confirm"
        value={textBuffer}
        placeholder={placeholderDescription}
        onChangeText={onChangeText}
        onConfirm={onSubmitDescription}
      />
      <PageButton
        text="OK"
        onPress={onCreate}
        isDisabled={!isValidTransaction}
        disabledColor={WARM_GREY}
        style={localStyles.okButton}
        textStyle={localStyles.pageButtonTextStyle}
      />
    </View>
  );
};

CashTransactionModal.defaultProps = {};

CashTransactionModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  modalContainerStyle: {
    flexDirection: 'column',
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10%',
  },
  bottomModalContainerStyle: {
    height: 120,
  },
  textContainerStyle: { width: '30%', justifyContent: 'center' },
  iconContainerStyle: { width: '5%', justifyContent: 'flex-end', alignItems: 'flex-end' },
  textStyle: { color: 'white' },
  okButton: {
    ...globalStyles.button,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
    marginTop: 60,
  },
  pageButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
});
