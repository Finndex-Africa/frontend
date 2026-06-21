function readUserType(ref: unknown): string | undefined {
  if (ref && typeof ref === 'object') {
    const userType = (ref as Record<string, unknown>).userType;
    if (typeof userType === 'string') return userType.toLowerCase();
  }
  return undefined;
}

/** Label for the logged-in user in the nav profile card. Uses stored userType only. */
export function getLoggedInUserTypeLabel(
  userType: string | undefined | null,
  authRole: string,
): string {
  const normalized = (userType || '').toLowerCase();
  if (normalized === 'agent') return 'Agent';
  if (normalized === 'landlord') return 'Landlord';
  if (normalized === 'service_provider') return 'Service Provider';
  if (normalized === 'home_seeker') return 'Home Seeker';
  if (normalized === 'admin') return 'Admin';

  if (authRole === 'home_seeker' || authRole === 'seeker') return 'Home Seeker';
  if (authRole === 'provider') return 'Service Provider';
  if (authRole === 'landlord') return 'Landlord';
  if (authRole === 'admin') return 'Admin';

  return authRole.replace(/_/g, ' ');
}

/** Agent vs landlord label for a property owner (Managed By card, etc.). */
export function getPropertyOwnerRegistrationLabel(property: {
  landlordId?: unknown;
  agentId?: unknown;
}): 'Agent' | 'Landlord' {
  const landlordType = readUserType(property.landlordId);
  if (landlordType === 'agent') return 'Agent';
  if (landlordType === 'landlord') return 'Landlord';

  const agentType = readUserType(property.agentId);
  if (agentType === 'agent') return 'Agent';
  if (agentType === 'landlord') return 'Landlord';

  if (property.agentId) return 'Agent';
  return 'Landlord';
}

/** Whether a property was posted by an agent (used for agent fee, labels, etc.). */
export function isAgentListedProperty(property: {
  landlordId?: unknown;
  agentId?: unknown;
}): boolean {
  return getPropertyOwnerRegistrationLabel(property) === 'Agent';
}
