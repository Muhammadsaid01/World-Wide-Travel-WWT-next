import { useState } from 'react';
import Image from 'next/image';
import { API_URL } from '@/libs/config';

export function packageImageUrl(path?: string | null): string | undefined {
	if (!path?.trim()) return undefined;
	if (/^https?:\/\//i.test(path)) return path;
	return API_URL ? `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : undefined;
}

export default function PackageImage({ path, alt }: { path?: string; alt: string }) {
	const src = packageImageUrl(path);
	const [failed, setFailed] = useState<string>();
	return src && failed !== src ? (
		<Image src={src} alt={alt} fill unoptimized sizes="(max-width: 760px) 100vw, 75vw" onError={() => setFailed(src)} />
	) : (
		<div className="detail-image-fallback">Image unavailable</div>
	);
}
