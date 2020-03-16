/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ConfirmForm } from '../modalChildren';

import { modalStrings } from '../../localization';
import { ModalContainer } from './ModalContainer';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';

import { FinaliseActions } from '../../actions/FinaliseActions';
import { selectCurrentUser } from '../../selectors/user';
import { selectCanFinalise, selectFinaliseMessage } from '../../selectors/finalise';

/**
 * Presents a modal allowing the user to confirm or cancel finalising a record.
 * Will first check for an error that would prevent finalising, if an error checking
 * function is passed in within the finaliseItem.
 * @prop  {boolean}   isOpen          Whether the modal is open
 * @prop  {function}  onClose         Function to call when finalise is cancelled
 * @prop  {String}    finaliseMessage Message to display to the user.
 * @prop  {Boolean}   canFinalise     Indication whether the current item can be finalised.
 */
export const FinaliseModalComponent = ({
  finaliseMessage,
  canFinalise,
  closeFinaliseModal,
  finaliseModalOpen,
  onFinalise,
}) => {
  const runWithLoadingIndicator = useLoadingIndicator();

  const finaliseWithLoadingIndicator = React.useCallback(
    () => runWithLoadingIndicator(onFinalise),
    []
  );

  return (
    <ModalContainer fullScreen={true} isVisible={finaliseModalOpen}>
      <ConfirmForm
        isOpen={finaliseModalOpen}
        questionText={finaliseMessage}
        confirmText={modalStrings.confirm}
        cancelText={canFinalise ? modalStrings.cancel : modalStrings.got_it}
        onConfirm={canFinalise ? finaliseWithLoadingIndicator : null}
        onCancel={closeFinaliseModal}
      />
    </ModalContainer>
  );
};

const mapStateToProps = state => {
  const { finalise } = state;
  const { finaliseModalOpen, finaliseItem } = finalise;

  const currentUser = selectCurrentUser(state);
  const canFinalise = selectCanFinalise(state);
  const finaliseMessage = selectFinaliseMessage(state);

  return { finaliseModalOpen, currentUser, finaliseItem, finaliseMessage, canFinalise };
};

const mapDispatchToProps = dispatch => {
  const closeFinaliseModal = () => dispatch(FinaliseActions.closeModal());
  const onFinalise = () => dispatch(FinaliseActions.finalise());

  return { onFinalise, closeFinaliseModal };
};

FinaliseModalComponent.defaultProps = {
  finaliseModalOpen: false,
  finaliseMessage: '',
  canFinalise: false,
};

FinaliseModalComponent.propTypes = {
  finaliseModalOpen: PropTypes.bool,
  closeFinaliseModal: PropTypes.func.isRequired,
  onFinalise: PropTypes.func.isRequired,
  finaliseMessage: PropTypes.string,
  canFinalise: PropTypes.bool,
};

export const FinaliseModal = connect(mapStateToProps, mapDispatchToProps)(FinaliseModalComponent);
