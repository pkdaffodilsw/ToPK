import React from "react"
import { withNavigation } from "react-navigation"

export const HeaderBackTitle = withNavigation(({ navigation, children }) => {
  React.useEffect(() => {
    if (navigation.getParam("headerBackTitle") !== children) {
      navigation.setParams({ headerBackTitle: children })
    }
  }, [navigation, children])

  return null
})
