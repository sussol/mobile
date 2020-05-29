/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';

import moment from 'moment';
import currency from '../../localization/currency';

import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_FIELDS,
  CASH_TRANSACTION_TYPES,
} from '../../utilities/modules/dispensary/constants';

import { CashTransactionActions } from '../../actions';
import { CashTransactionSelectors } from '../../selectors';

import { ToggleBar } from '../ToggleBar';
import { ModalContainer } from './ModalContainer';
import { BottomModalContainer, BottomTextEditor, BottomCurrencyEditor } from '../bottomModals';
import { GenericChoiceList, AutocompleteSelector } from '../modalChildren';
import { PageButton } from '../PageButton';
import { PencilIcon, ChevronDownIcon } from '../icons';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE, COMPONENT_HEIGHT } from '../../globalStyles';
import { buttonStrings, dispensingStrings, generalStrings } from '../../localization';
import { FlexRow } from '../FlexRow';

const CashTransactionModalComponent = ({ name, type, amount, paymentType, reason, description, onUpdateName, onToggleType, onUpdateAmount, onUpdatePaymentType, onUpdateReason, onUpdateDescription, onConfirm }) => {
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
  const paymentTypes = useMemo(() => UIDatabase.objects('PaymentType'), []);
  const reasons = useMemo(() => UIDatabase.objects('CashTransactionReason'), []);

  const isValidTransaction = useMemo(
    () =>
      !!name && !!amount && currency(amount) > currency(0) && (type === CASH_TRANSACTION_TYPES.CASH_IN || !!reason) && paymentType,
    [name, amount, reason, type, paymentType]
  );

  const isModalOpen = useMemo(
    () =>
      isNameModalOpen ||
      isAmountModalOpen ||
      isPaymentTypeModalOpen ||
      isReasonModalOpen ||
      isDescriptionModalOpen,
    [
      isNameModalOpen,
      isAmountModalOpen,
      isPaymentTypeModalOpen,
      isReasonModalOpen,
      isDescriptionModalOpen,
    ]
  );

  const onCreate = useCallback(() => {
    if (amount.value > balance.value && type !== CASH_TRANSACTION_TYPES.CASH_IN) {
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
      console.log(amount);
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

  const onSubmitName = name => {
    onUpdateName(name);
    setIsNameModalOpen(false);
  };

  const onCloseName = () => setIsNameModalOpen(false);

  const onSubmitAmount = () => {
    onUpdateAmount(currency(amountBuffer));
    setIsAmountModalOpen(false);
  };

  const onSubmitPaymentType = ({ item: paymentType }) => {
    onUpdatePaymentType(paymentType);
    setIsPaymentTypeModalOpen(false);
  };

  const onSubmitReason = ({ item: reason }) => {
    onUpdateReason(reason);
    setIsReasonModalOpen(false);
  };

  const onSubmitDescription = () => {
    onUpdateDescription(descriptionBuffer);
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

  const toggles = useMemo(
    () => [
      { text: dispensingStrings.cash_in, onPress: onToggleType, isOn: type === CASH_TRANSACTION_TYPES.CASH_IN },
      { text: dispensingStrings.cash_out, onPress: onToggleType, isOn: type === CASH_TRANSACTION_TYPES.CASH_OUT },
    ],
    [type]
  );

  const PressReason = useCallback(
    () =>
      type === CASH_TRANSACTION_TYPES.CASH_IN ? null : (
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{reasonText}</Text>
          </View>
          <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>
      ),
    [type, reason]
  );

  const ConfirmButton = useCallback(
    () =>
      isModalOpen || (
        <PageButton
          text={buttonStrings.confirm}
          onPress={onCreate}
          isDisabled={!isValidTransaction}
          disabledColor={WARM_GREY}
          style={localStyles.okButton}
          textStyle={localStyles.pageButtonTextStyle}
        />
      ),
    [isModalOpen]
  );

  return (
    <>
      <FlexRow justifyContent="center">
        <View style={localStyles.toggleBarContainerStyle}>
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
      <ConfirmButton />
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
          keyToDisplay={CASH_TRANSACTION_FIELDS.PAYMENT_TYPE}
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
          keyToDisplay={CASH_TRANSACTION_FIELDS.REASON}
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

const mapDispatchToProps = dispatch => {
  const onUpdateName = name => dispatch(CashTransactionActions.updateName(name));
  const onToggleType = () => dispatch(CashTransactionActions.toggleType());
  const onUpdateAmount = amount => dispatch(CashTransactionActions.updateAmount(amount));
  const onUpdatePaymentType = paymentType => dispatch(CashTransactionActions.updatePaymentType(paymentType));
  const onUpdateReason = reason => dispatch(CashTransactionActions.updateReason(reason));
  const onUpdateDescription = description => dispatch(CashTransactionActions.updateDescription(description));
  return { onUpdateName, onToggleType, onUpdateAmount, onUpdatePaymentType, onUpdateReason, onUpdateDescription };
}

const mapStateToProps = state => {
  const name = CashTransactionSelectors.name(state);
  const type = CashTransactionSelectors.type(state);
  const amount = CashTransactionSelectors.amount(state);
  const paymentType = CashTransactionSelectors.paymentType(state);
  const reason = CashTransactionSelectors.reason(state);
  const description = CashTransactionSelectors.description(state);
  return { name, type, amount, paymentType, reason, description };
}

export const CashTransactionModal = connect(mapStateToProps, mapDispatchToProps)(CashTransactionModalComponent);

CashTransactionModalComponent.defaultProps = {
  name: null,
  amount: null,
  paymentType: null,
  reason: null,
  description: null,
};

CashTransactionModalComponent.propTypes = {
  name: PropTypes.object,
  type: PropTypes.string.isRequired,
  amount: PropTypes.object,
  paymentType: PropTypes.object,
  reason: PropTypes.object,
  description: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onToggleType: PropTypes.func.isRequired,
  onUpdateAmount: PropTypes.func.isRequired,
  onUpdatePaymentType: PropTypes.func.isRequired,
  onUpdateReason: PropTypes.func.isRequired,
  onUpdateDescription: PropTypes.func.isRequired,
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
  toggleBarContainerStyle: {
    marginTop: 50,
    maxWidth: 300,
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
