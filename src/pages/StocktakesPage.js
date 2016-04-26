/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
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
  onPress: React.PropTypes.object,
  text: React.PropTypes.Text,
};

export class StocktakesPage extends Component {

  render() {
    return (
      <View>
        <NavButton
          text={'Stock'}
          onPress={
            () => {
              this.props.navigator.push({ id: 'stock' });
            }}
        />
        <NavButton
          text={'Stocktakes'}
          onPress={
            () => {
              this.props.navigator.push({ id: 'stocktakes' });
            }}
        />
        <NavButton
          text={'Orders'}
          onPress={
            () => {
              this.props.navigator.push({ id: 'orders' });
            }}
        />
        <NavButton
          text={'Customer Invoices'}
          onPress={
            () => {
              this.props.navigator.push({ id: 'customerInvoices' });
            }}
        />
      </View>
    );
  }
}

StocktakesPage.propTypes = {
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
