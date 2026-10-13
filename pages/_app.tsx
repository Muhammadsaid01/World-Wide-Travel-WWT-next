import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

import { getApolloClient } from '@/apollo/client';
import { restoreUserFromToken } from '@/libs/auth';
import LanguageProvider from '@/libs/i18n/LanguageProvider';
import light from '@/scss/MaterialTheme';
import '@/scss/main.scss';

export default function App({ Component, pageProps }: AppProps) {
  const [apolloClient] = useState(getApolloClient);

  useEffect(() => {
    restoreUserFromToken();
  }, []);

  return (
    <LanguageProvider>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={light}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </LanguageProvider>
  );
}
