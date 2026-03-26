// "use client";
// import Link from "next/link";
// import { Grid, Box, Card, Stack, Typography } from "@mui/material";
// // components
// import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
// import Logo from "@/app/(AdminLayout)/layout/shared/logo/Logo";
// import AuthLogin from "../auth/AuthLogin";

// const Login2 = () => {
//   return (
//     <PageContainer title="Login" description="this is Login page">
//       <Box
//         sx={{
//           position: "relative",
//           "&:before": {
//             content: '""',
//             background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
//             backgroundSize: "400% 400%",
//             animation: "gradient 15s ease infinite",
//             position: "absolute",
//             height: "100%",
//             width: "100%",
//             opacity: "0.3",
//           },
//         }}
//       >
//         <Grid
//           container
//           spacing={0}
//           justifyContent="center"
//           sx={{ height: "100vh" }}
//         >
//           <Grid
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             size={{
//               xs: 12,
//               sm: 12,
//               lg: 4,
//               xl: 3,
//             }}
//           >
//             <Card
//               elevation={9}
//               sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}
//             >
//               <Box display="flex" alignItems="center" justifyContent="center">
//                 <Logo />
//               </Box>
//               <AuthLogin
//                 subtext={
//                   <Typography
//                     variant="subtitle1"
//                     textAlign="center"
//                     color="textSecondary"
//                     mb={1}
//                   >
//                     Your Social Campaigns
//                   </Typography>
//                 }
//                 subtitle={
//                   <Stack
//                     direction="row"
//                     spacing={1}
//                     justifyContent="center"
//                     mt={3}
//                   >
//                     <Typography
//                       color="textSecondary"
//                       variant="h6"
//                       fontWeight="500"
//                     >
//                       {/* New to Modernize? */}
//                       Don't have an account?
//                     </Typography>
//                     <Typography
//                       component={Link}
//                       href="/authentication/register"
//                       fontWeight="500"
//                       sx={{
//                         textDecoration: "none",
//                         color: "primary.main",
//                       }}
//                     >
//                       Create an account
//                     </Typography>
//                   </Stack>
//                 }
//               />
//             </Card>
//           </Grid>
//         </Grid>
//       </Box>
//     </PageContainer>
//   );
// };
// export default Login2;
"use client";
import Link from "next/link";
import { Grid, Box, Card, Stack, Typography } from "@mui/material";
// components
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import Logo from "@/app/(AdminLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

const Login2 = () => {
  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{ height: "100vh" }}
        >
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{
              xs: 12,
              sm: 12,
              lg: 4,
              xl: 3,
            }}
          >
            <Card
              elevation={9}
              sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>

              <AuthLogin
                subtext={
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    color="textSecondary"
                    mb={1}
                  >
                    ICT Support Technical Assistance
                  </Typography>
                }
                subtitle={
                  <>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      mt={3}
                    >
                      <Typography
                        color="textSecondary"
                        variant="h6"
                        fontWeight="500"
                      >
                        Don't have an account?
                      </Typography>
                      <Typography
                        component={Link}
                        href="/authentication/register"
                        fontWeight="500"
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                        }}
                      >
                        Create an account
                      </Typography>
                    </Stack>

                    {/* ✅ Added Facebook help link */}
                    <Stack justifyContent="center" alignItems="center" mt={2}>
                      <Typography
                        component={Link}
                        href="https://www.facebook.com/help/"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          cursor: "pointer",
                          textAlign: "center", // ✅ center text inside
                          display: "block", // ✅ ensures full width behavior
                        }}
                      >
                        Have trouble logging in? <br />
                        <span>Contact admin</span>
                      </Typography>
                    </Stack>
                  </>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login2;
