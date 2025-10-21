/**
 * Design System Theme Configuration
 * Based on specified color palette with WCAG AA compliant contrast ratios
 */

export const designTokens = {
  colors: {
    // Primary palette
    background: '#F6F8FA',
    brand: '#2563EB',
    accent: '#0EA5A4',
    text: '#111827',
    muted: '#6B7280',

    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutral scale
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Brand variants
    brandLight: '#3B82F6',
    brandDark: '#1E40AF',
    accentLight: '#14B8B7',
    accentDark: '#0D7C7B',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

/**
 * Ant Design Theme Configuration
 * Customized to match the design system
 */
export const antdTheme = {
  token: {
    // Color tokens
    colorPrimary: designTokens.colors.brand,
    colorSuccess: designTokens.colors.success,
    colorWarning: designTokens.colors.warning,
    colorError: designTokens.colors.error,
    colorInfo: designTokens.colors.info,
    colorTextBase: designTokens.colors.text,
    colorBgBase: designTokens.colors.white,
    colorBgLayout: designTokens.colors.background,

    // Typography
    fontSize: 16,
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Spacing
    borderRadius: 8,

    // Shadows - subtle, no flashy effects
    boxShadow: designTokens.shadows.sm,
    boxShadowSecondary: designTokens.shadows.base,

    // Motion - minimal animations
    motionUnit: 0.05,
    motionBase: 0,
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  components: {
    Layout: {
      headerBg: designTokens.colors.white,
      bodyBg: designTokens.colors.background,
      triggerBg: designTokens.colors.gray100,
    },

    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: designTokens.colors.brand,
      itemSelectedColor: designTokens.colors.white,
      itemHoverBg: designTokens.colors.gray100,
      activeBarBorderWidth: 0,
    },

    Card: {
      borderRadiusLG: 8,
    },

    Table: {
      borderColor: designTokens.colors.gray200,
      headerBg: designTokens.colors.gray50,
    },

    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },

    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      colorBorder: designTokens.colors.gray300,
    },

    Select: {
      controlHeight: 40,
    },

    DatePicker: {
      controlHeight: 40,
    },
  },
};

export default antdTheme;
