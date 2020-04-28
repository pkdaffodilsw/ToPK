import React from "react"
import { StatusBar } from "react-native"

export const useHiddenStatusBar = () => {
  React.useEffect(() => {
    StatusBar.setHidden(true)

    return () => StatusBar.setHidden(false)
  }, [])
}
