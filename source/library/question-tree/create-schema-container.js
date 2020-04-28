import get from "lodash.get"
import merge from "lodash.merge"
import set from "lodash.set"
import unset from "lodash.unset"

// Implemented identifiers
// const {
//   oneOf,
//   allOf,
//   if: _if,
//   then,
//   type,
//   properties,
//   title,
//   description,
//   enum: _enum,
//   items,
//   app_imageAsset,
//   app_uiControl,
//   app_warningMessage,
//   required,
//   format,
// } = schema

const getStatePath = (path = "", stateRootPath = "") =>
  (stateRootPath !== path ? stateRootPath.split(".") : [])
    .concat(path.split("."))
    .filter(x => !/\[\d+(?=\])/g.test(x)) // remove oneOf[n]/allOf[n]
    .filter(x => x !== "properties")
    .filter(x => x.length)
    .join(".")

const getParentPath = path => {
  const parts = path.split(".")

  const indexOfLastOccurringPropertiesProperty = parts.lastIndexOf("properties")

  return (indexOfLastOccurringPropertiesProperty > -1
    ? parts.slice(0, indexOfLastOccurringPropertiesProperty)
    : parts
  ).join(".")
}

const getInternalBranchType = branch =>
  branch.oneOf
    ? "oneOf"
    : branch.type === "string"
    ? "string"
    : branch.enum
    ? "enum"
    : branch.type === "array"
    ? "enum"
    : branch.type

export const createSchemaContainer = ({
  schema,
  schemaPath = "",
  stateRootPath = "",
  getState,
  setState,
} = {}) => {
  const statePath = getStatePath(schemaPath, stateRootPath)
  const parentPath = getParentPath(schemaPath)
  const parent = get(schema, parentPath, schema)
  const branch = get(schema, schemaPath, schema)
  const internalBranchType = getInternalBranchType(branch)
  const currentStateKey = statePath.split(".").slice(-1)[0]

  const required =
    parent && parent.required && parent.required.includes(currentStateKey)

  const parentPropertyKeys =
    parent && parent.properties && Object.keys(parent.properties)

  const nextQuestion =
    parentPropertyKeys &&
    currentStateKey &&
    parentPropertyKeys.slice(parentPropertyKeys.indexOf(currentStateKey) + 1)[0]

  const firstQuestion =
    parentPropertyKeys &&
    currentStateKey &&
    parentPropertyKeys[0] === currentStateKey

  const next = () => {
    if (nextQuestion) {
      return createSchemaContainer({
        schema,
        schemaPath: schemaPath
          .split(".")
          .slice(0, -1)
          .concat(nextQuestion)
          .join("."),
        stateRootPath,
        getState,
        setState,
      })
    }

    if (parent.allOf) {
      // Handle the possibility of extra question(s) as a result of answers
      // a.k.a. schema conditionals
      const state = getState()

      const baseStatePath = statePath
        .split(".")
        .slice(0, -1)
        .join(".")

      const questionsWithCorrespondingState = get(state, baseStatePath)
      const answeredQuestions = Object.keys(questionsWithCorrespondingState)

      // Should probably clean up state somewhere here.
      // i.e. if answers changed and previously answered conditionals aren't
      // required.
      const additionalSchema = parent.allOf.reduce(
        (combinedSchema, { if: _if, then }) => {
          // Check if _if applies to current answers
          Object.entries(_if.properties).forEach(([key, condition]) => {
            // If answers doesn't contain property, schema conditional doesn't apply
            if (!answeredQuestions.includes(key)) return

            const answer = questionsWithCorrespondingState[key]

            // condition:
            // { enum: [] }
            // { items: { enum: [] } }
            if (
              condition.items &&
              answer.filter(answer => condition.items.enum.includes(answer))
                .length
            ) {
              combinedSchema = combinedSchema || {}
              merge(combinedSchema, then)
            }

            if (condition.enum && condition.enum.includes(answer)) {
              combinedSchema = combinedSchema || {}

              const required = (combinedSchema.required || []).concat(
                then.required || [],
              )
              merge(combinedSchema, then)

              if (required.length) {
                combinedSchema.required = required
              }
            }
          })

          return combinedSchema
        },
        undefined,
      )

      if (additionalSchema) {
        console.log(schema, additionalSchema)
        return createSchemaContainer({
          schema: additionalSchema,
          stateRootPath: baseStatePath,
          getState,
          setState,
        })
      }
    }

    return undefined
  }

  const common = {
    schema,
    schemaPath,
    stateRootPath,
    statePath,
    getState,
    setState,
    parent,
    branch,
    internalBranchType,
    required,
    next,
    firstQuestion,
  }

  switch (internalBranchType) {
    case "oneOf":
      return {
        ...common,
        items: branch.oneOf.map(
          ({ title, app_imageAsset, properties }, index) => {
            const categoryKey = Object.keys(properties)[0]

            const firstQuestionKey = Object.keys(
              properties[categoryKey].properties,
            )[0]

            return {
              title,
              icon: app_imageAsset,
              next: () => {
                setState({})

                return createSchemaContainer({
                  schema,
                  schemaPath: `${
                    schemaPath ? schemaPath + "." : ""
                  }oneOf[${index}].properties.${
                    Object.keys(properties)[0]
                  }.properties.${firstQuestionKey}`,
                  stateRootPath,
                  getState,
                  setState,
                })
              },
            }
          },
        ),
      }
    case "string":
      return {
        ...common,
        ...(branch.enum
          ? {
              items: branch.enum.map(title => ({
                title,
                set: () => {
                  const state = { ...getState() }
                  set(state, statePath, title)
                  setState(state)
                },
              })),
            }
          : {
              set: text => {
                const state = { ...getState() }

                if (text.length) {
                  set(state, statePath, text)
                } else {
                  unset(state, statePath)
                }

                setState(state)
              },
            }),
        ...(branch.format ? { format: branch.format } : {}),
      }
    case "enum":
      return {
        ...common,
        items: (branch.items || branch).enum.map(title => ({
          title,
          set: () => {
            let state = { ...getState() }

            if (branch.items) {
              const currentState = get(state, statePath, [])

              if (currentState.includes(title)) {
                const filtered = currentState.filter(item => item !== title)

                if (filtered.length) {
                  set(state, statePath, filtered)
                } else {
                  unset(state, statePath)
                }
              } else {
                set(state, statePath, currentState.concat(title))
              }
            }

            if (branch.enum) {
              const currentState = get(state, statePath)

              if (currentState !== title) {
                set(state, statePath, title)
              } else {
                unset(state, statePath)
              }
            }

            setState(state)
          },
        })),
      }
    case "object":
      return createSchemaContainer({
        schema,
        schemaPath: `properties.${Object.keys(branch.properties)[0]}`,
        stateRootPath,
        getState,
        setState,
      })
    default:
      return common
  }
}
