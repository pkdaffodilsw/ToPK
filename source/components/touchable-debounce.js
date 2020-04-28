import React from "react"
import { TouchableOpacity as RNTouchableOpacity } from "react-native"
import debounce from "lodash.debounce"

export const TouchableOpacity = ({ onPress, debounceWait = 500, ...props }) => {
  const _onPress = React.useCallback(
    debounce(onPress, debounceWait, { leading: true }),
    [],
  )

  return <RNTouchableOpacity onPress={_onPress} {...props} />
}
