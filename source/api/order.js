import { throwError } from "../library"
import { visitApi } from "./api"

export const checkoutOrder = ({
  visitId = throwError("Missing required parameter 'visitId'"),
  orderId,
}) =>
  visitApi(`/order/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visitId,
      ...(orderId ? { orderId } : {}),
    }),
  }).then(response => {
    return response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response)
  })

export const confirmOrder = ({
  orderId = throwError("Missing required parameter 'orderId'"),
}) =>
  visitApi(`/order/confirm?orderId=${orderId}`).then(response => {
    return response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response)
  })
