import { configurationApi } from "./api"

export const readConfiguration = () =>
  configurationApi("/configuration").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
