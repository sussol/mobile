import React from 'react';

/**
 * Makes sure the onPress prop (which should be a function) of the wrapped
 * component is only called once.
 * @param {React.Component} WrappedComponent The component to be wrapped
 * @returns {React.Component} The wrapped component
 */
export default function withOnePress(WrappedComponent) {
  return class extends React.Component {
    state = { hasBeenPressed: false };

    static propTypes = WrappedComponent.propTypes;

    onPress = (...args) => {
      const { hasBeenPressed } = this.state;
      const { onPress } = this.props;

      if (hasBeenPressed || !onPress) return;
      this.setState({ hasBeenPressed: true }, () => {
        onPress(...args);
      });
    };

    render() {
      return <WrappedComponent {...this.props} onPress={this.onPress} />;
    }
  };
}
