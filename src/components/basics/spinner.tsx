import { Text } from "@/components/basics";
import { Box, CircularProgress } from "@mui/material";

type SpinnerProps = {
  text: string;
};

export default function Spinner(props: SpinnerProps) {
  const { text } = props;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
      <CircularProgress />
      <Text sx={{ paddingTop: "4px" }} variant="h5">
        {text}
      </Text>
    </Box>
  );
}
