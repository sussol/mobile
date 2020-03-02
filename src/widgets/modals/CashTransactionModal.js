/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid } from 'react-native';

import moment from 'moment';
import currency from '../../localization/currency';

import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_FIELD_KEYS,
  CASH_TRANSACTION_TYPES,
} from '../../utilities/modules/dispensary/constants';

import { ToggleBar } from '../ToggleBar';
import { ModalContainer } from './ModalContainer';
import { BottomModalContainer, BottomTextEditor, BottomCurrencyEditor } from '../bottomModals';
import { GenericChoiceList, AutocompleteSelector } from '../modalChildren';
import { PageButton } from '../PageButton';
import { PencilIcon, ChevronDownIcon } from '../icons';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE, COMPONENT_HEIGHT } from '../../globalStyles';
import { buttonStrings, dispensingStrings, generalStrings } from '../../localization';
import { FlexRow } from '../FlexRow';

export const CashTransactionModal = ({ onConfirm }) => {
  const [name, setName] = useState(null);
  const [isCashIn, setIsCashIn] = useState(true);
  const [amount, setAmount] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState(null);

  const [amountBuffer, setAmountBuffer] = useState(currency(0).format());
  const [descriptionBuffer, setDescriptionBuffer] = useState('');

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const balance = React.useMemo(() => {
    const receiptBalance = UIDatabase.objects('Transaction')
      .filtered('type == "receipt" && paymentType.code == $0', paymentType?.code)
      .sum('subtotal');

    const paymentBalance = UIDatabase.objects('Transaction')
      .filtered('type == "payment" && paymentType.code == $0', paymentType?.code)
      .sum('subtotal');

    return currency(receiptBalance - paymentBalance);
  }, [paymentType]);

  const names = useMemo(() => UIDatabase.objects('CashTransactionName'), []);
  const type = useMemo(
    () => (isCashIn ? CASH_TRANSACTION_TYPES.CASH_IN : CASH_TRANSACTION_TYPES.CASH_OUT),
    [isCashIn]
  );
  const paymentTypes = useMemo(() => UIDatabase.objects('PaymentType'), []);
  const reasons = useMemo(() => UIDatabase.objects('CashTransactionReason'), []);

  const isValidTransaction = useMemo(
    () =>
      !!name && !!amount && currency(amount) > currency(0) && (isCashIn || !!reason) && paymentType,
    [name, amount, reason, isCashIn, paymentType]
  );

  const onCreate = useCallback(() => {
    if (amount.value > balance.value && !isCashIn) {
      ToastAndroid.show(dispensingStrings.unable_to_create_withdrawl, ToastAndroid.LONG);
    } else {
      onConfirm({ name, type, amount: amount.value, paymentType, reason, description });
    }
  }, [name, type, amount, paymentType, reason, description, balance]);

  const onChangeText = useMemo(() => text => setDescriptionBuffer(text), []);
  const onChangeAmount = useMemo(() => value => setAmountBuffer(value), []);

  const renderNameLeftText = useCallback(
    ({ firstName, lastName, name: fullName, isPatient }) =>
      isPatient ? `${lastName}, ${firstName}` : `${fullName}`,
    []
  );

  const renderNameRightText = useCallback(({ isCustomer, isSupplier, isPatient, dateOfBirth }) => {
    if (isCustomer) {
      if (isPatient) {
        return `${dispensingStrings.patient} \n ${dispensingStrings.date_of_birth}: ${
          dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : generalStrings.not_available
        }`;
      }
      return dispensingStrings.customer;
    }
    if (isSupplier) {
      return dispensingStrings.supplier;
    }
    return '';
  }, []);

  const resetBottomModal = () => {
    setIsNameModalOpen(false);
    setIsAmountModalOpen(false);
    setIsPaymentTypeModalOpen(false);
    setIsReasonModalOpen(false);
    setIsDescriptionModalOpen(false);
  };

  const onPressName = () => {
    resetBottomModal();
    setIsNameModalOpen(true);
  };

  const onPressAmount = () => {
    resetBottomModal();
    if (amount) {
      setAmountBuffer(amount.format(false));
    }
    setIsAmountModalOpen(true);
  };

  const onPressPaymentType = () => {
    resetBottomModal();
    setIsPaymentTypeModalOpen(true);
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

  const onSubmitName = nameItem => {
    setName(nameItem);
    setIsNameModalOpen(false);
  };

  const onCloseName = () => setIsNameModalOpen(false);

  const onSubmitAmount = () => {
    setAmount(currency(amountBuffer));
    setIsAmountModalOpen(false);
  };

  const onSubmitPaymentType = ({ item: paymentTypeItem }) => {
    setPaymentType(paymentTypeItem);
    setIsPaymentTypeModalOpen(false);
  };

  const onSubmitReason = ({ item: reasonItem }) => {
    setReason(reasonItem);
    setIsReasonModalOpen(false);
  };

  const onSubmitDescription = () => {
    setDescription(descriptionBuffer);
    setIsDescriptionModalOpen(false);
  };

  const nameText = useMemo(() => name?.name ?? dispensingStrings.choose_a_name, [name]);
  const amountText = useMemo(() => amount?.format(false) ?? dispensingStrings.enter_the_amount, [
    amount,
  ]);
  const paymentTypeText = useMemo(
    () => paymentType?.description ?? dispensingStrings.choose_a_payment_type,
    [paymentType]
  );
  const reasonText = useMemo(() => reason?.title ?? dispensingStrings.choose_a_reason, [reason]);
  const descriptionText = useMemo(() => description ?? dispensingStrings.enter_a_description, [
    description,
  ]);
  const toggleTransactionType = () => setIsCashIn(!isCashIn);

  const toggles = useMemo(
    () => [
      { text: dispensingStrings.cash_in, onPress: toggleTransactionType, isOn: isCashIn },
      { text: dispensingStrings.cash_out, onPress: toggleTransactionType, isOn: !isCashIn },
    ],
    [isCashIn]
  );

  const PressReason = useCallback(
    () =>
      isCashIn ? null : (
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{reasonText}</Text>
          </View>
          <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>
      ),
    [isCashIn, reason]
  );

  return (
    <>
      <FlexRow justifyContent="center">
        <View style={{ maxWidth: 300 }}>
          <ToggleBar style={localStyles.toggleBarStyle} toggles={toggles} />
        </View>
      </FlexRow>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressName}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{nameText}</Text>
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
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressPaymentType}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{paymentTypeText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>

      <PressReason />
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressDescription}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{descriptionText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <BottomCurrencyEditor
        isOpen={isAmountModalOpen}
        buttonText={buttonStrings.confirm}
        value={amountBuffer}
        placeholder={dispensingStrings.enter_the_amount}
        onChangeText={onChangeAmount}
        onConfirm={onSubmitAmount}
      />
      <BottomModalContainer
        isOpen={isPaymentTypeModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={paymentTypes}
          keyToDisplay={CASH_TRANSACTION_FIELD_KEYS.PAYMENT_TYPE}
          onPress={onSubmitPaymentType}
          highlightValue={paymentType?.title}
        />
      </BottomModalContainer>
      <BottomModalContainer
        isOpen={isReasonModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={reasons}
          keyToDisplay={CASH_TRANSACTION_FIELD_KEYS.REASON}
          onPress={onSubmitReason}
          highlightValue={reason?.title}
        />
      </BottomModalContainer>
      <BottomTextEditor
        isOpen={isDescriptionModalOpen}
        buttonText={buttonStrings.confirm}
        value={descriptionBuffer}
        placeholder={dispensingStrings.enter_a_description}
        onChangeText={onChangeText}
        onConfirm={onSubmitDescription}
      />
      <PageButton
        text={buttonStrings.confirm}
        onPress={onCreate}
        isDisabled={!isValidTransaction}
        disabledColor={WARM_GREY}
        style={localStyles.okButton}
        textStyle={localStyles.pageButtonTextStyle}
      />

      <ModalContainer
        title={dispensingStrings.choose_a_name}
        isVisible={isNameModalOpen}
        onClose={onCloseName}
      >
        <AutocompleteSelector
          options={names}
          queryString="name CONTAINS[c] $0"
          sortKeyString="name"
          renderLeftText={renderNameLeftText}
          renderRightText={renderNameRightText}
          onSelect={onSubmitName}
        />
      </ModalContainer>
    </>
  );
};

CashTransactionModal.defaultProps = {};

CashTransactionModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
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
  toggleBarStyle: { marginBottom: COMPONENT_HEIGHT },
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
