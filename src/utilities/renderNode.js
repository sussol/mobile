/* Taken from https://github.com/react-native-training/react-native-elements
 * since we only need badge component. Tweaked the component class since we do not
 * need extra logic present in the code.
 */

import React from 'react';

const renderNode = (Component, content, defaultProps) => {
  if (content == null || content === false) {
    return null;
  }
  if (React.isValidElement(content)) {
    return content;
  }
  if (typeof content === 'function') {
    return content();
  }
  // Just in case
  if (content === true) {
    return <Component {...defaultProps} />;
  }
  if (typeof content === 'string' || typeof content === 'number') {
    return <Component {...defaultProps}>{content}</Component>;
  }
  return <Component {...defaultProps} {...content} />;
};

// eslint-disable-next-line import/prefer-default-export
export { renderNode };
