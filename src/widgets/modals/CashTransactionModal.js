/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import currency from '../../localization/currency';

import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_KEYS,
  CASH_TRANSACTION_TYPES,
} from '../../utilities/modules/dispensary/constants';

import { BottomModalContainer, BottomTextEditor, BottomCurrencyEditor } from '../bottomModals';
import { GenericChoiceList } from '../modalChildren';
import { PageButton } from '../PageButton';
import { PencilIcon, ChevronDownIcon } from '../icons';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';

const placeholderTextName = 'Choose a name';
const placeholderTextType = 'Choose a transaction type';
const placeholderTextAmount = 'Enter transaction amount';
const placeholderTextReason = 'Choose a reason';
const placeholderTextDescription = 'Enter a description';

const defaultTextAmount = '0.00';
const defaultTextDescription = '';

export const CashTransactionModal = ({ onConfirm }) => {
  const [name, setName] = useState();
  const [type, setType] = useState();
  const [amount, setAmount] = useState();
  const [reason, setReason] = useState();
  const [description, setDescription] = useState();

  const [amountBuffer, setAmountBuffer] = useState(defaultTextAmount);
  const [descriptionBuffer, setDescriptionBuffer] = useState(defaultTextDescription);

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

  const onCreate = useCallback(
    () => onConfirm({ name, type, amount: amount.value, reason, description }),
    [name, type, amount, reason, description]
  );

  const onChangeText = useMemo(() => text => setDescriptionBuffer(text));
  const onChangeAmount = useMemo(() => value => setAmountBuffer(value));

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
    if (amount) {
      setAmountBuffer(amount.format(false));
    }
    setIsAmountModalOpen(true);
  };

  const onPressReason = () => {
    resetBottomModal();
    setIsReasonModalOpen(true);
  };

  const onPressDescription = () => {
    resetBottomModal();
    if (description) {
      setDescriptionBuffer(description);
    }
    setIsDescriptionModalOpen(true);
  };

  const onSubmitName = ({ item: nameItem }) => {
    setName(nameItem);
    setIsNameModalOpen(false);
  };

  const onSubmitType = ({ item: typeItem }) => {
    setType(typeItem);
    setIsTypeModalOpen(false);
  };

  const onSubmitAmount = () => {
    setAmount(currency(amountBuffer));
    setIsAmountModalOpen(false);
  };

  const onSubmitReason = ({ item: reasonItem }) => {
    setReason(reasonItem);
    setIsReasonModalOpen(false);
  };

  const onSubmitDescription = () => {
    setDescription(descriptionBuffer);
    setIsDescriptionModalOpen(false);
  };

  const nameText = useMemo(() => name?.name ?? placeholderTextName, [name]);
  const typeText = useMemo(() => type?.title ?? placeholderTextType, [type]);
  const amountText = useMemo(() => amount?.format(false) ?? placeholderTextAmount, [amount]);
  const reasonText = useMemo(() => reason?.title ?? placeholderTextReason, [reason]);
  const descriptionText = useMemo(() => description ?? placeholderTextDescription, [description]);

  return (
    <View style={localStyles.modalContainerStyle}>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressName}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{nameText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressType}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{typeText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressAmount}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{amountText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{reasonText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressDescription}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{descriptionText}</Text>
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
      <BottomCurrencyEditor
        isOpen={isAmountModalOpen}
        buttonText="Confirm"
        value={amountBuffer}
        placeholder={placeholderTextAmount}
        onChangeText={onChangeAmount}
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
        value={descriptionBuffer}
        placeholder={placeholderTextDescription}
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
