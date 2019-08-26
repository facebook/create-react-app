/* eslint-disable no-underscore-dangle */
import React from 'react';
import { arrayOf, string, bool, element, func, oneOfType } from 'prop-types';
import styled from 'styled-components';
import CodeExample from '../CodeExample';

import useId from '../../../utils/useId';

import PropsGroup from './PropsGroup';
import ButtonShowPropsGroup from './ButtonShowPropsGroup';
import InteractContext from './state';

import { cleanValue, getDocgenProps, getDisplayName, is } from './helpers';

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
    /** Show code */
    showCode: bool,
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
    this.handleShowProps = this.handleShowProps.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.renderInteractive = this.renderInteractive.bind(this);
    this.generateProps = this.generateProps.bind(this);
    this.getComponentInfo = this.getComponentInfo.bind(this);
    this.getComponentDocgenProps = this.getComponentDocgenProps.bind(this);
    this.setDeepState = this.setDeepState.bind(this);

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
      showCode: this.props.showCode,
      liveProps: this.generateProps('live', this.component),
      showProps: this.generateProps('show', this.component),
    };

    this.docgen = {
      liveProps: this.generateProps('docgen', this.component),
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
  generateProps(type, component, id = 0, prefix = '') {
    let info = {};

    // Get info by type
    if (type === 'show') {
      const name = prefix + getDisplayName(component) + id;
      info = {
        name: name,
        state: { [name]: prefix ? false : true },
      };
    }

    if (type === 'live') {
      info = this.getComponentInfo(component, id, prefix);
    }

    if (type === 'docgen') {
      info = this.getComponentDocgenProps(component, id, prefix);
    }

    const componentName = info.name;
    const componentState = info.state;

    // Parse children for more info
    const children = (component.props && component.props.children) || [];

    let childrenStates = {};
    if (!this.props.skipChildren && children) {
      const childrenArray = React.Children.toArray(children);

      childrenStates = childrenArray.reduce(
        (acc, child, index) => ({
          ...acc,
          ...this.generateProps(type, child, index, componentName),
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

    const stateProps = Object.keys(liveProps).reduce((acc, curr) => {
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
    }, {});

    return {
      ...componentBase,
      props: {
        ...props,
        ...(!this.props.skipChildren
          ? {
              children: React.Children.map(children, (child, index) =>
                this.renderInteractive(child, index, componentName)
              ),
            }
          : {}),
        // html element children should not be overwritten
        // children would not be interactive
        ...(!isHtmlElement ? stateProps : {}),
      },
    };
  }

  /**
   * Render function for Interact component
   */
  render() {
    const componentIds = Object.keys(this.state.liveProps);
    const componentName = getDisplayName(this.component);

    /**
     * Do not render elements that
     * doesn't make sense to interact with
     * (feel free to add some more)
     */
    if (['br', 'hr'].includes(componentName)) {
      return null;
    }

    return (
      <InteractContext.Provider
        value={{
          docgen: this.docgen,
          state: this.state,
          props: this.props,
          handleShowProps: this.handleShowProps,
          handleInputChange: this.handleInputChange,
          handleCheckboxChange: this.handleCheckboxChange,
          handleSelectChange: this.handleSelectChange,
          isDefaultValue: this.isDefaultValue,
        }}
      >
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
                <h3 className="h4 text-bold">{componentName}</h3>

                {this.renderInteractive(this.component)}

                {this.props.showCode && (
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
              {componentIds.map((id, index) => {
                const componentName = id.replace(/(\w+\d+)*(\w+)\d+$/g, '$2');

                // Keeps text children component visible all the time
                // and keep it in group with parent component
                // other components are collapsed
                const isPlainText = componentName === 'PlainText';
                const parentId = componentIds[index - 1];

                // set deepnes
                const deepness = (isPlainText ? parentId : id)
                  .replace(/(\w+\d+)*(\w+)\d+$/g, '$1')
                  .replace(/\w+?\d+?/g, '-').length;

                return (
                  <div
                    key={id}
                    style={{
                      marginLeft: `${deepness * 15}px`,
                    }}
                  >
                    {isPlainText ? (
                      <PropsGroup id={id} showId={parentId} />
                    ) : (
                      <React.Fragment>
                        <ButtonShowPropsGroup
                          {...{ id, componentName, deepness }}
                        />
                        <PropsGroup id={id} />
                      </React.Fragment>
                    )}
                  </div>
                );
              })}
            </GridCol>
          </Grid>
        </StyledInteract>
      </InteractContext.Provider>
    );
  }
}

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

const StyledSticky = styled.div`
  position: sticky;
  top: 0;
`;

export default Interact;
