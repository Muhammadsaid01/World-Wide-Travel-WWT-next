import { createTheme } from '@mui/material/styles';
import shadow from './shadow';
import typography from './typography';

const light = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#0B2D4F',
      light: '#184A73',
      dark: '#071F37',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#B85C0B',
      light: '#D97706',
      dark: '#92400E',
      contrastText: '#FFFFFF',
    },

    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },

    divider: '#E5E7EB',

    success: {
      main: '#16A34A',
    },

    warning: {
      main: '#D97706',
    },

    error: {
      main: '#DC2626',
    },

    info: {
      main: '#2563EB',
    },
  },

  typography,

  shadows: shadow,

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },

        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#F7F8FA',
          color: '#111827',
        },

        '*': {
          boxSizing: 'border-box',
        },

        a: {
          color: 'inherit',
          textDecoration: 'none',
        },

        p: {
          margin: 0,
        },

        button: {
          fontFamily: 'inherit',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 6,
          padding: '9px 18px',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'none',

          '&.MuiButton-containedPrimary': {
            backgroundColor: '#0B2D4F',
            color: '#FFFFFF',

            '&:hover': {
              backgroundColor: '#071F37',
            },
          },

          '&.MuiButton-containedSecondary': {
            backgroundColor: '#B85C0B',
            color: '#FFFFFF',

            '&:hover': {
              backgroundColor: '#92400E',
            },
          },

          '&.MuiButton-outlined': {
            borderColor: '#D1D5DB',

            '&:hover': {
              borderColor: '#0B2D4F',
              backgroundColor: '#F8FAFC',
            },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 6,
          backgroundColor: '#FFFFFF',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D1D5DB',
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9CA3AF',
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0B2D4F',
            borderWidth: 1,
          },

          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DC2626',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          backgroundImage: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#E5E7EB',
          color: '#0B2D4F',
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#0B2D4F',
          },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#0B2D4F',
          },
        },
      },
    },
  },
});

export default light;