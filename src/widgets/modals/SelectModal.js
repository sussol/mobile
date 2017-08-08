/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { PageContentModal } from './PageContentModal';
import { AutocompleteSelector } from '../AutocompleteSelector';

export function SelectModal(props) {
  const {
    isOpen,
    onClose,
    onSelect,
    options,
    placeholderText,
    queryString,
    queryStringSecondary,
    sortByString,
    ...modalProps,
  } = props;

  return (
    <PageContentModal
      isOpen={isOpen}
      onClose={onClose}
      {...modalProps}
    >
      <AutocompleteSelector
        options={options}
        placeholderText={placeholderText}
        queryString={queryString}
        queryStringSecondary={queryStringSecondary}
        sortByString={sortByString}
        onSelect={onSelect}
      />
    </PageContentModal>
   );
}

SelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  options: PropTypes.object.isRequired,
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortByString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  onClose: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
};
