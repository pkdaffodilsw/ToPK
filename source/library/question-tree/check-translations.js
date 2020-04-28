const questionTree = require("./question-tree.json")
const translations = Object.keys(
  require("./question-tree.translations.sv.json"),
)

const possibleTranslation = value => {
  if (typeof value === "string" && /_/g.test(value) && !/^#/.test(value)) {
    return value
  }
}

const includesTranslation = value => {
  if (
    !translations.includes(value) &&
    !translations.includes(value + "_title")
  ) {
    console.log("Missing translation for:", value)
  }
}

const traverse = branch => {
  Object.values(branch).forEach(value => {
    const str = possibleTranslation(value)
    str && includesTranslation(str)

    if (Array.isArray(value)) {
      value.forEach(value => {
        const str = possibleTranslation(value)
        if (str) {
          includesTranslation(value)
        } else {
          traverse(value)
        }
      })
    }

    if (typeof value === "object") {
      traverse(value)
    }
  })
}

traverse(questionTree)
