import React from "react"
import { Object } from "core-js"

export const Context = React.createContext()

const initialState = {
  heartCondition: {
    heartConditions: {
      myocardialInfarction: {
        medications: undefined,
        hasCondition: false,
      },
      heartFailure: {
        medications: undefined,
        hasCondition: false,
      },
      angina: {
        medications: undefined,
        hasCondition: false,
      },
      atrialFibrillation: {
        medications: undefined,
        hasCondition: false,
      },
      heartValveDisorder: {
        medications: undefined,
        hasCondition: false,
      },
      stroke: {
        medications: undefined,
        hasCondition: false,
      },
      cerebralHaemorrhage: {
        medications: undefined,
        hasCondition: false,
      },
      thrombusRequiringBloodThinner: {
        medications: undefined,
        hasCondition: false,
      },
      other: {
        conditionDescription: undefined,
        medications: undefined,
        hasCondition: false,
      },
    },
    hasCondition: false,
  },
  highBloodPressure: {
    medications: undefined,
    hasCondition: false,
  },
  diabetes: {
    type: undefined,
    treatment: [],
    medications: undefined,
    hasCondition: false,
  },
  neurologicalDisorder: {
    type: [],
    other: {
      conditionDescription: undefined,
      hasCondition: false,
    },
    medications: undefined,
    hasCondition: false,
  },
  immuneDisease: {
    type: undefined,
    medications: undefined,
    hasCondition: false,
  },
  bloodInfection: {
    bloodInfections: {
      hepatitisB: {
        hasCondition: false,
      },
      hepatitisC: {
        hasCondition: false,
      },
      hiv: {
        hasCondition: false,
      },
    },
    medications: undefined,
    hasCondition: false,
  },
  rheumaticDisease: {
    type: undefined,
    medications: undefined,
    hasCondition: false,
  },
  lungDisease: {
    lungDiseases: {
      asthma: {
        medications: undefined,
        hasCondition: false,
      },
      copd: {
        medications: undefined,
        hasCondition: false,
      },
      other: {
        conditionDescription: undefined,
        medications: undefined,
        hasCondition: false,
      },
    },
    hasCondition: false,
  },
  hemophilia: {
    medications: undefined,
    hasCondition: false,
  },
  cancer: {
    description: undefined,
    treatment: [],
    medications: undefined,
    isAffected: undefined,
    effect: undefined,
    hasCondition: false,
  },
  osteoporosis: {
    medications: undefined,
    hasCondition: false,
  },
  mrsa: {
    medications: undefined,
    hasCondition: false,
  },
  other: {
    conditionDescription: undefined,
    medications: undefined,
    hasCondition: false,
  },
  tobaccoUse: {
    smoking: {
      hasCondition: undefined,
      amount: undefined,
    },
    snus: {
      hasCondition: undefined,
    },
    waterpipe: {
      hasCondition: undefined,
    },
    hasCondition: undefined,
  },
  allergies: {
    penicillin: false,
    localAnesthesia: false,
    pollen: false,
    food: false,
    other: {
      hasCondition: false,
      conditionDescription: undefined,
    },
    medications: undefined,
  },
  pregnancy: {
    hasCondition: undefined,
    estimatedMonth: undefined,
    estimatedYear: undefined,
  },
}

