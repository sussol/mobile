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

const placeholderName = 'Choose a name';
const placeholderType = 'Choose a transaction type';
const placeholderAmount = 'Enter transaction amount';
const placeholderReason = 'Choose a reason';
const placeholderDescription = 'Enter a description';

export const CashTransactionModal = ({ onConfirm }) => {
  const [name, setName] = useState(null);
  const [type, setType] = useState(null);
  const [amount, setAmount] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState(null);

  const [textBuffer, setTextBuffer] = useState('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const names = useMemo(() => UIDatabase.objects('Name'));
  const reasons = useMemo(() => UIDatabase.objects('Options'));

  const isValidTransaction = useMemo(() => !!name && !!type && !!amount && !!reason, [
    name,
    type,
    amount,
    reason,
  ]);

  const onCreate = useCallback(() => onConfirm({ name, type, amount, reason, description }), [
    name,
    type,
    amount,
    reason,
    description,
  ]);

  const onChangeText = text => setTextBuffer(text);

  const resetBottomModal = () => {
    setIsNameModalOpen(false);
    setIsTypeModalOpen(false);
    setIsAmountModalOpen(false);
    setIsReasonModalOpen(false);
    setIsDescriptionModalOpen(false);
  };

  const onPressName = () => {
    resetBottomModal();
    setIsNameModalOpen(true);
  };

  const onPressType = () => {
    resetBottomModal();
    setIsTypeModalOpen(true);
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

  const onSubmitType = ({ item }) => {
    setType(item);
    setIsTypeModalOpen(false);
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

  return (
    <View style={localStyles.modalContainerStyle}>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressName}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{name?.name ?? placeholderName}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressType}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{type?.title ?? placeholderType}</Text>
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
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{reason?.title ?? placeholderReason}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
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
      <BottomModalContainer
        isOpen={isTypeModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={CASH_TRANSACTION_TYPES}
          keyToDisplay={CASH_TRANSACTION_KEYS.TYPE}
          onPress={onSubmitType}
          highlightValue={type?.title}
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
