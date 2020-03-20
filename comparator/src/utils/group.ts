type Group<T> = {
  id: any,
  items: T[],
};

function groupWithMatch<T>(
  items: T[],
  matches: (a: T, b: T) => boolean,
  id: (item: T) => any
): Group<T>[] {
  const groups = [];

  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    const group: Group<T> = {
      id: id(a),
      items: [],
    };

    // Because we remove stuff from the array, we look in reverse order.
    for (let j = items.length-1; j >= 0; j--) {
      if (i === j) {
        continue;
      }
      const b = items[j];
      if (matches(a, b)) {
        group.items.push(b);
        items.splice(j, 1);
      }
    }

    // Because we avoid filling the array, if a match is found, the original
    // element is added to the beginning of the group array.
    if (group.items.length > 0) {
      group.items.unshift(a);
      groups.push(group);
    }
  }

  return groups;
}

export default groupWithMatch;