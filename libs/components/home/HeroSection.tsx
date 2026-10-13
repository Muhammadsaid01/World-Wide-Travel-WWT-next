import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Button, IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';

const slides = [
	{ theme: 'The Silk Road', background: '/images/home/hero/01-silk-road/background.png', destinations: [
		{ label: 'Uzbekistan', country: 'Uzbekistan', image: '/images/home/hero/01-silk-road/uzbekistan.jpg' },
		{ label: 'Istanbul', country: 'Türkiye', image: '/images/home/hero/01-silk-road/istanbul.jpg' },
		{ label: 'Kashgar', country: 'China', image: '/images/home/hero/01-silk-road/kashgar.jpg' },
	] },
	{ theme: 'Sacred Journeys', background: '/images/home/hero/02-sacred-journey/background.png', destinations: [
		{ label: 'Mecca', country: 'Saudi Arabia', image: '/images/home/hero/02-sacred-journey/mecca.jpg' },
		{ label: 'Madinah', country: 'Saudi Arabia', image: '/images/home/hero/02-sacred-journey/madinah.jpg' },
		{ label: 'AlUla', country: 'Saudi Arabia', image: '/images/home/hero/02-sacred-journey/alula.jpg' },
	] },
	{ theme: 'European Classics', background: '/images/home/hero/03-europe/background.png', destinations: [
		{ label: 'Paris', country: 'France', image: '/images/home/hero/03-europe/paris.jpg' },
		{ label: 'Rome', country: 'Italy', image: '/images/home/hero/03-europe/rome.jpg' },
		{ label: 'London', country: 'United Kingdom', image: '/images/home/hero/03-europe/london.jpg' },
	] },
	{ theme: 'East Asia', background: '/images/home/hero/04-east-asia/background.png', destinations: [
		{ label: 'Japan', country: 'Japan', image: '/images/home/hero/04-east-asia/japan.jpg' },
		{ label: 'Seoul', country: 'South Korea', image: '/images/home/hero/04-east-asia/seoul.jpg' },
		{ label: 'Busan', country: 'South Korea', image: '/images/home/hero/04-east-asia/busan.jpg' },
	] },
	{ theme: 'Tropical Escapes', background: '/images/home/hero/05-tropical/background.png', destinations: [
		{ label: 'Maldives', country: 'Maldives', image: '/images/home/hero/05-tropical/maldives.jpg' },
		{ label: 'Phuket', country: 'Thailand', image: '/images/home/hero/05-tropical/phuket.jpg' },
		{ label: 'Sanya', country: 'China', image: '/images/home/hero/05-tropical/sanya.jpg' },
	] },
	{ theme: 'The Swiss Alps', background: '/images/home/hero/06-swiss-alps/background.png', destinations: [
		{ label: 'Zermatt', country: 'Switzerland', image: '/images/home/hero/06-swiss-alps/zermatt.jpg' },
		{ label: 'Interlaken', country: 'Switzerland', image: '/images/home/hero/06-swiss-alps/interlaken.jpg' },
		{ label: 'Lucerne', country: 'Switzerland', image: '/images/home/hero/06-swiss-alps/lucerne.jpg' },
	] },
] as const;

export default function HeroSection() {
	const { t } = useTranslation('home');
	const [active, setActive] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);
	const startAutoplay = useCallback(() => {
		if (timer.current) clearInterval(timer.current);
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		timer.current = setInterval(() => setActive((current) => (current + 1) % slides.length), 10_000);
	}, []);
	useEffect(() => {
		startAutoplay();
		return () => { if (timer.current) clearInterval(timer.current); };
	}, [startAutoplay]);
	function selectSlide(index: number) {
		setActive((index + slides.length) % slides.length);
		startAutoplay();
	}
	const slide = slides[active];
	return (
		<section className="home-hero" aria-roledescription="carousel" aria-label={t('hero.aria')}>
			<div className="home-hero-background" key={slide.background}>
				<Image src={slide.background} alt="" fill priority={active === 0} sizes="100vw" />
			</div>
			<div className="home-hero-overlay" aria-hidden="true" />
			<div className="home-container home-hero-content">
				<div className="home-hero-copy">
					<span className="home-eyebrow">{t('hero.eyebrow')}</span>
					<h1>{t('hero.titleBefore')} <span>{t('hero.titleAccent')}</span> {t('hero.titleAfter')}</h1>
					<p>{t('hero.description')}</p>
					<div className="home-hero-actions">
						<Button component={Link} href="/package" variant="contained" color="secondary">{t('hero.explore')}</Button>
						<span className="home-slide-theme">{slide.theme}</span>
					</div>
				</div>
				<div className="home-destination-cards" key={slide.theme}>
					{slide.destinations.map((destination) => (
						<article key={destination.label}>
							<Image src={destination.image} alt={destination.label} fill sizes="(max-width: 700px) 62vw, 220px" />
							<div className="home-destination-card-copy"><strong>{destination.label}</strong><small>{destination.country}</small></div>
						</article>
					))}
				</div>
				<div className="home-carousel-controls">
					<IconButton onClick={() => selectSlide(active - 1)} aria-label={t('hero.previous')}><ArrowBack /></IconButton>
					<div className="home-carousel-dots" role="group" aria-label={t('hero.choose')}>
						{slides.map((item, index) => (
							<button key={item.theme} type="button" className={index === active ? 'is-active' : ''}
								aria-label={t('hero.showSlide', { number: index + 1, name: item.theme })} aria-current={index === active ? 'true' : undefined}
								onClick={() => selectSlide(index)} />
						))}
					</div>
					<IconButton onClick={() => selectSlide(active + 1)} aria-label={t('hero.next')}><ArrowForward /></IconButton>
				</div>
			</div>
			<SearchBar />
		</section>
	);
}
