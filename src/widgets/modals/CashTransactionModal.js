/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, {useMemo, useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { UIDatabase } from '../../database';

import { BottomModalContainer, BottomTextEditor } from '../bottomModals';
import { GenericChoiceList } from '../modalChildren';
import { PencilIcon, ChevronDownIcon } from '../icons';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';

const placeholderName = "Choose a name";
const placeholderTransactionType = "Choose a transaction type";
const placeholderTransactionAmount = "Enter transaction amount";
const placeholderReason = "Choose a reason";
const placeholderDescription = "Enter a description";

const CASH_TRANSACTION_TYPES = ['Cash in', 'Cash out'];

export const CashTransactionModal = () => {
  const [name, setName] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState(null)

  const [textBuffer, setTextBuffer] = useState('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isTransactionTypeModalOpen, setIsTransactionTypeModalOpen] = useState(false);
  const [isTransactionAmountModalOpen, setIsTransactionAmountModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const names = useMemo(() => UIDatabase.objects('Name').filtered('isVisible == true'));
  const transactionTypes = useMemo(() => CASH_TRANSACTION_TYPES.map(transactionType => ({ title: transactionType })));
  const reasons = useMemo(() => UIDatabase.objects('Options'));

  const onChangeText = text => setTextBuffer(text);

  const onPressName = () => {
    setIsNameModalOpen(true);
  }

  const onPressTransactionType = () => {
    setIsTransactionTypeModalOpen(true);
  }

  const onPressTransactionAmount = () => {
    setIsTransactionAmountModalOpen(true);
    setTextBuffer(transactionAmount);
  }

  const onPressReason = () => {
    setIsReasonModalOpen(true);
  }

  const onPressDescription = () => {
    setIsDescriptionModalOpen(true);
    setTextBuffer(description);
  }

  const onSubmitName = ({item}) => {
      setName(item);
      setIsNameModalOpen(false);
  }

  const onSubmitTransactionType = ({item}) => {
    setTransactionType(item);
    setIsTransactionTypeModalOpen(false);
  }

  const onSubmitTransactionAmount = () => {
    setTransactionAmount(textBuffer);
    setIsTransactionAmountModalOpen(false);
  }

  const onSubmitReason = ({item}) => {
      setReason(item);
      setIsReasonModalOpen(false);
  }

  const onSubmitDescription = () => {
    setDescription(textBuffer);
    setIsDescriptionModalOpen(false);
  }

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
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressTransactionType}>
        <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{transactionType?.title ?? placeholderTransactionType}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
        </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressTransactionAmount}>
        <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{transactionAmount ?? placeholderTransactionAmount}</Text>
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
        <BottomModalContainer isOpen={isNameModalOpen} modalStyle={localStyles.bottomModalContainerStyle}>
            <GenericChoiceList data={names} keyToDisplay={'name'} onPress={onSubmitName} highlightValue={name?.name}/>
        </BottomModalContainer>
        <BottomModalContainer isOpen={isTransactionTypeModalOpen} modalStyle={localStyles.bottomModalContainerStyle}>
            <GenericChoiceList data={transactionTypes} keyToDisplay={'title'} onPress={onSubmitTransactionType} highlightValue={transactionType?.title}/>
        </BottomModalContainer>
        <BottomTextEditor
                isOpen={isTransactionAmountModalOpen}
                buttonText={'Confirm'}
                value={textBuffer}
                placeholder={placeholderTransactionAmount}
                onChangeText={onChangeText}
                onConfirm={onSubmitTransactionAmount}
        />
        <BottomModalContainer isOpen={isReasonModalOpen} modalStyle={localStyles.bottomModalContainerStyle}>
            <GenericChoiceList data={reasons} keyToDisplay={'title'} onPress={onSubmitReason} highlightValue={reason?.title}/>
        </BottomModalContainer>
        <BottomTextEditor
                isOpen={isDescriptionModalOpen}
                buttonText={'Confirm'}
                value={textBuffer}
                placeholder={placeholderDescription}
                onChangeText={onChangeText}
                onConfirm={onSubmitDescription}
        />
    </View>
  );
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
});
