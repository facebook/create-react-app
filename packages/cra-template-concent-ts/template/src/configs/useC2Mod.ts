import { useConcent } from 'concent';
import { CtxM, Modules } from '../types/store';

/**
 * use the target model context you want by passing a module name
 * @param moduleName
 */
export function useC2Mod<T extends Modules>(moduleName: T) {
  type Ctx = CtxM<{}, typeof moduleName>;
  return useConcent<{}, Ctx>(moduleName);
}
