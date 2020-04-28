import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, textStyles } from "../library"

export const Radio = ({ title, name = title, onPress, checked }) => (
  <TouchableOpacity
    onPress={() => onPress && onPress({ name, value: checked })}
  >
    <View style={styles.container}>
      <View style={styles.ring}>
        {checked && <View style={styles.check} />}
      </View>
      <Text style={styles.text}>{title}</Text>
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  ring: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary,
  },
  text: {
    ...textStyles.body,
    marginLeft: 8,
  },
})
