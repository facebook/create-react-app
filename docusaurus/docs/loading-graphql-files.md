---
id: loading-graphql-files
title: Loading .graphql Files
sidebar_label: Loading .graphql Files
---

To load `.gql` and `.graphql` files with [`graphql-tag`](https://www.npmjs.com/package/graphql-tag). The package is already coming with [`@apollo/client`](https://www.npmjs.com/package/@apollo/client). You may install the package if you are not using [`@apollo/client`](https://www.npmjs.com/package/@apollo/client):

```sh
npm install --save graphql-tag
```

Alternatively you may use `yarn`:

```sh
yarn add graphql graphql-tag
```

Then, whenever you want to load `.gql` or `.graphql` files, you can import with simple syntax:

```js
import query from './foo.graphql';
```

And your results get automatically inlined! This means that if the file above, `foo.graphql`, contains the following:

```graphql
query {
  hello {
    world
  }
}
```

The previous example turns into:

```javascript
const query = {
  'kind': 'Document',
  'definitions': [{
    ...
  }],
  'loc': {
    ...
    'source': {
      'body': '\\\\n  query {\\\\n    hello {\\\\n      world\\\\n    }\\\\n  }\\\\n',
      'name': 'GraphQL request',
      ...
    }
  }
};
```

You can also use the `gql` template tag directly from `graphql-tag` package with the added benefit of inlined parsing results.

```js
import gql from 'graphql-tag';

const query = gql`
  query User {
    user(id: 5) {
      lastName
      ...UserEntry1
    }
  }
`;
```
