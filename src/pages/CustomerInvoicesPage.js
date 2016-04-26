/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

function NavButton(props) {
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor="#B5B5B5"
      onPress={props.onPress}
    >
      <Text style={styles.buttonText}>{props.text}</Text>
    </TouchableHighlight>
  );
}

NavButton.propTypes = {
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
};

export function CustomerInvoicesPage(props) {
  return (
    <View style={styles.container}>
      <NavButton
        text="Stock"
        onPress={
          () => {
            props.navigator.push({ id: 'stock' });
          }}
      />
      <NavButton
        text="Stocktakes"
        onPress={
          () => {
            props.navigator.push({ id: 'stocktakes' });
          }}
      />
      <NavButton
        text="Orders"
        onPress={
          () => {
            props.navigator.push({ id: 'orders' });
          }}
      />
      <NavButton
        text="Customer Invoices"
        onPress={
          () => {
            props.navigator.push({ id: 'customerInvoices' });
          }}
      />
    </View>
  );
}

CustomerInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigator: React.PropTypes.object,
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
