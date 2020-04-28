import { Platform } from "react-native"
import { getUniqueId } from "react-native-device-info"
import { throwError } from "../library"
import { getPreferredLanguageTag } from "../localization"
import { visitApi } from "./api"

const platform = Platform.select({
  ios: "Apn",
  android: "Fcm",
})

export const register = (
  { deviceToken = throwError("Missing push token") } = throwError(
    "Missing options object",
  ),
) =>
  getUniqueId()
    .then(deviceId =>
      visitApi("/notifications/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          platform,
          token: deviceToken,
          locale: getPreferredLanguageTag(),
        }),
      }),
    )
    .then(response =>
      response.ok && response.status === 204
        ? Promise.resolve(response)
        : Promise.reject(response),
    )
