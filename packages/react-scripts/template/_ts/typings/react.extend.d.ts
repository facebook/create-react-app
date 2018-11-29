import 'react';

declare module 'react' {
  interface LazyComponentFactory<P = {}> {
    (): any;
  }

  export function lazy<P = {}>(
    factory: LazyComponentFactory
  ): React.ComponentType<P>;

  interface SuspensePropsType {
    fallback: React.ReactNode;
  }

  export const Suspense: React.SFC<SuspensePropsType>;
}
