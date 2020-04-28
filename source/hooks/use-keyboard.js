import React from "react"
import { Keyboard, Platform } from "react-native"

const keyboardEvents = Platform.select({
  ios: { show: "keyboardWillShow", hide: "keyboardWillHide" },
  android: { show: "keyboardDidShow", hide: "keyboardDidHide" },
})

export const useKeyboard = () => {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const showListener = () => {
      !visible && setVisible(true)
    }

    const hideListener = () => {
      visible && setVisible(false)
    }

    Keyboard.addListener(keyboardEvents.show, showListener)
    Keyboard.addListener(keyboardEvents.hide, hideListener)

    return () => {
      Keyboard.removeListener(keyboardEvents.show, showListener)
      Keyboard.removeListener(keyboardEvents.hide, hideListener)
    }
  }, [visible])

  return { visible, dismiss: Keyboard.dismiss }
}
