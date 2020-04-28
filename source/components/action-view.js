import React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native"

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  keyboardAvoidingViewContentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
})

export const ActionView = ({
  keyboardAvoidingViewProps: {
    style: keyboardAvoidingViewStyle,
    contentContainerStyle: keyboardAvoidingViewContentContainerStyle,
    ...keyboardAvoidingViewProps
  } = {},
  scrollViewProps: {
    style: scrollViewStyle,
    contentContainerStyle: scrollViewContentContainerStyle,
    ...scrollViewProps
  } = {},
  children,
}) => (
  <KeyboardAvoidingView
    style={[styles.keyboardAvoidingView, keyboardAvoidingViewStyle]}
    behavior={Platform.OS === "ios" ? "padding" : null}
    contentContainerStyle={[
      styles.keyboardAvoidingViewContentContainer,
      keyboardAvoidingViewContentContainerStyle,
    ]}
    {...keyboardAvoidingViewProps}
  >
    <ScrollView
      style={[styles.scrollView, scrollViewStyle]}
      contentContainerStyle={[
        styles.scrollViewContentContainer,
        scrollViewContentContainerStyle,
      ]}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
)
