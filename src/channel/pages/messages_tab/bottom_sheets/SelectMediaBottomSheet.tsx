import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
export const SelectMediaBottomSheet: React.FC = () => {
  const styles = useStyles(colors => ({
    container: {
      padding: 24,
      backgroundColor: '#2A2A2A',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      alignItems: 'center',
      justifyContent: 'center'
    },
    text: {
      color: colors.text,
      fontSize: 16,
      marginBottom: 16
    },
    btn: {
      padding: 16,
      backgroundColor: 'rgba(250, 205, 17, 0.2)',
      borderRadius: 12
    },
    btnText: {
      color: '#FACD11',
      // colors.primary
      fontWeight: 'bold'
    }
  }));
  return <View style={styles.container}>
      <Text style={styles.text}>SelectMediaBottomSheet Placeholder</Text>
      <TouchableOpacity activeOpacity={1} style={styles.btn}>
        <Text style={styles.btnText}>Open Image Picker</Text>
      </TouchableOpacity>
    </View>;
};