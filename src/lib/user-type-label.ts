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
  if (normalized === 'real_estate_agency') return 'Real Estate Agency';
  if (normalized === 'landlord') return 'Landlord';
  if (normalized === 'service_provider') return 'Service Provider';
  if (normalized === 'home_seeker') return 'Seeker';
  if (normalized === 'admin') return 'Admin';

  if (authRole === 'home_seeker' || authRole === 'seeker') return 'Seeker';
  if (authRole === 'provider') return 'Service Provider';
  if (authRole === 'landlord') return 'Landlord';
  if (authRole === 'admin') return 'Admin';

  return authRole.replace(/_/g, ' ');
}

/** Agent vs landlord label for a property owner (Managed By card, etc.). */
export function getPropertyOwnerRegistrationLabel(property: {
  landlordId?: unknown;
  agentId?: unknown;
}): 'Agent' | 'Real Estate Agency' | 'Landlord' {
  const landlordType = readUserType(property.landlordId);
  if (landlordType === 'real_estate_agency') return 'Real Estate Agency';
  if (landlordType === 'agent') return 'Agent';
  if (landlordType === 'landlord') return 'Landlord';

  const agentType = readUserType(property.agentId);
  if (agentType === 'real_estate_agency') return 'Real Estate Agency';
  if (agentType === 'agent') return 'Agent';
  if (agentType === 'landlord') return 'Landlord';

  if (property.agentId) return 'Agent';
  return 'Landlord';
}

/** Whether a property was posted by an agent or real estate agency (used for agent fee, labels, etc.). */
export function isAgentListedProperty(property: {
  landlordId?: unknown;
  agentId?: unknown;
}): boolean {
  const label = getPropertyOwnerRegistrationLabel(property);
  return label === 'Agent' || label === 'Real Estate Agency';
}

/** Whether a property was posted by an admin user. */
export function isAdminListedProperty(property: {
  landlordId?: unknown;
}): boolean {
  const landlordType = readUserType(property.landlordId);
  return landlordType === 'admin' || landlordType === 'admin_property';
}

/**
 * Whether the agent fee section should be displayed for a property.
 * - Always show for agent / real-estate-agency listings that have a fee.
 * - Show for admin-listed properties only when published (status === 'approved').
 */
export function shouldShowAgentFee(property: {
  landlordId?: unknown;
  agentId?: unknown;
  agentFee?: number | null;
  status?: string;
}): boolean {
  if (property.agentFee == null || property.agentFee <= 0) return false;
  if (isAgentListedProperty(property)) return true;
  if (isAdminListedProperty(property) && property.status === 'approved') return true;
  return false;
}
