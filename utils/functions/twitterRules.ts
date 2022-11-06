export function fromTwitterRule(usernamesOrIds: Array<string>) {
  return usernamesOrIds.map((user) => `from:${user}`).join(' OR ');
}

export function toTwitterRule(usernamesOrIds: Array<string>) {
  return usernamesOrIds.map((user) => `to:${user}`).join(' OR ');
}
