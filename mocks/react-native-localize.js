jest.mock("react-native-localize", () => {
  const getLocales = () => [
    // you can choose / add the locales you want
    {
      countryCode: "US",
      languageTag: "en-US",
      languageCode: "en",
      isRTL: false,
    },
    {
      countryCode: "GB",
      languageTag: "en-GB",
      languageCode: "en",
      isRTL: false,
    },
    {
      countryCode: "SE",
      languageTag: "sv-SE",
      languageCode: "sv",
      isRTL: false,
    },
  ]

  // use a provided translation, or return undefined to test your fallback
  const findBestAvailableLanguage = () => ({
    languageTag: "sv-SE",
    isRTL: false,
  })

  const getNumberFormatSettings = () => ({
    decimalSeparator: ",",
    groupingSeparator: ".",
  })

  const getCalendar = () => "gregorian" // or "japanese", "buddhist"
  const getCountry = () => "SE" // the country code you want
  const getCurrencies = () => ["SEK", "EUR"] // can be empty array
  const getTemperatureUnit = () => "celsius" // or "fahrenheit"
  const getTimeZone = () => "Europe/Stockholm" // the timezone you want
  const uses24HourClock = () => true
  const usesMetricSystem = () => true

  const addEventListener = jest.fn()
  const removeEventListener = jest.fn()

  return {
    findBestAvailableLanguage,
    getLocales,
    getNumberFormatSettings,
    getCalendar,
    getCountry,
    getCurrencies,
    getTemperatureUnit,
    getTimeZone,
    uses24HourClock,
    usesMetricSystem,
    addEventListener,
    removeEventListener,
  }
})
