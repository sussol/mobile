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
        onPress={() => {
          props.database.write(() => {
            props.database.create('Setting', {
              id: '122',
              key: 'ServerURL',
              value: 'http://192.168.4.102:8088',
            }, true);
          });
          props.navigateTo('login', 'Log In');
        }}
      />
    </View>
  );
}

FirstUsePage.propTypes = {
  database: React.PropTypes.object.isRequired,
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
