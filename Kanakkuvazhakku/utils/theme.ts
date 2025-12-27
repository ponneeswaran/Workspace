// utils/theme.ts

export const lightTheme = {
  colors: {
    background: '#F1F5F9', // slate-100
    text: '#1E293B',     // slate-800
    primary: '#0D9488',    // teal-600
    secondary: '#94A3B8',  // slate-400
    cardBackground: '#FFFFFF',
    borderColor: '#E2E8F0', // slate-200
  },
};

export const darkTheme = {
  colors: {
    background: '#1E293B', // slate-800
    text: '#F1F5F9',     // slate-100
    primary: '#2DD4BF',    // teal-400
    secondary: '#64748B',  // slate-500
    cardBackground: '#334155', // slate-700
    borderColor: '#475569', // slate-600
  },
};

export type Theme = typeof lightTheme;
