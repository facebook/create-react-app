import {
  parseScenarioInitQueryString,
  setActiveScenario,
} from '@deskpro/apps-sdk/lib/Testing';

const scenarioProps = parseScenarioInitQueryString(location.search);
scenarioProps.instanceProps.appTitle = DPAPP_MANIFEST.title;
scenarioProps.instanceProps.appPackageName = DPAPP_MANIFEST.name;
scenarioProps.name = scenarioProps.name || 'default';

setActiveScenario(scenarioProps);
