import { Step, StepLabel, Stepper } from '@mui/material';
export const stepLabels = ['Basic Info', 'Destination', 'Trip Details', 'Itinerary', 'Schedule', 'Pricing', 'Review'];
export default function PackageStepper({ activeStep }: { activeStep: number }) {
	return (
		<nav className="package-form-stepper" aria-label="Package creation progress">
			<Stepper activeStep={activeStep} alternativeLabel>
				{stepLabels.map((label, index) => (
					<Step key={label} aria-current={activeStep === index ? 'step' : undefined}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
		</nav>
	);
}
