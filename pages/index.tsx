import CommunityPreview from '@/libs/components/home/CommunityPreview';
import CouponSection from '@/libs/components/home/CouponSection';
import CountryMarquee from '@/libs/components/home/CountryMarquee';
import HeroSection from '@/libs/components/home/HeroSection';
import HomeCTA from '@/libs/components/home/HomeCTA';
import PopularDestinations from '@/libs/components/home/PopularDestinations';
import PopularPackages from '@/libs/components/home/PopularPackages';
import TopAgents from '@/libs/components/home/TopAgents';
import TravelInspiration from '@/libs/components/home/TravelInspiration';
import WhyChooseWWT from '@/libs/components/home/WhyChooseWWT';
import withLayout from '@/libs/components/layout/withLayout';
import Head from 'next/head';

function Home() {
	return (
		<div className="wwt-home">
			<Head>
				<title>WWT · Explore the World</title>
				<meta
					name="description"
					content="Discover travel destinations, curated packages, and inspiration with World Wide Travel."
				/>
			</Head>
			<HeroSection />
			<div className="home-container">
				<TravelInspiration />
			</div>
			<CountryMarquee />
			<div className="home-container home-main-container">
				<CouponSection />
				<PopularDestinations />
				<PopularPackages />
				<TopAgents />
				<WhyChooseWWT />
				<CommunityPreview />
				<HomeCTA />
			</div>
		</div>
	);
}
export default withLayout(Home);
