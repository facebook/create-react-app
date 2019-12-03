import React from 'react';
import Table from './Table';

import { Code } from './../';

export default Table;

const DocsTable = ({
  columns = [
    {
      key: 'prop',
      label: 'Prop',
    },
    {
      key: 'type',
      label: 'Type',
      render: (data, column) => (
        <td key={column.key}>
          <Code language="javascript" inline={false}>
            {data}
          </Code>
        </td>
      ),
    },
    {
      key: 'default',
      label: 'Default',
      render: (data, column) => (
        <td key={column.key}>
          <Code language="javascript" inline={false}>
            {data}
          </Code>
        </td>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (data, column) => <td key={column.key}>{data}</td>,
    },
  ],
  hasOutsideBorder = true,
  ...other
}) => (
  <Table columns={columns} hasOutsideBorder={hasOutsideBorder} {...other} />
);
export { DocsTable };
