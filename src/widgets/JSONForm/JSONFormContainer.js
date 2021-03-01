import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * The Form component from rsjf uses an overrideable container.
 * The base container is more for react/html than RN/android
 * however it is also not required to do anything.
 *
 */
export class JSONFormContainer extends Component {
  render() {
    const { children } = this.props;
    return children;
  }
}

JSONFormContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
