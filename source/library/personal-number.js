export const formatPersonalNumber = input => {
  let out = ""

  if (input.length < 7) {
    out = input
      .split("")
      .filter(c => /\d/.test(c))
      .join("")
  } else if (input.length === 7) {
    const head = input
      .slice(0, 6)
      .split("")
      .filter(c => /\d/.test(c))
      .join("")

    const tail = input
      .slice(-1)
      .split("")
      .filter(c => /\d|\+|-/.test(c))
      .join("")

    out = head + tail
  } else {
    const [head, divider, tail] = input
      .split("")
      .filter(c => /\d|\+|-/.test(c))
      .join("")
      .split(/(\+|-)/)

    if (divider) {
      out =
        head
          .split("")
          .filter(c => /\d/.test(c))
          .join("")
          .slice(0, 8) +
        divider +
        tail
          .split("")
          .filter(c => /\d/.test(c))
          .join("")
          .slice(0, 4)
    } else {
      out = (head + tail)
        .split("")
        .filter(c => /\d/.test(c))
        .join("")
        .slice(0, 12)
    }
  }

  return out
}
