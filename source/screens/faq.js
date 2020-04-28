import React from "react"
import { StyleSheet, View } from "react-native"
import { Title } from "../components"

export const FAQ = () => (
  <View style={styles.container}>
    <Title>Frågor & Svar</Title>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
