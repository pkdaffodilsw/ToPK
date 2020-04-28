import React from "react"
import { Localization } from "../providers"

export const useLocalization = () => {
  const localization = React.useContext(Localization.Context)

  return localization
}
