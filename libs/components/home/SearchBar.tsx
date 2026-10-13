import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import Search from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

export default function SearchBar() {
	const { t } = useTranslation(['home', 'common']);
	const [text, setText] = useState('');
	const router = useRouter();
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const query = text.trim();
		void router.push({ pathname: '/package', query: query ? { text: query } : {} });
	}
	return (
		<form className="home-search" role="search" aria-label={t('search.aria')} onSubmit={submit}>
			<PlaceOutlined aria-hidden="true" />
			<label htmlFor="home-package-search">
				<strong>{t('search.destination')}</strong>
				<input id="home-package-search" placeholder={t('search.destinationPlaceholder')} value={text}
					onChange={(event) => setText(event.target.value)} />
			</label>
			<Button type="submit" variant="contained" startIcon={<Search />}>{t('actions.search', { ns: 'common' })}</Button>
		</form>
	);
}
