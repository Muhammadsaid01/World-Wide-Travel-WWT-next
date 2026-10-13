import Send from '@mui/icons-material/Send';
import { IconButton, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MessageInput({ sending, disabled, onSend }: { sending: boolean; disabled?: boolean; onSend: (value: string) => void }) {
	const { t } = useTranslation('chat');
	const [value, setValue] = useState('');
	function submit() {
		const content = value.trim();
		if (!content || sending || disabled) return;
		onSend(content);
	}
	return (
		<div className="chat-message-input">
			<TextField multiline maxRows={4} value={value} placeholder={t('placeholder')} slotProps={{ htmlInput: { maxLength: 5000, 'aria-label': t('placeholder') } }}
				onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); }
				}} />
			<IconButton color="primary" disabled={!value.trim() || sending || disabled} onClick={submit} aria-label={t('send')}><Send /></IconButton>
		</div>
	);
}
