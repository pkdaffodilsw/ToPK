import Analytics from "appcenter-analytics"

export const trackEvent = (eventName, parameters) => {
  const eventParameters =
    Object.prototype.toString.call(parameters) === Object.prototype.toString()
      ? Object.keys(parameters).reduce((data, property) => {
          if (typeof parameters[property] !== "object") {
            Object.assign(data, { [property]: parameters[property] })
          } else {
            try {
              const value = JSON.stringify(parameters[property])
              Object.assign(data, { [property]: value })
            } catch (error) {
              console.log(error)
            }
          }

          return data
        }, {})
      : typeof parameters === "object"
      ? Object.getOwnPropertyNames(parameters).reduce((data, property) => {
          if (typeof parameters[property] !== "object") {
            Object.assign(data, { [property]: parameters[property] })
          } else {
            try {
              const value = JSON.stringify(parameters[property])
              Object.assign(data, { [property]: value })
            } catch (error) {
              console.log(error)
            }
          }

          return data
        }, {})
      : parameters.toString
      ? { toString: parameters.toString() }
      : undefined

  if (parameters && eventParameters === undefined) {
    console.log("Could not interpret parameters", parameters)
  }

  return Analytics.trackEvent(eventName, eventParameters)
}
