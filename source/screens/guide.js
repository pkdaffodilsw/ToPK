import React from "react"
import { StyleSheet, View } from "react-native"
import { Title } from "../components"

export const Guide = () => (
  <View style={styles.container}>
    <Title>Så funkar det</Title>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
