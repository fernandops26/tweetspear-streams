export default function toTwitterRule(usernamesOrIds: Array<string>) {
  return usernamesOrIds.map((user) => `to:${user}`).join(' OR ');
}
