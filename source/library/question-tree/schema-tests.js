const Ajv = require("ajv")
const assert = require("assert")
const schema = require("./question-tree.json")

const validPainDetailsAnswers = {
  definition_pain_details_started: "last_24_hours",
  definition_pain_details_ingestion: "yes",
  definition_pain_details_when_chewing: "yes",
  definition_pain_details_affects_sleep: "yes",
  definition_pain_details_description: [
    "definition_pain_details_description_aching",
    "definition_pain_details_description_constant",
  ],
}

const createValidator = schema => {
  const ajv = new Ajv({
    errorDataPath: "property",
    allErrors: true,
    multipleOfPrecision: 8,
    schemaId: "auto",
    unknownFormats: "ignore",
  })

  const schemaValidationResult = ajv.validateSchema(schema)

  ajv.errors && console.log(ajv.errors)
  assert.strictEqual(schemaValidationResult, true)

  return (name, state, outcome) => {
    console.group()
    console.log(name)

    const validate = ajv.compile(schema)
    const validationResult = validate(state)

    if (validationResult !== outcome) {
      validate.errors && console.log("errors", validate.errors)
      assert.strictEqual(validationResult, outcome)
    }

    console.groupEnd()
  }
}

const validate = createValidator(schema)

validate(
  "category_aching #1",
  {
    category_aching: {
      ...validPainDetailsAnswers,
    },
  },
  true,
)

validate(
  "category_aching #2",
  {
    category_aching: {},
  },
  false,
)

validate(
  "category_trauma #1",
  {
    category_trauma: {},
  },
  false,
)

validate(
  "category_trauma #2",
  {
    category_trauma: {
      category_trauma_pain: "yes",
    },
  },
  false,
)

validate(
  "category_trauma #3",
  {
    category_trauma: {
      category_trauma_bleeding: "no",
      category_trauma_pain: "yes",
      category_trauma_swelling: "no",
      category_trauma_when: "2019-11-18T08:42:46.696Z",
      category_trauma_where: "ads",
      category_trauma_how: "asd",
      ...validPainDetailsAnswers,
    },
  },
  true,
)

validate(
  "category_trauma #4",
  {
    category_trauma: {
      category_trauma_bleeding: "no",
      category_trauma_pain: "yes",
      category_trauma_swelling: "no",
      category_trauma_when: "2019-11-18T09:43:20.011Z",
      category_trauma_where: "Bakom tanden",
      category_trauma_how: "Snubblade i trappan",
      definition_pain_details_started: "last_24_hours",
      definition_pain_details_ingestion: "no",
      definition_pain_details_when_chewing: "yes",
      definition_pain_details_affects_sleep: "no",
      definition_pain_details_description: [
        "definition_pain_details_description_aching",
        "definition_pain_details_description_constant",
      ],
    },
  },
  true,
)

validate(
  "category_gums_and_mucosa #1",
  {
    category_gums_and_mucosa: {},
  },
  false,
)

validate(
  "category_gums_and_mucosa #2",
  {
    category_gums_and_mucosa: {
      category_gums_and_mucosa_types: [
        "category_gums_and_mucosa_types_mouth_ulcers",
      ],
      ...validPainDetailsAnswers,
    },
  },
  true,
)

validate(
  "category_gums_and_mucosa #3",
  {
    category_gums_and_mucosa: {
      category_gums_and_mucosa_types: [],
    },
  },
  false,
)

validate(
  "category_wisdom_teeth #1",
  {
    category_wisdom_teeth: {
      category_wisdom_teeth_swelling: "no",
      category_wisdom_teeth_pain: "no",
    },
  },
  false,
)

validate(
  "category_wisdom_teeth #2",
  {
    category_wisdom_teeth: {
      category_wisdom_teeth_swelling: "no",
      category_wisdom_teeth_pain: "no",
      category_wisdom_teeth_other: "something",
    },
  },
  true,
)

validate(
  "category_wisdom_teeth #3",
  {
    category_wisdom_teeth: {
      category_wisdom_teeth_other: "something",
    },
  },
  false,
)

validate(
  "category_wisdom_teeth #4",
  {
    category_wisdom_teeth: {},
  },
  false,
)

validate(
  "category_wisdom_teeth #5",
  {
    category_wisdom_teeth: {
      category_wisdom_teeth_pain: "yes",
      category_wisdom_teeth_swelling: "no",
      category_wisdom_teeth_other: "something",
      ...validPainDetailsAnswers,
    },
  },
  true,
)

validate(
  "category_jaws #1",
  {
    category_jaws: {
      category_jaws_temple_face_jaw_temporomandibular: "no",
    },
  },
  false,
)

validate(
  "category_jaws #2",
  {
    category_jaws: {
      category_jaws_temple_face_jaw_temporomandibular: "no",
      category_jaws_gape_chewing: "no",
      category_jaws_locked_snags: "yes",
    },
  },
  true,
)

