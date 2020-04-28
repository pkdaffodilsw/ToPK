export const type = value => Object.prototype.toString.call(value)

Object.assign(type, {
  ARRAY: type([]),
  OBJECT: type({}),
  BOOLEAN: type(true),
})
