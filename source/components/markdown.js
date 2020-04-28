import React from "react"
import RNMarkdownDisplay from "react-native-markdown-display"
import { Linking } from "../library"

export const Markdown = props => (
  <RNMarkdownDisplay
    onLinkPress={url => {
      if (url) {
        Linking.openURL(url)
      }

      return false
    }}
    {...props}
  />
)
