import { createApp } from 'frint';
import { RegionService } from 'frint-react';

import 'user-assets/animations.css';
import AuthEntry from './AuthEntry';

export default createApp({
  name: 'Auth',
  providers: [
    {
      name: 'component',
      useValue: AuthEntry,
    },
    {
      name: 'region',
      useClass: RegionService, // `useClass` because `RegionService` will be instantiated
    },
  ],
});
