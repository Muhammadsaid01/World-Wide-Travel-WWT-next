import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';

import light from '@/scss/MaterialTheme';
import '@/scss/main.scss';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={light}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
