/* eslint-disable arrow-body-style */
import React from 'react';
import { StyleSheet } from 'react-native';

import { IconButton } from './IconButton';
import { DownloadIcon } from './icons';
import { BLACK } from '../globalStyles/index';
import { PaperModalContainer } from './PaperModal/PaperModalContainer';
import { PaperInputModal } from './PaperModal/PaperInputModal';
import { useToggle } from '../hooks/useToggle';

const EMAIL_REGEXP = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);

export const ExportTemperatureDataButton = () => {
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <IconButton
        onPress={toggleOpen}
        Icon={<DownloadIcon color={BLACK} />}
        containerStyle={localStyles.iconButton}
      />
      <PaperModalContainer isVisible={isOpen} onClose={toggleOpen}>
        <PaperInputModal
          content="A CSV File will be sent to this email address"
          Icon={<DownloadIcon size={40} />}
          buttonText="Download"
          placeholder="Email"
          onButtonPress={toggleOpen}
          validator={input => EMAIL_REGEXP.test(input)}
        />
      </PaperModalContainer>
    </>
  );
};

const localStyles = StyleSheet.create({
  iconButton: {
    flexBasis: 50,
    justifyContent: 'center',
  },
});
