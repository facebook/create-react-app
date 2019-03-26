let idx = 0;
const uuid = () => (idx += 1); // eslint-disable-line no-return-assign

export default function useId(name) {
  return `id${name ? `-${name}` : ''}-${uuid()}`;
}
