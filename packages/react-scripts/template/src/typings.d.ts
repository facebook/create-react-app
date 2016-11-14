/* import all svg files as strings */
declare module '*.svg' {
    const __path__: string;
    export default __path__;
}
