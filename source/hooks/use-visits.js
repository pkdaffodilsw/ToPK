import React from "react"
import { Visits } from "../providers"

export const useVisits = () => {
  const visits = React.useContext(Visits.Context)

  return visits
}
