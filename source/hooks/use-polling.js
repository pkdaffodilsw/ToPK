import React from "react"

export const usePolling = (callback, interval) => {
  const savedCallback = React.useRef(callback)
  const abort = React.useRef(() => {})

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    let timeoutHandle
    let mounted = true

    const clearCurrentTimeout = () => {
      timeoutHandle && clearTimeout(timeoutHandle)
      abort.current = () => {}
    }

    abort.current = clearCurrentTimeout

    const poll = () => {
      const resume = () => {
        timeoutHandle = setTimeout(poll, interval)
      }

      mounted && savedCallback.current(resume)
    }

    if (interval !== null) {
      poll()
    }

    return () => {
      mounted = false
      clearCurrentTimeout()
    }
  }, [interval])

  return abort.current
}
