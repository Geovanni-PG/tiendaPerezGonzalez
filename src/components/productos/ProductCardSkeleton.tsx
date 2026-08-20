import { Box, Skeleton } from "@mui/material";

export default function ProductCardSkeleton() {
  return (
    <Box sx={{ borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider" }}>
      <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "1 / 1" }} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="80%" height={22} />
        <Skeleton variant="text" width="40%" height={16} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Skeleton variant="text" width="30%" height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  );
}