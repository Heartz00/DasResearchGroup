'use client';
import { useActionState } from 'react';
import { changeAccess, createAccount } from '@/app/admin/actions';
const roles = [
  ['editor', 'Editor — manage pages and all posts'],
  ['author', 'Author — manage own posts'],
  ['contributor', 'Contributor — draft posts for review'],
  ['subscriber', 'No editing access'],
];
function RoleSelect({ value = 'contributor' }: { value?: string }) {
  return (
    <label>
      Access level
      <select name="role" defaultValue={value}>
        {roles.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function AccessForm({ id, role }: { id: number; role: string }) {
  const [state, action, pending] = useActionState(changeAccess, {});
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="user_id" value={id} />
      <RoleSelect value={role} />
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="admin-success">
          {state.success}
        </p>
      )}
      <button className="button button-dark" disabled={pending}>
        {pending ? 'Updating…' : 'Update access'}
      </button>
    </form>
  );
}
export function NewAccountForm() {
  const [state, action, pending] = useActionState(createAccount, {});
  return (
    <form action={action} className="admin-form">
      <label>
        Full name
        <input name="name" required maxLength={100} />
      </label>
      <label>
        Username
        <input
          name="username"
          required
          minLength={2}
          maxLength={60}
          autoComplete="off"
        />
      </label>
      <label>
        Email address
        <input type="email" name="email" required maxLength={254} />
      </label>
      <RoleSelect />
      <p className="muted">
        Creates a site account. SMU may restrict new accounts or require
        institutional sign-in. Each member uses their own credentials; do not
        share yours.
      </p>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="admin-success">
          {state.success}
        </p>
      )}
      <button className="button button-red" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
