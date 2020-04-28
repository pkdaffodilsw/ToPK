import { visitApi } from "./api"
import { throwError } from "../library"

export const readAsset = ({
  assetId = throwError("Missing parameter 'assetId'"),
} = {}) =>
  visitApi(`/assets/${assetId}`, {
    method: "GET",
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
