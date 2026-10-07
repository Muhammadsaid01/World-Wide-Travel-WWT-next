import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import Search from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';

export default function SearchBar() {
	const [text, setText] = useState('');
	const router = useRouter();
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const query = text.trim();
		void router.push({ pathname: '/package', query: query ? { text: query } : {} });
	}
	return (
		<form className="home-search" role="search" aria-label="Search travel packages" onSubmit={submit}>
			<PlaceOutlined aria-hidden="true" />
			<label htmlFor="home-package-search">
				<strong>Where would you like to go?</strong>
				<input id="home-package-search" placeholder="Search a destination, city, or package" value={text}
					onChange={(event) => setText(event.target.value)} />
			</label>
			<Button type="submit" variant="contained" startIcon={<Search />}>Explore</Button>
		</form>
	);
}
