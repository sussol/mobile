/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import ModalContainer from './ModalContainer';
import { getModalTitle, MODAL_KEYS } from '../../utilities/getModalTitle';
import { AutocompleteSelector } from '../AutocompleteSelector';
import { TextEditor } from '../TextEditor';
import { ByProgramModal } from './ByProgramModal';
import { ToggleSelector } from '../ToggleSelector';
import { RegimenDataModal } from './RegimenDataModal';
import { NewConfirmModal } from './NewConfirmModal';
import { GenericChoiceList } from '../GenericChoiceList';
import { UIDatabase } from '../../database';
import { modalStrings } from '../../localization';
import Settings from '../../settings/MobileAppSettings';

import {
  dataTableColors,
  dataTableStyles,
  pageStyles,
  SUSSOL_ORANGE,
} from '../../globalStyles/index';
import NewSocktakeBatchModal from './NewStocktakeBatchModal';

/**
 * Wrapper around ModalContainer, containing common modals used in various
 * DataTable pages.
 *
 * NOTE: Exported component is MEMOIZED - see below for propsAreEqual implementation.
 *
 * @prop {Bool}   fullScreen   Force the modal to cover the entire screen.
 * @prop {Bool}   isOpen       Whether the modal is open
 * @prop {Func}   onClose      A function to call if the close x is pressed
 * @prop {Func}   onSelect     The components to render within the modal
 * @prop {String} modalKey     The title to show in within the modal.
 * @prop {String} currentValue The current value a modal should be i.e. theirRef/comment
 */

const ADDITIONAL_MODAL_PROPS = {
  [MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM]: { noCancel: true, fullScreen: true },
  [MODAL_KEYS.ENFORCE_STOCKTAKE_REASON]: { noCancel: true, fullScreen: true },
};

const DataTablePageModalComponent = ({
  fullScreen,
  isOpen,
  onClose,
  modalKey,
  onSelect,
  currentValue,
}) => {
  const ModalContent = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={onSelect}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case MODAL_KEYS.THEIR_REF_EDIT:
      case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return <TextEditor text={currentValue} onEndEditing={onSelect} />;

      case MODAL_KEYS.SELECT_CUSTOMER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Customer')}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_customer}
            queryString="name BEGINSWITH[c] $0"
            sortByString="name"
            onSelect={onSelect}
          />
        );

      case MODAL_KEYS.SELECT_SUPPLIER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('ExternalSupplier')}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_supplier}
            queryString="name BEGINSWITH[c] $0"
            sortByString="name"
            onSelect={onSelect}
          />
        );

      case MODAL_KEYS.PROGRAM_STOCKTAKE:
      case MODAL_KEYS.PROGRAM_REQUISITION:
        return (
          <ByProgramModal
            onConfirm={onSelect}
            database={UIDatabase}
            transactionType={
              modalKey === MODAL_KEYS.PROGRAM_STOCKTAKE ? 'stocktake' : 'requisition'
            }
            settings={Settings}
          />
        );

      case MODAL_KEYS.SELECT_MONTH:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={onSelect}
            selected={currentValue}
          />
        );

      case MODAL_KEYS.VIEW_REGIMEN_DATA:
        return (
          <RegimenDataModal
            database={UIDatabase}
            requisition={currentValue}
            genericTablePageStyles={{
              searchBarColor: SUSSOL_ORANGE,
              colors: dataTableColors,
              dataTableStyles,
              pageStyles,
            }}
          />
        );
      case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
        return (
          <NewSocktakeBatchModal
            stocktakeItem={currentValue}
            database={UIDatabase}
            genericTablePageStyles={{
              searchBarColor: SUSSOL_ORANGE,
              colors: dataTableColors,
              dataTableStyles,
              pageStyles,
            }}
            onConfirm={onSelect}
          />
        );
      case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM:
        return (
          <NewConfirmModal
            coverScreen
            noCancel
            isOpen={isOpen}
            questionText={`${modalStrings.stocktake_invalid_stock} ${currentValue}`}
            onConfirm={onSelect}
          />
        );
      case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
      case MODAL_KEYS.STOCKTAKE_REASON:
        return (
          <GenericChoiceList
            data={UIDatabase.objects('StocktakeReasons')}
            highlightValue={currentValue.reasonTitle}
            keyToDisplay="title"
            onPress={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalContainer
      fullScreen={fullScreen}
      isVisible={isOpen}
      onClose={onClose}
      title={getModalTitle(modalKey)}
      {...ADDITIONAL_MODAL_PROPS[modalKey]}
    >
      <ModalContent />
    </ModalContainer>
  );
};

/**
 * Only re-render this component when the isOpen prop changes.
 */
const propsAreEqual = ({ isOpen: prevIsOpen }, { isOpen: nextIsOpen }) => prevIsOpen === nextIsOpen;

export const DataTablePageModal = React.memo(DataTablePageModalComponent, propsAreEqual);

DataTablePageModalComponent.defaultProps = {
  fullScreen: false,
  modalKey: '',
  onSelect: null,
  currentValue: '',
  modalObject: null,
};

DataTablePageModalComponent.propTypes = {
  modalObject: PropTypes.object,
  fullScreen: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modalKey: PropTypes.string,
  onSelect: PropTypes.func,
  currentValue: PropTypes.any,
};
