import React from "react"
import { localization } from "../api"

export const useLocales = () => {
  const [data, setData] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setLoading(true)

    localization
      .readLocales()
      .then(data => {
        // [{
        //   id: "en",
        //   localeName: "en",
        //   statistics: {
        //     notifications: "2019-11-25T10:45:02Z",
        //     question_tree: "2019-11-25T10:45:02Z"
        //   }
        // }]
        setData(
          data.reduce((data, { localeName, ...localeData }) => {
            Object.assign(data, { [localeName]: localeData })
            return data
          }, {}),
        )

        setError(null)
        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
