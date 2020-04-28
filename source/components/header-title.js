import React from "react"
import { withNavigation } from "react-navigation"

export const HeaderTitle = withNavigation(({ navigation, children }) => {
  React.useEffect(() => {
    if (navigation.getParam("headerTitle") !== children) {
      navigation.setParams({ headerTitle: children })
    }
  }, [navigation, children])

  return null
})
