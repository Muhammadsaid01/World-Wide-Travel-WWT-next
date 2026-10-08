import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import Navbar from '@/libs/components/common/Navbar';
import Footer from '@/libs/components/common/Footer';
import ChatWidget from '@/libs/components/common/ChatWidget/ChatWidget';

export function PublicLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const style: CSSProperties & Record<`--wwt-${string}`, string> = {
    '--wwt-primary': theme.palette.primary.main,
    '--wwt-accent': theme.palette.secondary.main,
    '--wwt-paper': theme.palette.background.paper,
    '--wwt-background': theme.palette.background.default,
    '--wwt-text': theme.palette.text.primary,
    '--wwt-muted': theme.palette.text.secondary,
    '--wwt-divider': theme.palette.divider,
  };

  return (
    <div className="wwt-public-layout" style={style}>
      <a className="wwt-skip-link" href="#wwt-page-content">Skip to content</a>
      <Navbar />
      <main id="wwt-page-content" className="wwt-page-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function withLayout<P extends object>(Page: ComponentType<P>) {
  function PageWithLayout(props: P) {
    return <PublicLayout><Page {...props} /></PublicLayout>;
  }

  PageWithLayout.displayName = `withLayout(${Page.displayName ?? Page.name ?? 'Page'})`;
  return PageWithLayout;
}
