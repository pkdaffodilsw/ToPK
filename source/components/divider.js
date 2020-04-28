import React from "react"
import { StyleSheet, View } from "react-native"
import { colors } from "../library"

export const Divider = () => <View style={styles.divider} />

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray400,
  },
})
