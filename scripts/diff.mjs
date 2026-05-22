// scripts/diff.mjs
export function stableStringify(v) {
  if (Array.isArray(v)) {
    const items = v.map(stableStringify);
    items.sort();
    return `[${items.join(',')}]`;
  }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

export function diffDatasets(oldArr, newArr, keyField) {
  const newMap = new Map(newArr.map(o => [o[keyField], o]));
  const added = [];
  const changed = [];

  if (oldArr == null) {
    return { added: newArr.map(o => o[keyField]), changed: [] };
  }
  const oldMap = new Map(oldArr.map(o => [o[keyField], o]));

  for (const [key, nv] of newMap) {
    const ov = oldMap.get(key);
    if (ov === undefined) { added.push(key); continue; }
    if (stableStringify(ov) === stableStringify(nv)) continue;
    const fields = [];
    for (const f of new Set([...Object.keys(ov), ...Object.keys(nv)])) {
      if (stableStringify(ov[f]) !== stableStringify(nv[f])) fields.push(f);
    }
    changed.push({ key, fields });
  }
  return { added, changed };
}
