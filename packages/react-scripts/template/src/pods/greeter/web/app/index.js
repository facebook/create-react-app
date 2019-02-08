import { createApp } from 'frint';
import { RegionService } from 'frint-react';

import Greeter from './screens/Greeter';

export default createApp({
  name: 'Greeter',
  providers: [
    {
      name: 'component',
      useValue: Greeter,
    },
    {
      name: 'region',
      useClass: RegionService, // `useClass` because `RegionService` will be instantiated
    },
  ],
});
