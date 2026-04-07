import { Box, CircularProgress } from "@mui/material";
const Loading = () => {
  return (
    // <div>Loading</div>
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        bgcolor: "#f5f5f5",
      }}
    >
      <CircularProgress size={60} thickness={4} />
    </Box>
  );
};

export default Loading;
