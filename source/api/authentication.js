import { throwError } from "../library"
import { authApi } from "./api"

export const collect = (
  orderRef = throwError("Missing required argument 'orderRef'"),
) =>
  authApi(`/authentication/bankid/collect?orderRef=${orderRef}`, {
    method: "POST",
  }).then(response =>
    response.status === 200 ? response.json() : Promise.reject(response),
  )

export const authenticate = personalNumber =>
  authApi("/authentication/bankid/authenticate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(personalNumber ? { personalNumber } : {}),
  }).then(response =>
    response.status === 200 ? response.json() : Promise.reject(response),
  )
