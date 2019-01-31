import React from 'react';
import { createApp } from 'frint';

import RootEntry from './RootEntry';

export default createApp({
  name: 'Root',
  providers: [
    {
      name: 'component',
      useValue: RootEntry,
    },
  ],
});
