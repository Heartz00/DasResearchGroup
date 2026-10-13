export const accessRoles = [
  'editor',
  'author',
  'contributor',
  'subscriber',
] as const;
export function accessRole(value: string) {
  if (!accessRoles.includes(value as (typeof accessRoles)[number]))
    throw new Error('Choose an allowed content role.');
  return value;
}
export function canManageAccess(caps: Record<string, boolean>) {
  return !!(caps.list_users || caps.create_users || caps.promote_users);
}
export function editableAccount(id: number, ownId: number, roles: string[]) {
  if (id === ownId) throw new Error('Your own access cannot be changed here.');
  if (
    !roles.length ||
    roles.some(
      (role) => !accessRoles.includes(role as (typeof accessRoles)[number]),
    )
  )
    throw new Error('This account is managed by site or SMU administration.');
}
export function allowedAdminPath(path: string) {
  return /^(?:users(?:\/(?:me|[1-9]\d*))?|(?:pages|posts|media|categories|tags)(?:\/[1-9]\d*(?:\/revisions)?)?)$/.test(
    path.split('?')[0],
  );
}
