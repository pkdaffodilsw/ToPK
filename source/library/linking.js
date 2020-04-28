import { Linking as RNLinking } from "react-native"
import { analytics } from "."

const errorHandler = error => {
  analytics.trackEvent("linkingError", error)
  return Promise.reject(error)
}

export const Linking = {
  openURL: (...args) => RNLinking.openURL(...args).catch(errorHandler),
  canOpenURL: (...args) => RNLinking.canOpenURL(...args).catch(errorHandler),
}
