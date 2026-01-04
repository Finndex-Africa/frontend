/**
 * Role Mapper Utility
 * Maps between frontend auth context roles and backend API roles
 */

type FrontendRole = 'guest' | 'seeker' | 'landlord' | 'provider' | 'admin';
type BackendRole = 'guest' | 'home_seeker' | 'landlord' | 'agent' | 'service_provider' | 'admin';

/**
 * Map frontend role to backend role
 */
export function toBackendRole(frontendRole: FrontendRole): BackendRole {
  const mapping: Record<FrontendRole, BackendRole> = {
    guest: 'guest',
    seeker: 'home_seeker',
    landlord: 'landlord',
    provider: 'service_provider',
    admin: 'admin',
  };
  return mapping[frontendRole];
}

/**
 * Map backend role to frontend role
 */
export function toFrontendRole(backendRole: BackendRole): FrontendRole {
  const mapping: Record<BackendRole, FrontendRole> = {
    guest: 'guest',
    home_seeker: 'seeker',
    landlord: 'landlord',
    agent: 'landlord', // Agent has same privileges as landlord
    service_provider: 'provider',
    admin: 'admin',
  };
  return mapping[backendRole];
}

/**
 * Check if a user role has access to a feature
 */
export function hasAccess(userRole: FrontendRole | BackendRole, allowedRoles: Array<FrontendRole | BackendRole>): boolean {
  // Normalize to frontend role for comparison
  const normalizedUserRole = isFrontendRole(userRole) ? userRole : toFrontendRole(userRole as BackendRole);
  const normalizedAllowedRoles = allowedRoles.map(role =>
    isFrontendRole(role) ? role : toFrontendRole(role as BackendRole)
  );

  return normalizedAllowedRoles.includes(normalizedUserRole);
}

/**
 * Type guard to check if role is frontend role
 */
function isFrontendRole(role: string): role is FrontendRole {
  return ['guest', 'seeker', 'landlord', 'provider', 'admin'].includes(role);
}
