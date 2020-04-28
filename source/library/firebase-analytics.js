import firebase from "react-native-firebase"

const analytics = firebase.analytics()

export const logSignUp = () => analytics.logEvent("sign_up")

export const logPurchase = (parameters = { currency: null, value: null }) => {
  const args = [
    "ecommerce_purchase",
    ...(Object.prototype.hasOwnProperty.call(parameters, "currency") &&
    Object.prototype.hasOwnProperty.call(parameters, "value")
      ? [parameters]
      : []),
  ]

  return analytics.logEvent(...args)
}