export const Provider = props => {
  // "heartCondition": {
  //   "heartConditions": {
  //     "myocardialInfarction": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "heartFailure": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "angina": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "atrialFibrillation": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "heartValveDisorder": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "stroke": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "cerebralHaemorrhage": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "thrombusRequiringBloodThinner": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "other": {
  //       "conditionDescription": "string",
  //       "medications": "string",
  //       "hasCondition": true
  //     }
  //   },
  //   "hasCondition": true
  // },
  const [heartCondition, setHeartCondition] = React.useState(
    initialState.heartCondition,
  )

  // "highBloodpressure": {
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [highBloodPressure, setHighBloodPressure] = React.useState(
    initialState.highBloodPressure,
  )

  // "diabetes": {
  //   "type": "Type1",
  //   "treatment": [
  //     "Diet"
  //   ],
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [diabetes, setDiabetes] = React.useState(initialState.diabetes)

  // "neurologicalDisorder": {
  //   "type": [
  //     "Epilepsy"
  //   ],
  //   "other": {
  //     "conditionDescription": "string",
  //     "hasCondition": true
  //   },
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [neurologicalDisorder, setNeurologicalDisorder] = React.useState(
    initialState.neurologicalDisorder,
  )

  // "immuneDisease": {
  //   "type": "string",
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [immuneDisease, setImmuneDisease] = React.useState(
    initialState.immuneDisease,
  )

  // "bloodInfection": {
  //   "bloodInfections": {
  //     "hepatitisB": {
  //       "hasCondition": true
  //     },
  //     "hepatitisC": {
  //       "hasCondition": true
  //     },
  //     "hiv": {
  //       "hasCondition": true
  //     }
  //   },
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [bloodInfection, setBloodInfection] = React.useState(
    initialState.bloodInfection,
  )

  // "rheumaticDisease": {
  //   "type": "string",
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [rheumaticDisease, setRheumaticDisease] = React.useState(
    initialState.rheumaticDisease,
  )

  // "lungDisease": {
  //   "lungDiseases": {
  //     "asthma": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "copd": {
  //       "medications": "string",
  //       "hasCondition": true
  //     },
  //     "other": {
  //       "conditionDescription": "string",
  //       "medications": "string",
  //       "hasCondition": true
  //     }
  //   },
  //   "hasCondition": true
  // },
  const [lungDisease, setLungDisease] = React.useState(initialState.lungDisease)

  // "hemophilia": {
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [hemophilia, setHemophilia] = React.useState(initialState.hemophilia)

  // "cancer": {
  //   "description": "string",
  //   "isAffected": true,
  //   "effect": "string",
  //   "treatment": [
  //     "Chemotherapy"
  //   ],
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [cancer, setCancer] = React.useState(initialState.cancer)

  // "osteoporosis": {
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [osteoporosis, setOsteoporosis] = React.useState(
    initialState.osteoporosis,
  )

  // "mrsa": {
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [mrsa, setMrsa] = React.useState(initialState.mrsa)

  // "other": {
  //   "conditionDescription": "string",
  //   "medications": "string",
  //   "hasCondition": true
  // },
  const [other, setOther] = React.useState(initialState.other)

  // "tobaccoUse": {
  //   "smoking": {
  //     "amount": "FewerThanTenPerDay",
  //     "hasCondition": true
  //   },
  //   "snus": {
  //     "hasCondition": true
  //   },
  //   "waterpipe": {
  //     "hasCondition": true
  //   },
  //   "hasCondition": true
  // },
  const [tobaccoUse, setTobaccoUse] = React.useState(initialState.tobaccoUse)

  // "allergies": {
  //   "penicillin": true,
  //   "localAnesthesia": true,
  //   "pollen": true,
  //   "food": true,
  //   "other": true,
  //   "medications": "string"
  // }
  const [allergies, setAllergies] = React.useState(initialState.allergies)

  const [pregnancy, setPregnancy] = React.useState(initialState.pregnancy)

  const exposed = {
    heartCondition,
    setHeartCondition,
    highBloodPressure,
    setHighBloodPressure,
    diabetes,
    setDiabetes,
    neurologicalDisorder,
    setNeurologicalDisorder,
    immuneDisease,
    setImmuneDisease,
    bloodInfection,
    setBloodInfection,
    rheumaticDisease,
    setRheumaticDisease,
    lungDisease,
    setLungDisease,
    hemophilia,
    setHemophilia,
    cancer,
    setCancer,
    osteoporosis,
    setOsteoporosis,
    mrsa,
    setMrsa,
    other,
    setOther,
    tobaccoUse,
    setTobaccoUse,
    allergies,
    setAllergies,
    pregnancy,
    setPregnancy,
  }

  const sensitiveStates = [
    "heartCondition",
    "highBloodPressure",
    "diabetes",
    "neurologicalDisorder",
    "immuneDisease",
    "bloodInfection",
    "rheumaticDisease",
    "lungDisease",
    "hemophilia",
    "cancer",
    "osteoporosis",
    "mrsa",
    "other",
    "tobaccoUse",
    "allergies",
    "pregnancy",
  ]

  const setInitial = () => {
    sensitiveStates.forEach(stateName => {
      exposed[`set${stateName.replace(/^./, m => m.toUpperCase())}`](
        initialState[stateName],
      )
    })
  }

  return (
    <Context.Provider
      value={Object.assign(exposed, {
        setInitial,
      })}
      {...props}
    />
  )
}
