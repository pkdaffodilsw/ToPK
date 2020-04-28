# Question Tree

## App metadata

- `app_imageAsset` i.e. icon
- `app_uiControl` i.e. `button`
- `app_warningMessage` markdown formatted message

## Conditionals

Important to add `"required"`, otherwise schema will default to true if property is not defined. See [https://github.com/epoberezkin/ajv/issues/913](https://github.com/epoberezkin/ajv/issues/913).

### Applying definition

```json
{
  "allOf": [
    {
      "if": {
        "properties": {
          "category_trauma_pain": {
            "enum": ["yes"]
          }
        },
        "required": ["category_trauma_pain"]
      },
      "then": {
        "$ref": "#/definitions/definition_pain_details"
      }
    }
  ]
}
```
