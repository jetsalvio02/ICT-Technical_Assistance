import Link from "next/link";
import { Box } from "@mui/material";
import Image from "next/image";

const Logo = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        width: "100%",
      }}
    >
      <Link href="/">
        <Image
          src="/images/logos/light_logo_rep.png"
          alt="logo"
          height={100}
          width={100}
          priority
          style={{ objectFit: "contain" }}
        />
      </Link>
    </Box>
  );
};

export default Logo;
