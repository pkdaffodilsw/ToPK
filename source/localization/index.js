import { findBestAvailableLanguage } from "react-native-localize"

export const locales = {
  en: require("./en.json"),
  sv: require("./sv.json"),
}

const defaultLanguageTag = "en"

export const getPreferredLanguageTag = (
  availableLocales = Object.keys(locales),
) => {
  const { languageTag } = findBestAvailableLanguage(availableLocales) || {}

  return languageTag || defaultLanguageTag
}
