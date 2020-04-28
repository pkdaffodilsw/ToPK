import { videoApi } from "./api"

export const readToken = () =>
  videoApi("/video/security/token").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
