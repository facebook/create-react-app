/* eslint-disable no-underscore-dangle */
import React from 'react';
import { arrayOf, string, bool, element, func, oneOfType } from 'prop-types';
import styled from 'styled-components';
import CodeExample from './CodeExample';

import { Bar, BarItem } from './../Bar';
import Button from './../Button';

import useId from './../../utils/useId';

/**
 * Cleanup docgen prop value of string which has this form:
 * "'string'" and converts it to "string"
 */
const cleanValue = s => (typeof s === 'string' ? s.replace(/(^'|'$)/g, '') : s);

/**
 * Generates help tooltip for property input
 *
 * @param React.Component.prop prop
 */
const PropDescription = prop => {
  return (
    <Tooltip dialog={prop.description || 'No valuable description found'}>
      i
    </Tooltip>
  );
};

/**
 * Get docgen props of component
 * if it's an html element we parse just first level of text to be editable
 * if it's just a string we create docgen type of string
 */
const getDocgenProps = component => {
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
const getDisplayName = component =>
  (component.type && component.type.displayName) ||
  (typeof component === 'string'
    ? 'PlainText'
    : typeof component.type === 'string'
    ? component.type
    : 'NoDisplayName');

/**
 * Helper function for comparision
 */
const is = (value, type) => value === type;

/**
 * Class that creates interactive playground
 * for experimenting with possibilities of components props
 */
class Interact extends React.Component {
  static propTypes = {
    /** Element id */
    id: string,
    /** Which props should be filtered */
    filterProps: arrayOf(string),
    /** Render element */
    render: oneOfType([element, func]).isRequired,
    /** Parser should skip children */
    skipChildren: bool,
  };

  static defaultProps = {
    filterProps: [],
  };

  constructor(props) {
    super(props);
    this.component = props.render;

    this.id = this.props.id || useId('interactive');

    this.getPropValue = this.getPropValue.bind(this);
    this.isDefaultValue = this.isDefaultValue.bind(this);
    this.getDefaultValue = this.getDefaultValue.bind(this);
    this.handleShowCode = this.handleShowCode.bind(this);
    this.handleShowProps = this.handleShowProps.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.renderInteractive = this.renderInteractive.bind(this);
    this.generateLiveProps = this.generateLiveProps.bind(this);
    this.generateDocgenProps = this.generateDocgenProps.bind(this);
    this.getComponentInfo = this.getComponentInfo.bind(this);
    this.getComponentDocgenProps = this.getComponentDocgenProps.bind(this);
    this.setDeepState = this.setDeepState.bind(this);
    this.renderInput = this.renderInput.bind(this);

    /*  
      this.state = {
        liveProps:{
          'Button0': {
          ...Button0Props
        },
        'Button0Icon0': {
          ...Button0Icon0Props
        },
        'Button0Text0': {
          ...Button0Text0
        },
        'Button0Icon1': {
          ...Button0Icon1Props
        },
        etc.
      }             
    }; 
    */

    this.state = {
      showCode: false,
      liveProps: this.generateLiveProps(this.component),
      showProps: this.generateShowProps(this.component),
    };

    this.docgen = {
      liveProps: this.generateDocgenProps(this.component),
    };
  }

  /**
   * creates componentName and props
   */
  getComponentInfo(component, id = 0, prefix = '') {
    const name = prefix + getDisplayName(component) + id;
    const props = getDocgenProps(component) || {};
    const propValues = Object.keys(props).reduce((acc, propName) => {
      const value =
        typeof component !== 'string'
          ? this.getPropValue(propName, component)
          : component;
      return {
        ...acc,
        ...(value !== null ? { [propName]: value } : {}),
      };
    }, {});

    return {
      name,
      state: {
        [name]: {
          ...propValues,
        },
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getComponentDocgenProps(component, id = 0, prefix = '') {
    const name = prefix + getDisplayName(component) + id;
    const props = getDocgenProps(component);
    return {
      name,
      state: {
        [name]: {
          ...props,
        },
      },
    };
  }

  isDefaultValue(id, name) {
    const stateValue =
      this.state.liveProps[id] && this.state.liveProps[id][name];
    const docgenValue =
      this.docgen.liveProps[id] && this.docgen.liveProps[id][name];
    return (
      stateValue &&
      docgenValue &&
      stateValue === this.getDefaultValue(docgenValue)
    );
  }

  /**
   * Get component default value from docgen
   * object or from the component itself
   */
  getDefaultValue(docgen) {
    const { defaultValue } = docgen || {};

    if (defaultValue) {
      const isObject = is(typeof defaultValue, 'object');
      const value = isObject ? defaultValue.value : defaultValue;
      return cleanValue(value);
    }

    return false;
  }

  /**
   * Get prop value of the component by name
   *
   * @param string name
   * @param React.Component component
   */
  getPropValue(name, component) {
    const docgen = getDocgenProps(component)[name];
    const componentPropValue = component.props[name];
    const defaultValue = this.getDefaultValue(docgen);

    if (componentPropValue) {
      return componentPropValue;
    } else if (defaultValue) {
      // special case when component value is false but stored as string
      if (is(defaultValue, 'false')) {
        return false;
      }
      // special case when component value is 0 but stored as string
      if (is(defaultValue, '0')) {
        return 0;
      }
      return defaultValue;
    }
    return '';
  }

  /**
   * Set component prop value by name
   *
   * @param HtmlElement target
   * @param string name
   * @param any value
   */
  setDeepState(target, name, value) {
    const id = target.getAttribute('data-component-id');

    this.setState(prevState => ({
      liveProps: {
        ...(prevState.liveProps || {}),
        [id]: {
          ...(prevState.liveProps[id] || {}),
          ...(value === 'null' ? { [name]: undefined } : { [name]: value }),
        },
      },
    }));
  }

  /**
   * Handler for code toggle
   */
  handleShowCode() {
    this.setState(prevState => ({
      showCode: !prevState.showCode,
    }));
  }

  /**
   * Handler for toggle of deep component props
   * in interactive right panel
   *
   * @param HtmlEvent e
   * @param string id
   */
  handleShowProps(e, id) {
    this.setState(prevState => ({
      showProps: {
        ...prevState.showProps,
        [id]: !prevState.showProps[id],
      },
    }));
  }

  /**
   * Handler for input change event
   *
   * @param string type
   * @param HtmlEvent event
   */
  handleInputChange(type, event) {
    const { target } = event;
    const { name, value } = target;
    let newValue = value;
    if (is(type, 'number')) {
      newValue = 0;
      if (parseInt(value) !== 0) {
        newValue = parseInt(value) || parseFloat(value) || '';
      }
    }
    this.setDeepState(target, name, newValue);
  }

  /**
   * Handler for checkbox change event
   *
   * @param HtmlEvent event
   */
  handleCheckboxChange(event) {
    const { target } = event;
    const { name, checked } = target;
    this.setDeepState(target, name, checked);
  }

  /**
   * Handler for select change event
   *
   * @param HtmlEvent event
   */
  handleSelectChange(event) {
    const { target } = event;
    const { name, value } = target;
    this.setDeepState(target, name, value);
  }

  /**
   * Generate live interactive props
   *
   * @param React.Component component
   * @param number id
   * @param string prefix
   */
  generateLiveProps(component, id = 0, prefix = '') {
    const {
      name: componentName,
      state: componentState,
    } = this.getComponentInfo(component, id, prefix);

    const children = (component.props && component.props.children) || [];
    const isHtmlElement = typeof component.type === 'string';
    let childrenStates = {};
    if (!this.props.skipChildren && !isHtmlElement && children) {
      const childrenArray = React.Children.toArray(children);

      childrenStates = childrenArray.reduce(
        (acc, child, index) => ({
          ...acc,
          ...this.generateLiveProps(child, index, componentName),
        }),
        {}
      );
    }

    return {
      ...componentState,
      ...childrenStates,
    };
  }

  /**
   * Generate show state for interactive components
   *
   * @param React.Component component
   * @param number id
   * @param string prefix
   */
  generateShowProps(component, id = 0, prefix = '') {
    const componentName = prefix + getDisplayName(component) + id;
    const componentState = { [componentName]: prefix ? false : true };

    const children = (component.props && component.props.children) || [];
    const isHtmlElement = typeof component.type === 'string';
    let childrenStates = {};
    if (!this.props.skipChildren && !isHtmlElement && children) {
      const childrenArray = React.Children.toArray(children);

      childrenStates = childrenArray.reduce(
        (acc, child, index) => ({
          ...acc,
          ...this.generateShowProps(child, index, componentName),
        }),
        {}
      );
    }

    return {
      ...componentState,
      ...childrenStates,
    };
  }

  /**
   * Generate live interactive props using react docgen object
   *
   * @param React.Component component
   * @param number id
   * @param string prefix
   */
  generateDocgenProps(component, id = 0, prefix = '') {
    const {
      name: componentName,
      state: componentState,
    } = this.getComponentDocgenProps(component, id, prefix);

    const isHtmlElement = typeof component.type === 'string';
    const children = (component.props && component.props.children) || [];
    let childrenStates = {};
    if (!this.props.skipChildren && !isHtmlElement && children) {
      const childrenArray = React.Children.toArray(children);

      childrenStates = childrenArray.reduce(
        (acc, child, index) => ({
          ...acc,
          ...this.generateDocgenProps(child, index, componentName),
        }),
        {}
      );
    }

    return {
      ...componentState,
      ...childrenStates,
    };
  }

  /**
   * Render form input element for interaction with component
   *
   * @param string id
   * @param string name
   */
  renderInput(id, name) {
    let input;
    const props = {
      key: name,
      id: name,
      name,
      'data-component-id': id,
    };
    const label = <strong>{name.replace(/^\w/, m => m.toUpperCase())}</strong>;
    const isDefaultValue = this.isDefaultValue(id, name) ? (
      <div style={{ color: 'grey' }}>
        <small>Default</small>
      </div>
    ) : (
      ''
    );
    const docgenProps = this.docgen.liveProps[id][name];
    let inputLabel = (
      <Bar space="tiny">
        <BarItem>
          <label htmlFor={props.id}>{label}</label>
        </BarItem>
        <BarItem>
          <PropDescription {...docgenProps} />
        </BarItem>
      </Bar>
    );
    if (docgenProps.type) {
      const type = docgenProps.type.name;

      if (is(type, 'string') || is(type, 'number')) {
        input = (
          <Input
            {...props}
            value={this.state.liveProps[id][name]}
            onChange={e => {
              this.handleInputChange(type, e);
            }}
          />
        );
      } else if (is(type, 'bool')) {
        inputLabel = null;
        input = (
          <Bar>
            <BarItem>
              <Input
                {...props}
                type="checkbox"
                checked={this.state.liveProps[id][name] ? 'checked' : false}
                onChange={this.handleCheckboxChange}
              />{' '}
              <label htmlFor={props.id}>{label}</label>
            </BarItem>
            <BarItem>
              <PropDescription {...docgenProps} />
            </BarItem>
          </Bar>
        );
      } else if (is(type, 'enum')) {
        input = (
          <select
            {...props}
            value={this.state.liveProps[id][name]}
            onChange={this.handleSelectChange}
          >
            <option value="null">None</option>
            {Object.values(docgenProps.type.value).map((option, index) => {
              const optionValue = cleanValue(option.value);
              return (
                <option key={index.toString()} value={optionValue}>
                  {optionValue}
                </option>
              );
            })}
          </select>
        );
      } else {
        const inputValue = this.state.liveProps[id][name];
        inputLabel = (
          <div>
            <label style={{ color: 'grey' }} htmlFor={props.id}>
              {label}
            </label>
          </div>
        );
        input = (
          <Input
            {...props}
            disabled
            value={
              is(typeof inputValue, 'object')
                ? JSON.stringify(inputValue)
                : inputValue.toString()
            }
          />
        );
        /*
        any, array, func, object, node, element, symbol, 
        instanceOf, oneOfType, arrayOf, objectOf, shape, custom

        these types of props cannot be parsed because their value in 
        __docgenInfo defaultValue.value is very complex form but is stored
        as a simple string not a JSON, so its impossible for now to 
        */
      }
    }

    return (
      <Bar key={id + name}>
        <BarItem>
          {inputLabel}
          {input}
          {isDefaultValue}
        </BarItem>
      </Bar>
    );
  }

  /**
   * Recursive function that renders components to the deepest level
   * and connects their props with props stored in state
   *
   * @param React.Component component
   * @param number id
   * @param string prefix
   */
  renderInteractive(component, id = 0, prefix = '') {
    const componentName = prefix + getDisplayName(component) + id;
    const { props } = component;
    const { children } = props || { children: [] };
    const docgenProps = this.docgen.liveProps[componentName];
    const liveProps = this.state.liveProps[componentName];

    let componentBase;
    if (component.type) {
      if (typeof component.type === 'function') {
        componentBase = component;
      } else {
        componentBase = React.createElement(component.type);
      }
    } else {
      componentBase = React.createElement(React.Fragment);
    }

    const isHtmlElement = typeof component.type === 'string';

    return {
      ...componentBase,
      props: {
        ...props,
        ...(!this.props.skipChildren && !isHtmlElement
          ? {
              children: React.Children.map(children, (child, index) =>
                this.renderInteractive(child, index, componentName)
              ),
            }
          : {}),
        ...Object.keys(liveProps).reduce((acc, curr) => {
          const defaultValue =
            docgenProps[curr].defaultValue &&
            cleanValue(docgenProps[curr].defaultValue.value);
          // default values should not be visible in code example
          return {
            ...acc,
            [curr]:
              defaultValue === liveProps[curr] || liveProps[curr] === ''
                ? undefined
                : liveProps[curr],
          };
        }, {}),
      },
    };
  }

  /**
   * Render function for Interact component
   */
  render() {
    const componentIds = Object.keys(this.state.liveProps);

    return (
      <StyledInteract>
        <Grid className="mb-large">
          <GridCol
            size={7}
            className="align-items-middle align-items-middle"
            style={{
              borderRight: '1px solid #949494',
              position: 'relative',
            }}
          >
            <StyledSticky>
              <Bar>
                <BarItem isFilling>
                  <h3 className="h4 text-bold">
                    {getDisplayName(this.component)}
                  </h3>
                </BarItem>
                <BarItem>
                  <Button onClick={this.handleShowCode}>
                    {this.state.showCode ? 'HIDE CODE ▲' : 'SHOW CODE ▼'}
                  </Button>
                </BarItem>
              </Bar>
              {!this.state.showCode && this.renderInteractive(this.component)}
              {this.state.showCode && (
                <CodeExample
                  codeJSXOptions={{
                    cleanProps: true,
                    filterProps: ['key'],
                  }}
                >
                  {this.renderInteractive(this.component)}
                </CodeExample>
              )}
            </StyledSticky>
          </GridCol>
          <GridCol size={5}>
            {componentIds.map((id, compIndex) => {
              const statePropNames = Object.keys(this.docgen.liveProps[id]);
              const propCount = statePropNames.length;
              const deepness = id
                .replace(/(\w+\d+)*(\w+)\d+$/g, '$1')
                .replace(/\w+?\d+?/g, '-').length;
              const componentName = id.replace(/(\w+\d+)*(\w+)\d+$/g, '$2');
              return (
                <div key={id} style={{ marginLeft: `${deepness * 15}px` }}>
                  <Button
                    fontSize="base"
                    onClick={e => {
                      this.handleShowProps(e, id);
                    }}
                    style={{ paddingLeft: 0 }}
                  >
                    {deepness > 0 && '↳'} {componentName}{' '}
                    {this.state.showProps[id] ? '▲' : '▼'}
                  </Button>
                  {this.state.showProps[id] &&
                    (propCount ? (
                      statePropNames.map(name => {
                        if (
                          this.props.filterProps.find(
                            filtered => filtered === name
                          )
                        ) {
                          return null;
                        }
                        return (
                          <StyledWrapper>
                            {this.renderInput(id, name)}
                          </StyledWrapper>
                        );
                      })
                    ) : (
                      <StyledWrapper>
                        <p>
                          There are no props to edit, try another component!
                        </p>
                      </StyledWrapper>
                    ))}
                </div>
              );
            })}
          </GridCol>
        </Grid>
      </StyledInteract>
    );
  }
}

const StyledWrapper = styled.div`
  border-left: 1px solid ${props => props.theme.colors.greyDark};
  padding-left: ${props => props.theme.spaces.small};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: -1px;
    height: 20px;
    width: 0;
    border-left: 1px solid ${props => props.theme.colors.greyDark};
  }
`;

const StyledInteract = styled.div`
  font-family: ${props => props.theme.fontFamily};
`;

const Grid = styled.div`
  display: flex;
`;

const GridCol = styled.div`
  flex: 1 0 auto;
  padding: ${props => props.theme.spaces.small};

  ${props =>
    props.size &&
    `
    width: ${(props.size / 12) * 100 + '%'}
    `}
`;

const Input = styled.input`
  background-color: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.greyDark};
  border-radius: 3px;
  font-size: 0.875rem;
  min-height: 1em;
  padding: 0.42857em 0.57143em;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const StyledTooltip = styled.div`
  position: relative;
  color: ${props => props.theme.colors.white};

  .tooltip-title {
    pointer-events: none;
    position: absolute;
    width: 200px;
    text-align: center;
    padding: ${props => props.theme.spaces.small};
    background: black;
    border-radius: ${props => props.theme.spaces.tiny};
    left: 0;
    top: 50%;
    transform: translate(-105%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease-in 0.1s;

    ::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(100%, -50%);
      border-style: solid;
      border-width: 6px 0 6px 8px;
      border-color: transparent transparent transparent
        ${props => props.theme.colors.black};
    }
  }

  .tooltip-trigger:hover + .tooltip-title {
    opacity: 1;
  }

  .tooltip-trigger {
    background: ${props => props.theme.colors.black};
    color: ${props => props.theme.colors.white};
    text-align: center;
    font-size: 16px;
    line-height: 24px;
    height: 24px;
    width: 24px;
    margin: 0;
    border-radius: 50%;
  }
`;

const Tooltip = ({ children, dialog, ...other }) => (
  <StyledTooltip {...other}>
    <div className="tooltip-trigger">{children}</div>
    <div className="tooltip-title">{dialog}</div>
  </StyledTooltip>
);

const StyledSticky = styled.div`
  position: sticky;
  top: 0;
`;

export default Interact;
