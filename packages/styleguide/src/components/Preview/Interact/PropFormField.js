import React from 'react';

import PropInput from './PropInput';
import PropCheckbox from './PropCheckbox';
import PropSelect from './PropSelect';

import InteractContext from './state';

import { is } from './helpers';

const PropFormField = ({ id, name }) => {
  let field;

  const fieldProps = {
    inputProps: {
      key: name,
      id: name,
      name,
      'data-component-id': id,
    },
    componentInfo: {
      id,
      name,
    },
  };

  return (
    <InteractContext.Consumer>
      {({ docgen, isDefaultValue }) => {
        const propInfo = docgen.liveProps[id][name];

        if (propInfo.type) {
          const type = propInfo.type.name;

          if (is(type, 'string') || is(type, 'number')) {
            field = <PropInput {...fieldProps} />;
          } else if (is(type, 'bool')) {
            field = <PropCheckbox {...fieldProps} />;
          } else if (is(type, 'enum')) {
            field = <PropSelect {...fieldProps} />;
          } else {
            field = <PropInput {...fieldProps} type={type} isDisabled />;
            /*
            any, array, func, object, node, element, symbol, 
            instanceOf, oneOfType, arrayOf, objectOf, shape, custom

            these types of props cannot be parsed because their value in 
            __docgenInfo defaultValue.value is very complex form but is stored
            as a simple string not a JSON, so its impossible for now to parse them
            */
          }
        }

        return (
          <div>
            {field}
            {isDefaultValue(id, name) && (
              <div style={{ color: 'grey' }}>
                <small>Default</small>
              </div>
            )}
          </div>
        );
      }}
    </InteractContext.Consumer>
  );
};

export default PropFormField;