validate(
  "category_jaws #3",
  {
    category_jaws: {
      category_jaws_temple_face_jaw_temporomandibular: "yes",
      category_jaws_gape_chewing: "no",
      category_jaws_locked_snags: "yes",
      ...validPainDetailsAnswers,
    },
  },
  true,
)

validate(
  "category_jaws #4",
  {
    category_jaws: {},
  },
  false,
)

validate(
  "category_jaws #5",
  {
    category_jaws: {
      category_jaws_temple_face_jaw_temporomandibular: "no",
      category_jaws_gape_chewing: "no",
      category_jaws_locked_snags: "no",
      category_jaws_gape_chewing_other: "",
    },
  },
  false,
)

validate(
  "category_jaws #6",
  {
    category_jaws: {
      category_jaws_temple_face_jaw_temporomandibular: "no",
      category_jaws_gape_chewing: "no",
      category_jaws_locked_snags: "no",
      category_jaws_gape_chewing_other: "a",
    },
  },
  true,
)

validate(
  "category_lost_restorative_crown_bridge #1",
  {
    category_lost_restorative_crown_bridge: {
      category_lost_restorative_crown_bridge_when: "2019-11-06T12:22:59.010Z",
      category_lost_restorative_crown_bridge_how: "asd",
      category_lost_restorative_crown_bridge_sharp_cheek_tongue: "no",
      category_lost_restorative_crown_bridge_pain: "no",
      category_lost_restorative_crown_bridge_other: "asd",
    },
  },
  true,
)

validate(
  "category_lost_restorative_crown_bridge #2",
  {
    category_lost_restorative_crown_bridge: {
      category_lost_restorative_crown_bridge_when: "2019-11-06",
      category_lost_restorative_crown_bridge_how: "asd",
      category_lost_restorative_crown_bridge_pain: "no",
      category_lost_restorative_crown_bridge_other: "asd",
    },
  },
  false,
)

validate(
  "category_lost_restorative_crown_bridge #3",
  {
    category_lost_restorative_crown_bridge: {
      category_lost_restorative_crown_bridge_when: "asd",
    },
  },
  false,
)

validate(
  "category_lost_restorative_crown_bridge #4",
  {
    category_lost_restorative_crown_bridge: {
      category_lost_restorative_crown_bridge_when: "2019-11-06T12:22:59.010Z",
      category_lost_restorative_crown_bridge_how: "",
      category_lost_restorative_crown_bridge_sharp_cheek_tongue: "no",
      category_lost_restorative_crown_bridge_pain: "no",
      category_lost_restorative_crown_bridge_other: "asd",
    },
  },
  false,
)

validate(
  "category_sensitivity #1",
  {
    category_sensitivity: {},
  },
  false,
)

validate(
  "category_sensitivity #2",
  {
    category_sensitivity: {
      category_sensitivity_started: "2_to_4_days_ago",
      category_sensitivity_when: "a",
    },
  },
  true,
)

validate(
  "category_sensitivity #3",
  {
    category_sensitivity: {
      category_sensitivity_started: "2_to_4_days_ago",
      category_sensitivity_when: 123,
    },
  },
  false,
)

validate(
  "category_cosmetic #1",
  {
    category_cosmetic: {},
  },
  false,
)

validate(
  "category_cosmetic #2",
  {
    category_cosmetic: {
      category_cosmetic_types: [
        "category_cosmetic_types_crooked_teeth",
        "category_cosmetic_types_sparse_teeth",
      ],
    },
  },
  false,
)

validate(
  "category_cosmetic #3",
  {
    category_cosmetic: {
      category_cosmetic_types: [
        "category_cosmetic_types_crooked_teeth",
        "category_cosmetic_types_sparse_teeth",
        "asd",
      ],
      category_cosmetic_other: "a",
    },
  },
  false,
)

validate(
  "category_cosmetic #4",
  {
    category_cosmetic: {
      category_cosmetic_types: [
        "category_cosmetic_types_crooked_teeth",
        "category_cosmetic_types_sparse_teeth",
      ],
      category_cosmetic_other: "",
    },
  },
  false,
)

validate(
  "category_cosmetic #5",
  {
    category_cosmetic: {
      category_cosmetic_types: [
        "category_cosmetic_types_crooked_teeth",
        "category_cosmetic_types_sparse_teeth",
      ],
      category_cosmetic_other: "a",
    },
  },
  true,
)

validate(
  "category_dental_fear #1",
  {
    category_dental_fear: {},
  },
  false,
)

validate(
  "category_dental_fear #2",
  {
    category_dental_fear: {
      category_dental_fear_what: "",
    },
  },
  false,
)

validate(
  "category_dental_fear #3",
  {
    category_dental_fear: {
      category_dental_fear_what: "a",
    },
  },
  true,
)

validate(
  "category_other #1",
  {
    category_other: {},
  },
  false,
)

validate(
  "category_other #2",
  {
    category_other: {
      category_other_description: "",
    },
  },
  false,
)

validate(
  "category_other #3",
  {
    category_other: {
      category_other_description: "a",
    },
  },
  true,
)
