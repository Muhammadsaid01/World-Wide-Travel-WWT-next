import Image from 'next/image';

const countries = [
	['uz', 'Uzbekistan'], ['sa', 'Saudi Arabia'], ['ae', 'United Arab Emirates'], ['qa', 'Qatar'],
	['eg', 'Egypt'], ['ma', 'Morocco'], ['kr', 'South Korea'], ['jp', 'Japan'], ['cn', 'China'],
	['tr', 'Türkiye'], ['gb', 'United Kingdom'], ['fr', 'France'], ['it', 'Italy'], ['de', 'Germany'],
	['es', 'Spain'], ['ch', 'Switzerland'], ['us', 'United States'], ['ca', 'Canada'], ['au', 'Australia'],
	['th', 'Thailand'], ['mv', 'Maldives'], ['id', 'Indonesia'], ['sg', 'Singapore'], ['my', 'Malaysia'],
	['pt', 'Portugal'], ['br', 'Brazil'], ['mx', 'Mexico'], ['az', 'Azerbaijan'], ['kz', 'Kazakhstan'],
	['kg', 'Kyrgyzstan'], ['tj', 'Tajikistan'], ['tm', 'Turkmenistan'], ['pk', 'Pakistan'], ['lk', 'Sri Lanka'],
	['np', 'Nepal'], ['ru', 'Russia'], ['be', 'Belgium'], ['dk', 'Denmark'], ['no', 'Norway'],
	['is', 'Iceland'], ['pl', 'Poland'], ['hr', 'Croatia'], ['lu', 'Luxembourg'], ['bh', 'Bahrain'],
	['lb', 'Lebanon'],
] as const;

function CountrySequence({ hidden = false }: { hidden?: boolean }) {
	return (
		<div className="home-flags-sequence" aria-hidden={hidden || undefined}>
			{countries.map(([code, name]) => (
				<div className="home-flag" key={code} title={name}>
					<Image src={`/images/flags/${code}.svg`} alt={hidden ? '' : `${name} flag`} width={42} height={30} />
					<span>{name}</span>
				</div>
			))}
		</div>
	);
}

export default function CountryMarquee() {
	return (
		<section className="home-flags" aria-label="Explore destinations around the world">
			<div className="home-flags-track"><CountrySequence /><CountrySequence hidden /></div>
		</section>
	);
}
