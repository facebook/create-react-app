import { createApp } from 'frint';
import { RegionService } from 'frint-react';

import 'user-assets/animations.css';
import AuthEntry from './AuthEntry';
import SignoutEntry from './SignoutEntry';

const entries = [
  { name: 'Auth', Component: AuthEntry },
  { name: 'Signout', Component: SignoutEntry },
];

const apps = entries.map(entry =>
  createApp({
    name: entry.name,
    providers: [
      {
        name: 'component',
        useValue: entry.Component,
      },
      {
        name: 'region',
        useClass: RegionService, // `useClass` because `RegionService` will be instantiated
      },
    ],
  })
);

export default apps;
