import React from "react"
import DeviceInfo from "react-native-device-info"
import isEqual from "lodash.isequal"

const getDeviceInfo = name =>
  (
    DeviceInfo[`get${name.replace(/^./, match => match.toUpperCase())}`] ||
    DeviceInfo[name]
  )().then(result => ({
    [name]: result,
  }))

export const useDeviceInfo = (...args) => {
  const [info, setInfo] = React.useState([])

  const [deviceInfo, setDeviceInfo] = React.useState(
    info.reduce((merged, name) => {
      Object.assign(merged, { [name]: undefined })
      return merged
    }, {}),
  )

  React.useEffect(() => {
    if (!isEqual(args, info)) {
      setInfo(args)
    }
  }, [args, info])

  React.useEffect(() => {
    Promise.all(info.map(name => getDeviceInfo(name)))
      .then(deviceInfo => {
        setDeviceInfo(
          deviceInfo.reduce((merged, info) => {
            Object.assign(merged, info)
            return merged
          }, {}),
        )
      })
      .catch(error => {
        throw new Error(error)
      })
  }, [info])

  return deviceInfo
}
