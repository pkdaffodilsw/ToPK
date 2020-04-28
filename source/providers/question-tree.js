import refParser from "json-schema-ref-parser"
import React from "react"
import { readQuestionTree } from "../api"

const actionTypes = {
  READ_QUESTION_TREE: "READ_QUESTION_TREE",
  READ_QUESTION_TREE_ERROR: "READ_QUESTION_TREE_ERROR",
  READ_QUESTION_TREE_SUCCESS: "READ_QUESTION_TREE_SUCCESS",
}

const initialState = {
  loading: false,
  id: undefined,
  tree: undefined,
  error: undefined,
}

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.READ_QUESTION_TREE:
      return {
        ...state,
        loading: true,
        error: undefined,
      }
    case actionTypes.READ_QUESTION_TREE_SUCCESS:
      return {
        loading: false,
        id: action.payload.id,
        tree: action.payload.tree,
        error: undefined,
      }
    case actionTypes.READ_QUESTION_TREE_ERROR:
      return {
        loading: false,
        id: undefined,
        tree: undefined,
        error: action.payload,
      }
    default:
      return state
  }
}

const useQuestionTree = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [answers, setAnswers] = React.useState({})
  const additionalSchema = React.useRef({})

  return {
    answers,
    setAnswers,
    additionalSchema: {
      get: stateRootPath => additionalSchema.current[stateRootPath],
      set: (stateRootPath, schema) =>
        Object.assign(additionalSchema.current, { [stateRootPath]: schema }),
    },
    state,
    fetch: () => {
      dispatch({ type: actionTypes.READ_QUESTION_TREE })

      return readQuestionTree()
        .then(({ id, schema }) =>
          refParser.dereference(schema).then(({ definitions, type, ...tree }) =>
            dispatch({
              type: actionTypes.READ_QUESTION_TREE_SUCCESS,
              payload: { id, tree, definitions, type },
            }),
          ),
        )
        .catch(error => {
          console.log(error)
          dispatch({
            type: actionTypes.READ_QUESTION_TREE_ERROR,
            payload: error,
          })
        })
    },
  }
}

export const Context = React.createContext()

export const Provider = props => {
  const questionTree = useQuestionTree()

  return <Context.Provider value={questionTree} {...props} />
}
