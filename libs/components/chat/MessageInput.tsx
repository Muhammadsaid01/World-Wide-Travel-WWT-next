import Send from '@mui/icons-material/Send';
import { IconButton, TextField } from '@mui/material';
import { useState } from 'react';

export default function MessageInput({ sending, disabled, onSend }: { sending: boolean; disabled?: boolean; onSend: (value: string) => void }) {
	const [value, setValue] = useState('');
	function submit() {
		const content = value.trim();
		if (!content || sending || disabled) return;
		onSend(content);
	}
	return (
		<div className="chat-message-input">
			<TextField multiline maxRows={4} value={value} placeholder="Write a message…" slotProps={{ htmlInput: { maxLength: 5000, 'aria-label': 'Message' } }}
				onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); }
				}} />
			<IconButton color="primary" disabled={!value.trim() || sending || disabled} onClick={submit} aria-label="Send message"><Send /></IconButton>
		</div>
	);
}
