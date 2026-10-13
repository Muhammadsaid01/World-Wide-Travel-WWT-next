import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { changeAppLanguage, LANGUAGE_STORAGE_KEY, normalizeLanguage } from './index';

export default function LanguageProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
		void changeAppLanguage(normalizeLanguage(savedLanguage));
	}, []);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
