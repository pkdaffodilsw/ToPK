import React from "react"
import {
  HeaderBackTitle,
  HeaderTitle,
  Legal as LegalPresentation,
} from "../components"
import { Localization } from "../providers"

export const Legal = () => {
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  return (
    <>
      <HeaderTitle>{strings.legal.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <LegalPresentation>{strings.legal.content}</LegalPresentation>
    </>
  )
}
