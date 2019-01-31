import React from 'react';
import { createApp } from 'frint';

import RootEntry from './RootComponent';

export default createApp({
  name: 'Root',
  providers: [
    {
      name: 'component',
      useValue: RootEntry,
    },
  ],
});
