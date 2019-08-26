/**
 * Cleanup docgen prop value of string which has this form:
 * "'string'" and converts it to "string"
 */
export const cleanValue = s =>
  typeof s === 'string' ? s.replace(/(^['"]|['"]$)/g, '') : s;

/**
 * Get docgen props of component
 * if it's an html element we parse just first level of text to be editable
 * if it's just a string we create docgen type of string
 */
export const getDocgenProps = component => {
  const componentType = component.type;

  if (typeof componentType === 'function') {
    if (componentType.__docgenInfo) {
      return componentType.__docgenInfo.props;
    }
  } else if (typeof componentType === 'string') {
    const props = component.props;
    return Object.keys(props).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: {
          type: {
            name: typeof props[curr],
            value: props[curr],
          },
        },
      }),
      {}
    );
  }

  return {
    children: {
      type: {
        name: typeof component,
        value: component,
      },
    },
  };
};

/**
 * parse displayName of component or create custom name
 */
export const getDisplayName = component =>
  (component.type && component.type.displayName) ||
  (typeof component === 'string'
    ? 'PlainText'
    : typeof component.type === 'string'
    ? component.type
    : 'NoDisplayName');

/**
 * Helper function for comparision
 */
export const is = (value, type) => value === type;
