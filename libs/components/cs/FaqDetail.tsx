import type { Faq } from '@/libs/types/system/faq';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';

export default function FaqDetail({ faq, expanded, onChange }: { faq: Faq; expanded: boolean; onChange: () => void }) {
	return (
		<Accordion
			disableGutters
			expanded={expanded}
			onChange={onChange}
			className="faq-accordion"
			slotProps={{ transition: { unmountOnExit: true } }}
		>
			<AccordionSummary expandIcon={<ExpandMoreOutlined />}>
				<Typography component="h2">{faq.faqQuestion}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography component="p">{faq.faqAnswer}</Typography>
			</AccordionDetails>
		</Accordion>
	);
}
