/** Backend user types that can set agent fees and have agent-like permissions. */
export const AGENT_LIKE_USER_TYPES = ['agent', 'real_estate_agency'] as const;

export type AgentLikeUserType = (typeof AGENT_LIKE_USER_TYPES)[number];

export function isAgentLikeUserType(userType: string | undefined | null): boolean {
  const normalized = (userType || '').toLowerCase();
  return (AGENT_LIKE_USER_TYPES as readonly string[]).includes(normalized);
}
