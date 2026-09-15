import { Box, Container, Stack } from '@mui/material';

export default function Home() {
  return (
  <>
    <Stack sx={{background:"#81c784"}}>Header</Stack>
    <Container> 
      <Stack direction = {'column'}>
        <Box>Popular Packages</Box>
        <Box>Popular Agents</Box>
        <Box>Popular Coupons</Box>
        <Box>Popular Packages</Box>
      </Stack >
    </Container>
    <Stack sx={{background:"#a1887f"}}>Footer</Stack>
  </>
  );
}