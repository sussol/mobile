/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { BottomModalContainer, BottomTextEditor } from '../bottomModals';
import { PencilIcon, ChevronDownIcon } from '../icons';

export const CashTransactionModal = () => {
const placeholderTransactionAmount = "Enter transaction amount";
const placeholderDescription = "Enter a description";


  const [transactionAmount, setTransactionAmount] = useState(null);
  const [description, setDescription] = useState(null)
  const [textBuffer, setTextBuffer] = useState('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isTransactionAmountModalOpen, setIsTransactionAmountModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const onChangeText = text => setTextBuffer(text);

  const onPressTransactionAmount = () => {
    setIsTransactionAmountModalOpen(true);
    setTextBuffer(transactionAmount);
  }
  const onPressDescription = () => {
    setIsDescriptionModalOpen(true);
    setTextBuffer(description);
  }
  const onSubmitTransactionAmount = () => {
    setTransactionAmount(textBuffer);
    setIsTransactionAmountModalOpen(false);
  }

  const onSubmitDescription = () => {
    setDescription(textBuffer);
    setIsDescriptionModalOpen(false);
  }

  return (
    <View style={localStyles.modalContainerStyle}>
        <TouchableOpacity style={localStyles.containerStyle}>
        <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>Select a name</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
        </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.containerStyle}>
        <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>Choose transaction type</Text>
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
        <TouchableOpacity style={localStyles.containerStyle}>
        <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>Select reason</Text>
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
        <BottomTextEditor
                isOpen={isTransactionAmountModalOpen}
                buttonText={'Confirm'}
                value={textBuffer}
                placeholder={placeholderTransactionAmount}
                onChangeText={onChangeText}
                onConfirm={onSubmitTransactionAmount}
        />
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
  textContainerStyle: { width: '30%', justifyContent: 'center' },
  iconContainerStyle: { width: '5%', justifyContent: 'flex-end', alignItems: 'flex-end' },
  textStyle: { color: 'white' },
});
