import { gql } from '@apollo/client';

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;
