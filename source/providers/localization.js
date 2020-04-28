import { format, formatDistance, formatDistanceToNow } from "date-fns"
import { en, sv } from "date-fns/locale"
import { call, compile } from "gullwing"
import merge from "lodash.merge"
import React from "react"
import * as RNLocalize from "react-native-localize"
import { useLocales, useResources } from "../hooks"
import {
  getPreferredLanguageTag,
  locales as includedLocales,
} from "../localization"
import set from "lodash.setwith"

const dateFnsLocales = {
  en,
  sv,
}

const transformers = {
  select: (common = {}) => (options = {}) => {
    const variables = Object.assign({}, common, options)
    return value => variables[value]
  },
  capitalize: () => () => value => value.replace(/^./, m => m.toUpperCase()),
}

const getMessages = (locales, languageTag) =>
  compile(merge({}, locales.en, locales[languageTag]), transformers)

const useLocalization = () => {
  const { data: remoteLocales } = useLocales()

  const getPreferredLanguageTagMemoized = React.useCallback(() => {
    const allLocales = [
      ...new Set([
        ...Object.keys(remoteLocales),
        ...Object.keys(includedLocales),
      ]),
    ]

    return getPreferredLanguageTag(allLocales)
  }, [remoteLocales])

  const [country, setCountry] = React.useState(RNLocalize.getCountry())

  const [languageTag, setLanguageTag] = React.useState(
    getPreferredLanguageTagMemoized(),
  )

  const {
    app: { resources: { json: appResourceJson } = { json: "{}" } },
    health_declaration: { resources: healthDeclarationResources = {} },
    question_tree: { resources: questionTreeResources },
  } = useResources(
    {
      locale: languageTag,
      remoteLocales,
    },
    "app",
    "health_declaration",
    "question_tree",
  )

  const getMessagesMemoized = React.useCallback(
    () =>
      getMessages(
        merge(
          includedLocales,
          { [languageTag]: JSON.parse(appResourceJson) },
          {
            [languageTag]: Object.entries(healthDeclarationResources).reduce(
              (tree, [key, value]) => {
                set(tree, key, value, Object)

                return tree
              },
              {},
            ),
          },
        ),
        languageTag,
      ),
    [appResourceJson, healthDeclarationResources, languageTag],
  )

  const [messages, setMessages] = React.useState(getMessagesMemoized())

  React.useEffect(() => {
    if (languageTag) {
      setMessages(getMessagesMemoized())
    }
  }, [getMessagesMemoized, languageTag])

  React.useEffect(() => {
    if (remoteLocales) {
      const nextLanguageTag = getPreferredLanguageTagMemoized()

      if (languageTag !== nextLanguageTag) {
        setLanguageTag(nextLanguageTag)
      } else {
        setMessages(getMessagesMemoized())
      }
    }
  }, [
    getMessagesMemoized,
    getPreferredLanguageTagMemoized,
    languageTag,
    remoteLocales,
  ])

  React.useEffect(() => {
    const listener = () => {
      const nextLanguageTag = getPreferredLanguageTagMemoized()

      if (languageTag !== nextLanguageTag) {
        setLanguageTag(nextLanguageTag)
      }

      const nextCountry = RNLocalize.getCountry()

      if (country !== nextCountry) {
        setCountry(nextCountry)
      }
    }

    RNLocalize.addEventListener("change", listener)

    return () => RNLocalize.removeEventListener("change", listener)
  }, [country, getPreferredLanguageTagMemoized, languageTag])

  return {
    getStrings: (parameters = {}) => call(messages, parameters),
    format: (date, pattern) =>
      format(date, pattern, { locale: dateFnsLocales[languageTag] }),
    formatDistance: (date, baseDate) =>
      formatDistance(date, baseDate, { locale: dateFnsLocales[languageTag] }),
    formatDistanceToNow: date =>
      formatDistanceToNow(date, { locale: dateFnsLocales[languageTag] }),
    formatCurrency: ({ price, currency }) => {
      const locales = RNLocalize.getLocales()
      const languageTag = locales[0].languageTag

      const formatter = new Intl.NumberFormat(languageTag, {
        style: "currency",
        currency: currency,
      })

      return formatter.format(price)
    },
    messages,
    country,
    languageTag,
    questionTreeResources,
  }
}

export const Context = React.createContext()

export const Provider = props => {
  const localization = useLocalization()

  return <Context.Provider value={localization} {...props} />
}
