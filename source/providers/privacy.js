import React from "react"
import { Platform, View } from "react-native"
import { Splash } from "../components"
import { appState } from "../library"

const usePrivacy = () => {
  const [toggled, setToggled] = React.useState(false)
  const [delayedToggled, setDelayedToggled] = React.useState(false)

  React.useEffect(() => {
    return appState.onActive(() => setToggled(false))
  }, [toggled])

  React.useEffect(() => {
    return appState.onBackground(() => setToggled(true))
  }, [toggled])

  React.useEffect(() => {
    return Platform.OS === "ios"
      ? appState.onInActive(() => setToggled(true))
      : undefined
  }, [toggled])

  const timeout = React.useRef()

  React.useEffect(() => {
    let targetValue = toggled

    if (targetValue && targetValue !== delayedToggled) {
      if (!timeout.current) {
        timeout.current = setTimeout(() => {
          setDelayedToggled(targetValue)
          timeout.current = undefined
        }, 500)
      }
    } else {
      if (timeout.current) {
        clearTimeout(timeout.current)
        timeout.current = undefined
      }

      setDelayedToggled(targetValue)
    }

    return () => {
      timeout.current && clearTimeout(timeout.current)
      setDelayedToggled(targetValue)
    }
  }, [delayedToggled, toggled])

  return delayedToggled
}

export const Context = React.createContext()

export const Provider = props => {
  const toggled = usePrivacy()

  return (
    <View style={{ flex: 1 }}>
      <Context.Provider {...props} />
      {toggled && <Splash />}
    </View>
  )
}
