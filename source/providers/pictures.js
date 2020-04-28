import React from "react"

const actionTypes = {
  ADD_PICTURE: "ADD_PICTURE",
  REMOVE_PICTURE: "REMOVE_PICTURE",
  CLEAR_PICTURES: "CLEAR_PICTURES",
  UPLOAD_PICTURE: "UPLOAD_PICTURE",
  UPLOAD_PICTURE_SUCCESS: "UPLOAD_PICTURE_SUCCESS",
  UPLOAD_PICTURE_ERROR: "UPLOAD_PICTURE_ERROR",
}

const usePictures = () => {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case actionTypes.ADD_PICTURE:
        return [
          ...state,
          {
            ...action.payload,
            loading: false,
            error: undefined,
            image: undefined,
          },
        ]
      case actionTypes.REMOVE_PICTURE:
        return state.filter(picture => picture.uri !== action.payload.uri)
      case actionTypes.CLEAR_PICTURES:
        return []
      case actionTypes.UPLOAD_PICTURE:
        return state.map(picture =>
          picture.uri === action.payload.uri
            ? { ...picture, loading: true }
            : picture,
        )
      case actionTypes.UPLOAD_PICTURE_SUCCESS:
        return state.map(picture =>
          picture.uri === action.payload.uri
            ? {
                ...picture,
                loading: false,
                error: undefined,
                image: action.payload.image,
              }
            : picture,
        )
      case actionTypes.UPLOAD_PICTURE_ERROR:
        return state.map(picture =>
          picture.uri === action.payload.uri
            ? {
                ...picture,
                loading: false,
                error: action.payload.error,
                image: undefined,
              }
            : picture,
        )
      default:
        return state
    }
  }, [])

  return {
    state,
    add: picture => {
      dispatch({ type: actionTypes.ADD_PICTURE, payload: picture })
    },
    remove: ({ uri }) => {
      dispatch({ type: actionTypes.REMOVE_PICTURE, payload: { uri } })
    },
    clear: () => {
      dispatch({ type: actionTypes.CLEAR_PICTURES })
    },
    upload: ({ uri }) => {
      dispatch({ type: actionTypes.UPLOAD_PICTURE, payload: { uri } })

      return {
        resolve: image => {
          dispatch({
            type: actionTypes.UPLOAD_PICTURE_SUCCESS,
            payload: { uri, image },
          })
        },
        reject: error => {
          dispatch({
            type: actionTypes.UPLOAD_PICTURE_ERROR,
            payload: { uri, error },
          })
        },
      }
    },
  }
}

export const Context = React.createContext()

export const Provider = props => {
  const pictures = usePictures()

  return <Context.Provider value={pictures} {...props} />
}
