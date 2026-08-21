// Shared secret used to verify that internal entity-trigger workflows (not an
// arbitrary caller who knows the function URL) are the ones invoking these
// service-role functions. The same value is hardcoded into the matching
// workflow .jsonc files' "with.args.internal_token" — it is never sent to the
// frontend or exposed to app users, so a literal constant here is safe.
export const INTERNAL_WORKFLOW_TOKEN = 'wf_9f3a71c2e8b64d1aa5c07f4e2b6d9c31';

export function isValidInternalToken(body: any): boolean {
  return !!body && body.internal_token === INTERNAL_WORKFLOW_TOKEN;
}