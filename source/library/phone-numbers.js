import {
  AsYouType,
  isSupportedCountry,
  parsePhoneNumberFromString,
} from "libphonenumber-js"

export const validatePhoneNumber = (phoneNumber, locale) => {
  try {
    return parsePhoneNumberFromString(phoneNumber, locale).isValid()
  } catch (error) {
    return false
  }
}

export const formatPhoneNumber = (input, locale) =>
  new AsYouType(
    isSupportedCountry(locale.toUpperCase()) ? locale.toUpperCase() : undefined,
  ).input(input)
