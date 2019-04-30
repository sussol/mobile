import React from 'react';

/**
 * Ensures the onPress function prop of the wrapped component is only called
 * once.
 *
 * @param   {React.Component}  WrappedComponent  The component to be wrapped.
 * @return  {React.Component}                    The wrapped component.
 */
export const withOnePress = WrappedComponent =>
  class extends React.Component {
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

export default withOnePress;
