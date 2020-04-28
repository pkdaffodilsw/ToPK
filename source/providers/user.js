import React from "react"
import { readUser, updateUser, createUser } from "../api"
import { facebookAppEvents, firebaseAnalytics } from "../library"

export const Context = React.createContext()

export const Provider = props => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()
  const [data, setData] = React.useState()

  const create = user => {
    setLoading(true)

    return createUser(user)
      .then(user => {
        facebookAppEvents.completedRegistration()
        firebaseAnalytics.logSignUp()

        setError()
        setData(user)
        setLoading(false)

        return user
      })
      .catch(error => {
        setError(error)
        setLoading(false)

        return Promise.reject(error)
      })
  }

  const read = () => {
    setLoading(true)

    return readUser()
      .then(user => {
        setError()
        setData(user)
        setLoading(false)

        return user
      })
      .catch(error => {
        setError(error)
        setLoading(false)

        return Promise.reject(error)
      })
  }

  const update = data => {
    setLoading(true)

    return updateUser(data)
      .then(user => {
        setError()
        setData(user)
        setLoading(false)

        return user
      })
      .catch(error => {
        setError(error)
        setLoading(false)

        return Promise.reject(error)
      })
  }

  return (
    <Context.Provider
      value={{ data, loading, error, update, read, create }}
      {...props}
    />
  )
}
