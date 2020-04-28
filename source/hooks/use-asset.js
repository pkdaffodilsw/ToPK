import React from "react"
import { readAsset } from "../api"

export const useAsset = _assetId => {
  const [assetId, setAssetId] = React.useState()
  const [error, setError] = React.useState()
  const [data, setData] = React.useState()

  React.useEffect(() => {
    if (assetId !== _assetId) setAssetId(_assetId)
  }, [_assetId, assetId])

  React.useEffect(() => {
    if (assetId) {
      readAsset({ assetId: assetId })
        .then(setData)
        .catch(setError)
    }
  }, [assetId])

  React.useEffect(() => {
    console.log(data)
  }, [data])

  return {
    error,
    data,
  }
}
