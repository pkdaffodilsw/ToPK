const refParser = require("json-schema-ref-parser")
const createSchemaContainer = require("./create-schema-container")
const schema = require("./question-tree.json")

refParser.dereference(schema).then(dereferencedSchema => {
  let state = {}

  const container = createSchemaContainer(dereferencedSchema, {
    setState: nextState => {
      state = nextState
    },
    getState: () => state,
  })

  container.items[1].next().items[0].onChange()

  container.items[1]
    .next()
    .next()
    .items[0].set()

  container.items[1]
    .next()
    .next()
    .next()
    .next()
    .set("2019-11-11T11:31:56.928Z")

  container.items[1]
    .next()
    .next()
    .next()
    .next()
    .next()
    .next()
    .next()
    .items[0].set()

  console.log(
    container.items[1]
      .next()
      .next()
      .next()
      .next()
      .next()
      .next()
      .next()
      .next()
      .items[0].set(),
  )

  console.log(state)
})
