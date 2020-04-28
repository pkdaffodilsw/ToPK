import { addDays, isPast, isWithinInterval, parse, subMinutes } from "date-fns"
import React from "react"
import { readConfiguration } from "../api"

export const Context = React.createContext()

export const Provider = props => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [booking, setBooking] = React.useState({
    isAvailable: false,
    closingSoon: false,
    closeTime: null,
    nextOpen: null,
  })

  const read = () => {
    setLoading(true)

    return readConfiguration()
      .then(data => {
        const { allowQueuingBeforeClosingMinutes } = data.visit
        const now = Date.now()
        const day = new Date(now).getDay()

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
        const currentWeekDay = day === 0 ? 7 : day

        const currentDate = new Date(now).toISOString().slice(0, 10)

        const { openTime, closeTime } =
          data.visit.businessHours.exceptionDays.find(
            ({ date }) => date === currentDate,
          ) ||
          data.visit.businessHours.days.find(
            ({ weekday }) => weekday === currentWeekDay,
          ) ||
          {}

        const isAvailable =
          openTime && closeTime
            ? isWithinInterval(new Date(now), {
                start: parse(openTime, "HH:mm", new Date()),
                end: parse(closeTime, "HH:mm", new Date()),
              })
            : false

        const closingSoon =
          isAvailable &&
          isPast(
            subMinutes(
              parse(closeTime, "HH:mm", new Date()),
              allowQueuingBeforeClosingMinutes,
            ),
          )

        const sortedByWeekday = data.visit.businessHours.days.sort((a, b) =>
          a.weekday < b.weekday ? -1 : 1,
        )

        const currentWeekDayIndex = sortedByWeekday.findIndex(
          ({ weekday }) => weekday === currentWeekDay,
        )

        const nextOpen = sortedByWeekday
          .slice(currentWeekDayIndex + 1)
          .concat(sortedByWeekday.slice(0, currentWeekDayIndex))
          .map(({ openTime }, index) => {
            const distanceInDays = index + 1

            return addDays(
              parse(
                currentDate + " " + openTime,
                "yyyy-MM-dd HH:mm",
                new Date(),
              ),
              distanceInDays,
            )
          })
          .filter(nextPossibleDate => {
            const yyyyMMdd = nextPossibleDate.toISOString().slice(0, 10)

            return (
              data.visit.businessHours.exceptionDays.find(
                ({ date }) => yyyyMMdd === date,
              ) === undefined
            )
          })
          .slice(0, 1)
          .pop()

        setBooking({ isAvailable, closeTime, closingSoon, nextOpen })
        setData(data)
        setLoading(false)

        return data
      })
      .catch(error => {
        setError(error)
        setLoading(false)

        return Promise.reject(error)
      })
  }

  return (
    <Context.Provider
      value={{ data, loading, error, read, booking }}
      {...props}
    />
  )
}
