/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

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
  isOpen: React.PropTypes.bool.isRequired,
  options: React.PropTypes.object.isRequired,
  queryString: React.PropTypes.string.isRequired,
  queryStringSecondary: React.PropTypes.string,
  sortByString: React.PropTypes.string.isRequired,
  placeholderText: React.PropTypes.string,
  onClose: React.PropTypes.func,
  onSelect: React.PropTypes.func.isRequired,
};
