import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

/**
 * NOTIFICATION BADGE
 * Navbar notification bell uchun.
 */
export const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontSize: 10,
    fontWeight: 700,
    border: '2px solid #FFFFFF',
  },
}));

/**
 * WWT SWITCH
 * Settings va admin/user toggle'lar uchun.
 */
export const WWTSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,

  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '200ms',

    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#FFFFFF',

      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },

      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },

    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[300],
    },

    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.4,
    },
  },

  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },

  '& .MuiSwitch-track': {
    borderRadius: 13,
    backgroundColor: '#CBD5E1',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 200,
    }),
  },
}));

/**
 * WWT TEXT FIELD
 * Login, signup, booking, profile va package form uchun.
 */
export const WWTTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    transition: theme.transitions.create([
      'border-color',
      'box-shadow',
      'background-color',
    ]),

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D5DB',
    },

    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#9CA3AF',
    },

    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha(
        theme.palette.primary.main,
        0.1,
      )}`,
    },

    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },

    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.error.main,
    },
  },

  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,

    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },

  '& .MuiFormHelperText-root': {
    marginLeft: 2,
    marginTop: 5,
  },
}));

/**
 * ORANGE CTA BUTTON
 * Coupon, booking yoki special offer CTA uchun.
 */
export const OrangeButton = styled(Button)(({ theme }) => ({
  minHeight: 40,
  borderRadius: 6,
  padding: '9px 18px',
  backgroundColor: theme.palette.secondary.main,
  color: '#FFFFFF',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
    boxShadow: 'none',
  },

  '&:disabled': {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
  },
}));

/**
 * NAVY BUTTON
 * Search, Login, main CTA va primary actionlar uchun.
 */
export const PrimaryButton = styled(Button)(({ theme }) => ({
  minHeight: 40,
  borderRadius: 6,
  padding: '9px 18px',
  backgroundColor: theme.palette.primary.main,
  color: '#FFFFFF',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: 'none',
  },

  '&:disabled': {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
  },
}));

/**
 * OUTLINED BUTTON
 * View Profile, Back, Cancel kabi secondary actionlar uchun.
 */
export const OutlineButton = styled(Button)(({ theme }) => ({
  minHeight: 40,
  borderRadius: 6,
  padding: '8px 18px',
  backgroundColor: '#FFFFFF',
  border: '1px solid #D1D5DB',
  color: theme.palette.primary.main,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: '#F8FAFC',
    borderColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
}));