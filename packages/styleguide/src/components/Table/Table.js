import React from 'react';
import { arrayOf, bool, object, shape, string } from 'prop-types';
import styled from 'styled-components';
import { rem } from '../../style/utils';

const propTypes = {
  /** Labels for columns in the table. Value of the key in columns match with the key name in data */
  columns: arrayOf(
    shape({
      key: string.isRequired,
      label: string
    })
  ),
  /** Data to print out in the table. */
  data: arrayOf(object),
  hasOutsideBorder: bool,
  isResponsive: bool
};

const defaultProps = {
  hasOutsideBorder: true,
  isResponsive: true
};

const Table = ({ columns = [], data = [], isResponsive, ...other }) => {
  function noLabel(element) {
    return element.label === '';
  }

  const tableHead = columns.every(noLabel) ? null : (
    <thead>
      <tr>
        {columns.map((column, i) => <th key={i.toString()}>{column.label}</th>)}
      </tr>
    </thead>
  );

  const table = (
    <StyledTable {...other}>
      {tableHead}
      <tbody>
        {data.map((row, i) => (
          <tr key={i.toString()}>
            {columns.map(
              column =>
                column.render ? (
                  column.render(row[column.key], column)
                ) : (
                  <td key={column.key}>{row[column.key]}</td>
                )
            )}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
  return isResponsive ? (
    <StyledResponsiveTable>{table}</StyledResponsiveTable>
  ) : (
    table
  );
};

const border = (theme, size = '1px') =>
  `${size} solid ${theme.colors.greyDarker}`;

const StyledResponsiveTable = styled.div`
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
`;

const StyledTable = styled.table`
  font-family: ${props => props.theme.fontFamily};
  color: ${props => props.theme.colors.black};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};

  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: ${props => props.theme.contentSpacing};
  max-width: 100%;
  width: 100%;

  font-size: ${props => rem(props.theme.fontSizes.tiny)};

  thead tr {
    background-color: ${props => props.theme.colors.grey};
  }

  th {
    border: ${props => border(props.theme)};
    border-width: 0 1px;
    vertical-align: middle;
    text-align: left;

    font-weight: ${props => props.theme.fontWeights.normal};
  }

  th,
  td {
    padding: ${props => rem(props.theme.spaces.small)};

    &:first-child {
      ${props =>
        !props.hasOutsideBorder &&
        `
          border-left-width: 0;
        `};
    }

    &:last-child {
      ${props =>
        !props.hasOutsideBorder &&
        `
          border-right-width: 0;
        `};
    }
  }

  td {
    min-height: ${rem('48px')};
    border: ${props => border(props.theme)};
    vertical-align: top;

    & > *:last-child {
      margin-bottom: 0;
    }
  }

  tr:last-child td {
    ${props =>
      !props.hasOutsideBorder &&
      `
        border-bottom-width: 0;
      `};
  }
`;

Table.displayName = 'Table';
Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
