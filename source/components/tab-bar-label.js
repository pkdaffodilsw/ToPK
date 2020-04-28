import React from "react"
import { StyleSheet, Text } from "react-native"
import { fonts } from "../library"
import { Localization } from "../providers"

export const TabBarLabel = ({ route, tintColor, ...props }) => {
  const strings = React.useContext(Localization.Context).getStrings()

  return (
    <Text
      style={[
        styles.text,
        {
          color: tintColor,
        },
      ]}
      {...props}
    >
      {strings.bottomTabNavigator[route.routeName.toLowerCase()]}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    backgroundColor: "transparent",
    fontSize: 11,
    fontFamily: fonts.openSans.regular,
  },
})
