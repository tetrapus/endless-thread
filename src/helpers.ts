export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function definitely<T>(x: T | undefined): T {
  if (isDefined(x)) {
    return x;
  }
  throw Error("I trusted you :(");
}

export function getValueByName(
  pairs: { name: string; value: string }[],
  name: string
) {
  const pair = pairs.find(pair => pair.name == name);
  return pair ? pair.value : undefined;
}
