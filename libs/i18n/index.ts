import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/public/locales/en/common.json';
import enHome from '@/public/locales/en/home.json';
import enPackages from '@/public/locales/en/packages.json';
import enAgents from '@/public/locales/en/agents.json';
import enCommunity from '@/public/locales/en/community.json';
import enProfile from '@/public/locales/en/profile.json';
import enSupport from '@/public/locales/en/support.json';
import enAuth from '@/public/locales/en/auth.json';
import enChat from '@/public/locales/en/chat.json';
import koCommon from '@/public/locales/kr/common.json';
import koHome from '@/public/locales/kr/home.json';
import koPackages from '@/public/locales/kr/packages.json';
import koAgents from '@/public/locales/kr/agents.json';
import koCommunity from '@/public/locales/kr/community.json';
import koProfile from '@/public/locales/kr/profile.json';
import koSupport from '@/public/locales/kr/support.json';
import koAuth from '@/public/locales/kr/auth.json';
import koChat from '@/public/locales/kr/chat.json';
import ruCommon from '@/public/locales/ru/common.json';
import ruHome from '@/public/locales/ru/home.json';
import ruPackages from '@/public/locales/ru/packages.json';
import ruAgents from '@/public/locales/ru/agents.json';
import ruCommunity from '@/public/locales/ru/community.json';
import ruProfile from '@/public/locales/ru/profile.json';
import ruSupport from '@/public/locales/ru/support.json';
import ruAuth from '@/public/locales/ru/auth.json';
import ruChat from '@/public/locales/ru/chat.json';
import uzCommon from '@/public/locales/uz/common.json';
import uzHome from '@/public/locales/uz/home.json';
import uzPackages from '@/public/locales/uz/packages.json';
import uzAgents from '@/public/locales/uz/agents.json';
import uzCommunity from '@/public/locales/uz/community.json';
import uzProfile from '@/public/locales/uz/profile.json';
import uzSupport from '@/public/locales/uz/support.json';
import uzAuth from '@/public/locales/uz/auth.json';
import uzChat from '@/public/locales/uz/chat.json';

export const APP_LANGUAGES = ['en', 'ko', 'ru', 'uz'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];
export const LANGUAGE_STORAGE_KEY = 'wwt-language';

export const languageOptions: ReadonlyArray<{ code: AppLanguage; legacyCode?: string; label: string; flagSrc: string }> = [
	{ code: 'en', label: 'English', flagSrc: '/images/flags/gb.svg' },
	{ code: 'ko', legacyCode: 'kr', label: '한국어', flagSrc: '/images/flags/kr.svg' },
	{ code: 'ru', label: 'Русский', flagSrc: '/images/flags/ru.svg' },
	{ code: 'uz', label: 'O‘zbekcha', flagSrc: '/images/flags/uz.svg' },
];

const resources = {
	en: { common: enCommon, home: enHome, packages: enPackages, agents: enAgents, community: enCommunity, profile: enProfile, support: enSupport, auth: enAuth, chat: enChat },
	ko: { common: koCommon, home: koHome, packages: koPackages, agents: koAgents, community: koCommunity, profile: koProfile, support: koSupport, auth: koAuth, chat: koChat },
	ru: { common: ruCommon, home: ruHome, packages: ruPackages, agents: ruAgents, community: ruCommunity, profile: ruProfile, support: ruSupport, auth: ruAuth, chat: ruChat },
	uz: { common: uzCommon, home: uzHome, packages: uzPackages, agents: uzAgents, community: uzCommunity, profile: uzProfile, support: uzSupport, auth: uzAuth, chat: uzChat },
} as const;

export function normalizeLanguage(value?: string | null): AppLanguage {
	const code = value?.toLowerCase().split('-')[0];
	if (code === 'kr') return 'ko';
	return APP_LANGUAGES.includes(code as AppLanguage) ? (code as AppLanguage) : 'en';
}

if (!i18n.isInitialized) {
	void i18n.use(initReactI18next).init({
		resources,
		initAsync: false,
		lng: 'en',
		fallbackLng: 'en',
		supportedLngs: APP_LANGUAGES,
		defaultNS: 'common',
		fallbackNS: 'common',
		interpolation: { escapeValue: false },
		returnNull: false,
		react: { useSuspense: false },
	});
}

export async function changeAppLanguage(language: AppLanguage) {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
		document.cookie = `${LANGUAGE_STORAGE_KEY}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
		document.documentElement.lang = language;
	}
	await i18n.changeLanguage(language);
}

export default i18n;
