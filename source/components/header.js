import React from "react"
import { StyleSheet, View } from "react-native"
import { Body, Title } from "./text"

export const Header = ({ title, description, style }) => (
  <View style={style}>
    {title && <Title>{title}</Title>}
    {description && <Body style={styles.description}>{description}</Body>}
  </View>
)

const styles = StyleSheet.create({
  description: {
    paddingTop: 15,
  },
})
