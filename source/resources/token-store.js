import jwtDecode from "jwt-decode"
import { MED_SESSION_TIME } from "../constants"
import { createStorage } from "../library"

const storage = createStorage("med.apiToken")

const checkExpirationTime = token =>
  new Promise((resolve, reject) => {
    if (!token) {
      return resolve(null)
    }

    let tokenExpirationTime

    try {
      tokenExpirationTime = jwtDecode(token).exp
    } catch (error) {
      return resolve(null)
    }

    const currentTime = Math.ceil(Date.now() / 1000)

    if (currentTime < tokenExpirationTime - MED_SESSION_TIME) {
      return resolve(token)
    } else {
      return reject(new Error("Token has expired"))
    }
  })

export const tokenStore = {
  read: () => storage.read().then(checkExpirationTime),
  update: token => checkExpirationTime(token).then(storage.update),
  delete: storage.delete,
}
