import React from "react"
import { ScrollView } from "react-native"
import { Content, Markdown } from "../components"
import { colors, fonts, textStyles } from "../library"

export const Legal = ({ children }) => (
  <ScrollView>
    <Content
      style={{
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
      }}
    >
      <Markdown
        style={{
          heading1: {
            ...textStyles.title,
            marginBottom: Math.floor(textStyles.title.lineHeight / 2),
          },
          heading2: {
            ...textStyles.headline,
            fontFamily: fonts.openSans.semiBold,
            marginBottom: Math.floor(textStyles.headline.lineHeight / 2),
          },
          paragraph: {
            ...textStyles.body,
            marginBottom: textStyles.body.lineHeight,
          },
          strong: {
            fontFamily: fonts.openSans.semiBold,
          },
          link: {
            ...textStyles.body,
            color: colors.secondary,
          },
        }}
      >
        {children}
      </Markdown>
    </Content>
  </ScrollView>
)
