import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../widgets';

export default function FirstUsePage(props) {
  return (
    <View style={styles.container}>
      <TextInput placeholder="Primary Server URL" />
      <TextInput placeholder="Sync Site Name" />
      <TextInput placeholder="Sync Site Password" />
      <Button
        text="Connect to mSupply"
        onPress={() => props.navigateTo('login', 'Log In')}
      />
    </View>
  );
}

FirstUsePage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
