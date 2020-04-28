import { visitApi } from "./api"

export const migrateDb = () =>
  visitApi("/db/migrate", {
    method: "POST",
  }).then(response =>
    response.ok && response.status === 204
      ? response
      : Promise.reject(response),
  )
