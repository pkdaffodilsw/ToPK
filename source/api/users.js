import { throwError } from "../library"
import { visitApi } from "./api"

export const readUser = () =>
  visitApi("/users/me").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const createUser = ({
  phoneNumber = throwError("phoneNumber is required"),
  email = throwError("email is required"),
}) =>
  visitApi("/users/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber.length ? phoneNumber : null,
      email: email.length ? email : null,
    }),
  }).then(response =>
    response.ok && response.status === 201
      ? response.json()
      : Promise.reject(response),
  )

export const updateUser = ({ phoneNumber, email }) =>
  visitApi("/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, email }),
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const readUserVisits = () =>
  visitApi("/users/me/visits").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
