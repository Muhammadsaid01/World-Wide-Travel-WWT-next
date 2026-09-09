import type { ThemeOptions } from '@mui/material/styles';

const typography: ThemeOptions['typography'] = {
  fontFamily: '"Inter", "Arial", sans-serif',

  h1: {
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  h2: {
    fontSize: '30px',
    fontWeight: 700,
    lineHeight: 1.25,
  },

  h3: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.3,
  },

  h4: {
    fontSize: '20px',
    fontWeight: 600,
  },

  h5: {
    fontSize: '18px',
    fontWeight: 600,
  },

  h6: {
    fontSize: '16px',
    fontWeight: 600,
  },

  body1: {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.6,
  },

  body2: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  subtitle1: {
    fontSize: '15px',
    fontWeight: 600,
  },

  subtitle2: {
    fontSize: '13px',
    fontWeight: 600,
  },

  caption: {
    fontSize: '12px',
    fontWeight: 400,
  },

  button: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'none',
  },
};

export default typography;