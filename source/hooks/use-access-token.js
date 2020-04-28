import React from "react"
import { video } from "../api"

export const useAccessToken = () => {
  const [loading, setLoading] = React.useState(false)
  const [current, setCurrent] = React.useState()
  const [error, setError] = React.useState()

  const read = React.useCallback(() => {
    setLoading(true)

    return video
      .readToken()
      .then(({ token }) => {
        setError()
        setCurrent(token)
        setLoading(false)
      })
      .catch(error => {
        setCurrent()
        setError(error)
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    read()
  }, [read])

  return {
    current,
    loading,
    error,
    read,
  }
}
