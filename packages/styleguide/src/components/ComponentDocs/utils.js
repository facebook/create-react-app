import { parse } from 'react-docgen';
import anotationResolver from 'react-docgen-annotation-resolver';
import { codeBlock } from 'common-tags';

function flatten(items) {
  const flat = [];

  items.forEach(item => {
    if (Array.isArray(item)) {
      flat.push(...flatten(item));
    } else {
      flat.push(item);
    }
  });

  return flat;
}

async function getParsedPropsFromCode(code) {
  let parsedProps;

  try {
    parsedProps = parse(code);
  } catch (e) {
    try {
      [parsedProps] = parse(code, anotationResolver);
    } catch (err) {
      throw err;
    }
  }

  return parsedProps;
}

export async function getComponentInfo(path, getCode) {
  let arr = [];
  const parsedProps = await getParsedPropsFromCode(await getCode(path));

  if (parsedProps && parsedProps.composes) {
    arr = [
      ...arr,
      ...(await Promise.all(
        parsedProps.composes.map(async composedComponentPath => {
          const componentPath = `${path.substring(
            0,
            path.lastIndexOf('/')
          )}${composedComponentPath.substr(1)}`;

          return await getComponentInfo(componentPath, getCode);
        })
      ))
    ];
  }

  return [parsedProps, ...flatten(arr)].filter(item => item !== undefined);
}

function printEnums(values) {
  return codeBlock`
    ${values.map(({ value }) => `\`${value}\``).join(' | ')}
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
    \`\`\`js
    ${value}
    \`\`\`
  `;
}

function printType(type) {
  switch (type.name) {
    case 'enum':
      return printEnums(type.value);
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

function getShapePropsData(name, props = {}) {
  return Object.keys(props).reduce(
    (acc, prop) => ({
      ...acc,
      [`${name}.${prop}`]: {
        type: {
          name: props[prop].name,
          value: props[prop].value
        },
        defaultValue: props[prop].defaultValue,
        description: props[prop].description,
        required: props[prop].required
      }
    }),
    {}
  );
}

function getPropsData(props = {}) {
  return Object.keys(props).reduce(
    (allProps, prop) => [
      ...allProps,
      {
        prop: `${props[prop].required ? '* ' : ''}${prop}`,
        type: getType(props[prop].type),
        default: props[prop].defaultValue && props[prop].defaultValue.value,
        description: props[prop].description
      },
      ...(props[prop].type.name === 'shape'
        ? getPropsData(getShapePropsData(prop, props[prop].type.value))
        : [])
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
