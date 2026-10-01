import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeTravelMateSearch, excerpt, memberName, plainText } from '../libs/components/community/communityState';

test('article previews convert stored rich text into safe compact copy', () => {
	assert.equal(plainText('<p>Seoul &amp; Busan&nbsp;guide</p><script>alert(1)</script>'), 'Seoul & Busan guide');
	assert.equal(excerpt('A wonderful journey', 8), 'A wonder…');
});

test('travel-mate searches escape regular expression control characters', () => {
	assert.equal(escapeTravelMateSearch('  Seoul.* (May)?  '), 'Seoul\\.\\* \\(May\\)\\?');
});

test('member display names use real full name, nickname, then neutral fallback', () => {
	assert.equal(memberName({ memberFullName: 'Ada Lovelace', memberNick: 'ada' }), 'Ada Lovelace');
	assert.equal(memberName({ memberFullName: ' ', memberNick: 'ada' }), 'ada');
	assert.equal(memberName(null), 'WWT traveler');
});
