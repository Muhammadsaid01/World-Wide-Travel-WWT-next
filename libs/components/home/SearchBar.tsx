import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutlined';
import Search from '@mui/icons-material/Search';
import { Button } from '@mui/material';

export default function SearchBar() {
	return (
		<div className="home-search" role="group" aria-label="Travel search preview">
			<label>
				<PlaceOutlined />
				<span>
					<strong>Destination</strong>
					<input placeholder="Where do you want to go?" />
				</span>
			</label>
			<label>
				<CalendarMonthOutlined />
				<span>
					<strong>Travel Date</strong>
					<input type="date" aria-label="Travel date" />
				</span>
			</label>
			<label>
				<PeopleOutline />
				<span>
					<strong>Travelers</strong>
					<select defaultValue="2">
						<option value="1">1 traveler</option>
						<option value="2">2 travelers</option>
						<option value="3">3 travelers</option>
						<option value="4">4+ travelers</option>
					</select>
				</span>
			</label>
			<Button variant="contained" color="primary" startIcon={<Search />} disabled title="Search preview — coming soon">
				Search
			</Button>
		</div>
	);
}
