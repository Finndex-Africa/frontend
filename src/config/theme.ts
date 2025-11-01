import type { ThemeConfig } from 'antd';

export const designTokens = {
  colors: {
    brand: '#1890FF',
    primary: '#1890FF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
    accent: '#FF9500',
    text: '#000000D9',
    muted: '#00000073',
    disabled: '#00000040',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  shadows: {
    base: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px'
  },
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px'
  },
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  borderRadius: {
    sm: '2px',
    base: '4px',
    lg: '8px',
    full: '9999px'
  }
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: designTokens.colors.brand,
    colorSuccess: designTokens.colors.success,
    colorWarning: designTokens.colors.warning,
    colorError: designTokens.colors.error,
    colorInfo: designTokens.colors.info,
    borderRadius: 8,
    fontFamily: designTokens.fonts.primary,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F5F5F5',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#1890FF10',
      itemSelectedColor: designTokens.colors.brand,
      itemHoverBg: '#1890FF08',
    },
  },
};