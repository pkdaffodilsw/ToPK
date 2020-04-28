import React from "react"
import { NavigationActions, StackActions } from "react-navigation"
import { Localization } from "../providers"
import { HeaderButton } from "./header-button"
import { Alert } from "react-native"

export const Abort = ({ navigation, routeName }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const disabled = navigation.getParam("abortDisabled")

  return !disabled ? (
    <HeaderButton
      title={strings.common.abort}
      onPress={() => {
        Alert.alert(strings.common.abort, strings.questionTree.abortMessage, [
          {
            text: strings.common.no,
          },
          {
            text: strings.common.yes,
            onPress: () => {
              navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName })],
                }),
              )
            },
            style: "destructive",
          },
        ])
      }}
    />
  ) : null
}
