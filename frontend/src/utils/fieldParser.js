export const getFieldValue = (field) => {
  if (!field) return null;
  if (field.stringValue) return field.stringValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.mapValue) return field.mapValue.fields;
  return field;
};