import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import AgentList from '@/libs/components/agent/AgentList';
function AgentsPage() {
	return (
		<>
			<Head>
				<title>Travel Agents | WWT</title>
			</Head>
			<AgentList />
		</>
	);
}
export default withLayout(AgentsPage);
