import React, {
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  expansion: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default function RowView(props) {
  return (
    <View style={styles.expansion}>
      {props.children}
    </View>
  );
}
RowView.propTypes = {
  children: React.PropTypes.any,
};
