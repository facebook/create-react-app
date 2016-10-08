export default function* userGenerator() {
  let i = 1;
  while (true) {
    yield `User ${i}`;
    i++;
  }
}
