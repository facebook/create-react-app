import { codeBlock } from 'common-tags';

function printEnums(values) {
  return codeBlock`
    ${values.map(({ value }) => `\`${value}\``).join(' | ')}
  `;
}

function printShape(values) {
  const keyValues = Object.keys(values)
    .map(name => name + ': ' + getType(values[name]))
    .map(value => `\t${value}`)
    .join(', \r\n');

  return codeBlock`
    {\r\n${keyValues}\r\n}
  `;
}

/* eslint-disable no-use-before-define */
function printTypeOf(value, of) {
  return codeBlock`
    ${of} of ${value.name ? getType(value) : `\`${value}\``}
  `;
}
/* eslint-enable no-use-before-define */

function printCustom(value) {
  return codeBlock`
    ${value}
  `;
}

function printType(type) {
  switch (type.name) {
    case 'enum':
      return printEnums(type.value);
    case 'shape':
      return printShape(type.value);
    case 'instanceOf':
      return printTypeOf(type.value, 'instance');
    case 'arrayOf':
      return printTypeOf(type.value, 'array');
    case 'objectOf':
      return printTypeOf(type.value, 'object');
    case 'custom':
      return printCustom(type.raw);
    default:
      return type.name;
  }
}

function getType(type) {
  switch (type.name) {
    case 'union':
      return type.value.map(value => printType(value)).join(' | ');
    default:
      return printType(type);
  }
}

function getPropsData(props = {}) {
  return Object.keys(props).reduce(
    (allProps, prop) => [
      ...allProps,
      {
        prop: `${props[prop].required ? '* ' : ''}${prop}`,
        type: getType(props[prop].type),
        default: props[prop].defaultValue && props[prop].defaultValue.value,
        description: props[prop].description,
      },
    ],
    []
  );
}

export function getTableData(info = []) {
  const data = info.reduce(
    (acc, component) => [...acc, ...getPropsData(component.props)],
    []
  );

  return data;
}

export function sortTableData(data) {
  // eslint-disable-next-line no-nested-ternary
  return data.sort((a, b) => (a.prop > b.prop ? 1 : b.prop > a.prop ? -1 : 0));
}

export function excludeProps(excludes = [], data = []) {
  return data.filter(
    ({ prop }) =>
      !(excludes.includes(prop) || excludes.includes(prop.substring(2)))
  );
}
