/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';

import moment from 'moment';
import currency from '../../localization/currency';

import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_TYPES,
  CASH_TRANSACTION_INPUT_MODAL_FIELDS,
  CASH_TRANSACTION_INPUT_MODAL_KEYS,
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
import { DATE_FORMAT } from '../../utilities/constants';

const CashTransactionModalComponent = ({
  name,
  type,
  amount,
  paymentType,
  reason,
  description,
  amountBuffer,
  descriptionBuffer,
  isInputModalOpen,
  isInputNameModalOpen,
  isInputAmountModalOpen,
  isInputPaymentTypeModalOpen,
  isInputReasonModalOpen,
  isInputDescriptionModalOpen,
  isValid,
  onOpen,
  onClose,
  onToggleType,
  onPressName,
  onPressAmount,
  onPressPaymentType,
  onPressReason,
  onPressDescription,
  onUpdateAmountBuffer,
  onUpdateDescriptionBuffer,
  onSubmitName,
  onSubmitAmount,
  onSubmitPaymentType,
  onSubmitReason,
  onSubmitDescription,
  onCloseInputModal,
  onConfirm,
}) => {
  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const names = useMemo(() => UIDatabase.objects('CashTransactionName'), []);
  const paymentTypes = useMemo(() => UIDatabase.objects('PaymentType'), []);
  const reasons = useMemo(() => UIDatabase.objects('CashTransactionReason'), []);

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

  const renderNameLeftText = useCallback(
    ({ firstName, lastName, name: fullName, isPatient }) =>
      isPatient ? `${lastName}, ${firstName}` : `${fullName}`,
    []
  );

  const renderNameRightText = useCallback(({ isCustomer, isSupplier, isPatient, dateOfBirth }) => {
    if (isCustomer) {
      if (isPatient) {
        return `${dispensingStrings.patient} \n ${dispensingStrings.date_of_birth}: ${
          dateOfBirth
            ? moment(dateOfBirth).format(DATE_FORMAT.DD_MM_YYYY)
            : generalStrings.not_available
        }`;
      }
      return dispensingStrings.customer;
    }
    if (isSupplier) {
      return dispensingStrings.supplier;
    }
    return '';
  }, []);

  const toggles = useMemo(
    () => [
      {
        text: dispensingStrings.cash_in,
        onPress: onToggleType,
        isOn: type === CASH_TRANSACTION_TYPES.CASH_IN,
      },
      {
        text: dispensingStrings.cash_out,
        onPress: onToggleType,
        isOn: type === CASH_TRANSACTION_TYPES.CASH_OUT,
      },
    ],
    [type]
  );

  const PressReason = useCallback(
    () =>
      type === CASH_TRANSACTION_TYPES.CASH_OUT ? (
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{reasonText}</Text>
          </View>
          <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>
      ) : null,
    [type, reason]
  );

  const ConfirmButton = useCallback(
    () =>
      !isInputModalOpen ? (
        <PageButton
          text={buttonStrings.confirm}
          onPress={onConfirm}
          isDisabled={!isValid}
          disabledColor={WARM_GREY}
          style={localStyles.okButton}
          textStyle={localStyles.pageButtonTextStyle}
        />
      ) : null,
    [isInputModalOpen, isValid]
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
        isOpen={isInputAmountModalOpen}
        buttonText={buttonStrings.confirm}
        value={amountBuffer}
        placeholder={dispensingStrings.enter_the_amount}
        onChangeText={onUpdateAmountBuffer}
        onConfirm={onSubmitAmount}
      />
      <BottomModalContainer
        isOpen={isInputPaymentTypeModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={paymentTypes}
          keyToDisplay={CASH_TRANSACTION_INPUT_MODAL_KEYS.PAYMENT_TYPE}
          onPress={onSubmitPaymentType}
          highlightValue={paymentType?.title}
        />
      </BottomModalContainer>
      <BottomModalContainer
        isOpen={isInputReasonModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={reasons}
          keyToDisplay={CASH_TRANSACTION_INPUT_MODAL_KEYS.REASON}
          onPress={onSubmitReason}
          highlightValue={reason?.title}
        />
      </BottomModalContainer>
      <BottomTextEditor
        isOpen={isInputDescriptionModalOpen}
        buttonText={buttonStrings.confirm}
        value={descriptionBuffer}
        placeholder={dispensingStrings.enter_a_description}
        onChangeText={onUpdateDescriptionBuffer}
        onConfirm={onSubmitDescription}
      />
      <ModalContainer
        text={buttonStrings.confirm}
        title={dispensingStrings.choose_a_name}
        isVisible={isInputNameModalOpen}
        onClose={onCloseInputModal}
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

const mergeProps = (state, dispatch, ownProps) => {
  const {
    name,
    type,
    amount,
    paymentType,
    reason,
    description,
    amountBuffer,
    descriptionBuffer,
    balance,
  } = state;
  const {
    onUpdateName,
    onUpdateAmount,
    onUpdatePaymentType,
    onUpdateReason,
    onUpdateDescription,
    onInitialiseAmountBuffer,
    onInitialiseDescriptionBuffer,
    onOpenInputNameModal,
    onOpenInputAmountModal,
    onOpenInputPaymentTypeModal,
    onOpenInputReasonModal,
    onOpenInputDescriptionModal,
  } = dispatch;
  const { onConfirm } = ownProps;

  const onPressName = () => onOpenInputNameModal();
  const onPressAmount = () => {
    onInitialiseAmountBuffer();
    onOpenInputAmountModal();
  };
  const onPressPaymentType = () => onOpenInputPaymentTypeModal();
  const onPressReason = () => onOpenInputReasonModal();
  const onPressDescription = () => {
    onInitialiseDescriptionBuffer();
    onOpenInputDescriptionModal();
  };

  const onSubmitName = newName => onUpdateName(newName);
  const onSubmitAmount = () => onUpdateAmount(currency(amountBuffer));
  const onSubmitPaymentType = ({ item: newPaymentType }) => onUpdatePaymentType(newPaymentType);
  const onSubmitReason = ({ item: newReason }) => onUpdateReason(newReason);
  const onSubmitDescription = () => onUpdateDescription(descriptionBuffer);

  const onConfirmValidTransaction = () =>
    onConfirm({ name, type, amount: amount.value, paymentType, reason, description });
  const onConfirmInvalidTransaction = () =>
    ToastAndroid.show(dispensingStrings.unable_to_create_withdrawl, ToastAndroid.LONG);
  const isValidWithdrawal =
    !!amount && !(type === CASH_TRANSACTION_TYPES.CASH_OUT && amount.value > balance.value);

  return {
    ...state,
    ...dispatch,
    ...ownProps,
    onPressName,
    onPressAmount,
    onPressPaymentType,
    onPressReason,
    onPressDescription,
    onSubmitName,
    onSubmitAmount,
    onSubmitPaymentType,
    onSubmitReason,
    onSubmitDescription,
    onConfirm: isValidWithdrawal ? onConfirmValidTransaction : onConfirmInvalidTransaction,
  };
};

const mapDispatchToProps = dispatch => {
  const onOpen = () => dispatch(CashTransactionActions.initialise());
  const onClose = () => dispatch(CashTransactionActions.reset());
  const onUpdateName = name => {
    dispatch(CashTransactionActions.updateName(name));
    dispatch(CashTransactionActions.closeInputModal());
  };
  const onToggleType = () => dispatch(CashTransactionActions.toggleType());
  const onUpdateAmount = amount => {
    dispatch(CashTransactionActions.updateAmount(amount));
    dispatch(CashTransactionActions.closeInputModal());
  };
  const onUpdatePaymentType = paymentType => {
    dispatch(CashTransactionActions.updatePaymentType(paymentType));
    dispatch(CashTransactionActions.closeInputModal());
  };
  const onUpdateReason = reason => {
    dispatch(CashTransactionActions.updateReason(reason));
    dispatch(CashTransactionActions.closeInputModal());
  };
  const onUpdateDescription = description => {
    dispatch(CashTransactionActions.updateDescription(description));
    dispatch(CashTransactionActions.closeInputModal());
  };
  const onInitialiseAmountBuffer = () => dispatch(CashTransactionActions.initialiseAmountBuffer());
  const onInitialiseDescriptionBuffer = () =>
    dispatch(CashTransactionActions.initialiseDescriptionBuffer());
  const onUpdateAmountBuffer = amount => {
    dispatch(CashTransactionActions.updateAmountBuffer(amount));
  };
  const onUpdateDescriptionBuffer = description => {
    dispatch(CashTransactionActions.updateDescriptionBuffer(description));
  };
  const onOpenInputNameModal = () => {
    dispatch(CashTransactionActions.closeInputModal());
    dispatch(CashTransactionActions.openInputModal(CASH_TRANSACTION_INPUT_MODAL_FIELDS.NAME));
  };
  const onOpenInputAmountModal = () => {
    dispatch(CashTransactionActions.closeInputModal());
    dispatch(CashTransactionActions.openInputModal(CASH_TRANSACTION_INPUT_MODAL_FIELDS.AMOUNT));
  };
  const onOpenInputPaymentTypeModal = () => {
    dispatch(CashTransactionActions.closeInputModal());
    dispatch(
      CashTransactionActions.openInputModal(CASH_TRANSACTION_INPUT_MODAL_FIELDS.PAYMENT_TYPE)
    );
  };
  const onOpenInputReasonModal = () => {
    dispatch(CashTransactionActions.closeInputModal());
    dispatch(CashTransactionActions.openInputModal(CASH_TRANSACTION_INPUT_MODAL_FIELDS.REASON));
  };
  const onOpenInputDescriptionModal = () => {
    dispatch(CashTransactionActions.closeInputModal());
    dispatch(
      CashTransactionActions.openInputModal(CASH_TRANSACTION_INPUT_MODAL_FIELDS.DESCRIPTION)
    );
  };
  const onCloseInputModal = () => dispatch(CashTransactionActions.closeInputModal());

  return {
    onOpen,
    onClose,
    onUpdateName,
    onToggleType,
    onUpdateAmount,
    onUpdatePaymentType,
    onUpdateReason,
    onUpdateDescription,
    onInitialiseAmountBuffer,
    onInitialiseDescriptionBuffer,
    onUpdateAmountBuffer,
    onUpdateDescriptionBuffer,
    onOpenInputNameModal,
    onOpenInputAmountModal,
    onOpenInputPaymentTypeModal,
    onOpenInputReasonModal,
    onOpenInputDescriptionModal,
    onCloseInputModal,
  };
};

const mapStateToProps = state => {
  const name = CashTransactionSelectors.name(state);
  const type = CashTransactionSelectors.type(state);
  const amount = CashTransactionSelectors.amount(state);
  const paymentType = CashTransactionSelectors.paymentType(state);
  const reason = CashTransactionSelectors.reason(state);
  const description = CashTransactionSelectors.description(state);
  const balance = CashTransactionSelectors.balance(state);
  const amountBuffer = CashTransactionSelectors.amountBuffer(state);
  const descriptionBuffer = CashTransactionSelectors.descriptionBuffer(state);
  const isInputModalOpen = CashTransactionSelectors.isInputModalOpen(state);
  const isInputNameModalOpen = CashTransactionSelectors.isInputNameModalOpen(state);
  const isInputAmountModalOpen = CashTransactionSelectors.isInputAmountModalOpen(state);
  const isInputPaymentTypeModalOpen = CashTransactionSelectors.isInputPaymentTypeModalOpen(state);
  const isInputReasonModalOpen = CashTransactionSelectors.isInputReasonModalOpen(state);
  const isInputDescriptionModalOpen = CashTransactionSelectors.isInputDescriptionModalOpen(state);
  const isValid = CashTransactionSelectors.isValid(state);
  return {
    name,
    type,
    amount,
    paymentType,
    reason,
    description,
    balance,
    amountBuffer,
    descriptionBuffer,
    isInputModalOpen,
    isInputNameModalOpen,
    isInputAmountModalOpen,
    isInputPaymentTypeModalOpen,
    isInputReasonModalOpen,
    isInputDescriptionModalOpen,
    isValid,
  };
};

export const CashTransactionModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CashTransactionModalComponent);

CashTransactionModalComponent.defaultProps = {
  name: null,
  amount: null,
  paymentType: null,
  reason: null,
  description: null,
  amountBuffer: '',
  descriptionBuffer: '',
  isValid: false,
};

/* eslint-disable react/forbid-prop-types */
CashTransactionModalComponent.propTypes = {
  name: PropTypes.object,
  type: PropTypes.string.isRequired,
  amount: PropTypes.object,
  paymentType: PropTypes.object,
  reason: PropTypes.object,
  description: PropTypes.string,
  amountBuffer: PropTypes.string,
  descriptionBuffer: PropTypes.string,
  isInputModalOpen: PropTypes.bool.isRequired,
  isInputNameModalOpen: PropTypes.bool.isRequired,
  isInputAmountModalOpen: PropTypes.bool.isRequired,
  isInputPaymentTypeModalOpen: PropTypes.bool.isRequired,
  isInputReasonModalOpen: PropTypes.bool.isRequired,
  isInputDescriptionModalOpen: PropTypes.bool.isRequired,
  isValid: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleType: PropTypes.func.isRequired,
  onPressName: PropTypes.func.isRequired,
  onPressAmount: PropTypes.func.isRequired,
  onPressPaymentType: PropTypes.func.isRequired,
  onPressReason: PropTypes.func.isRequired,
  onPressDescription: PropTypes.func.isRequired,
  onUpdateAmountBuffer: PropTypes.func.isRequired,
  onUpdateDescriptionBuffer: PropTypes.func.isRequired,
  onSubmitName: PropTypes.func.isRequired,
  onSubmitAmount: PropTypes.func.isRequired,
  onSubmitPaymentType: PropTypes.func.isRequired,
  onSubmitReason: PropTypes.func.isRequired,
  onSubmitDescription: PropTypes.func.isRequired,
  onCloseInputModal: PropTypes.func.isRequired,
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
