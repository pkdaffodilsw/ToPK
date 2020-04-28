import React from "react"
import { Dimensions, ScrollView, StyleSheet } from "react-native"

const { width: windowWidth } = Dimensions.get("window")

export const ActionableScrollView = ({ children, ...props }) => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.inner}
    alwaysBounceVertical={false}
    {...props}
  >
    {children}
  </ScrollView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: windowWidth > 500 ? 500 : undefined,
    minWidth: windowWidth > 500 ? 500 : windowWidth,
  },
  inner: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
})
