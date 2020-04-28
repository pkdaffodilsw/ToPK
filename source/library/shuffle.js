export const shuffle = (source = [], shuffled = []) => {
  if (source.length) {
    const randomIndex = Math.floor(Math.random() * source.length)

    const head = source.slice(0, randomIndex)
    const tail = source.slice(randomIndex + 1, source.length)

    return shuffle(head.concat(tail), shuffled.concat(source[randomIndex]))
  } else {
    return shuffled
  }
}
