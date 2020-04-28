import { throwError } from "../library"
import { visitApi } from "./api"

export const createIntent = (
  { visitId = throwError("Missing visitId"), idempotencyKey } = throwError(
    "Missing options",
  ),
) =>
  visitApi("/payments/intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visitId, idempotencyKey }),
  }).then(response =>
    response.ok && response.status === 201
      ? response.json()
      : Promise.reject(response),
  )

export const swish = {
  initialize: (
    { visitId = throwError("Missing visitId") } = throwError("Missing options"),
  ) =>
    visitApi("/payments/mcommerce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visitId }),
    }).then(response =>
      response.ok && response.status === 201
        ? response.json()
        : Promise.reject(response),
    ),
  verify: (
    { paymentRequestId = throwError("Missing paymentRequestId") } = throwError(
      "Missing options",
    ),
  ) =>
    visitApi(`/payments/mcommerce/?id=${paymentRequestId}`, {
      method: "GET",
    }).then(response =>
      response.ok && response.status === 200
        ? response.json()
        : Promise.reject(response),
    ),
}

export const price = ({ visitId }) =>
  visitApi(`/payments/price?visitId=${visitId}`, {
    method: "GET",
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const confirmFreeVisit = ({ visitId }) =>
  visitApi("/payments/free", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visitId }),
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
