import mimeTypes from "mime-types"

export const prepareFile = picture => {
  const body = new FormData()

  const file = {
    uri: picture.uri,
    type: mimeTypes.lookup(picture.uri),
    name: picture.uri.slice(picture.uri.lastIndexOf("/") + 1),
  }

  body.append("file", file)

  return body
}
