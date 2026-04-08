import { Skeleton } from "@/components/ui/skeleton";
import { Box, CircularProgress } from "@mui/material";

const Loading = () => {
  // return <div>Dash Loading</div>;
  // return (
  //   <div className="flex min-h-screen flex-col">
  //     {/* Header */}
  //     <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
  //       <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
  //         <div className="flex items-center gap-2">
  //           <Skeleton className="h-8 w-8 rounded-full" />
  //           <Skeleton className="h-6 w-32" />
  //         </div>
  //         <div className="flex items-center gap-4">
  //           <Skeleton className="h-10 w-10 rounded-full" />
  //           <Skeleton className="h-10 w-10 rounded-full" />
  //           <Skeleton className="h-10 w-10 rounded-full" />
  //         </div>
  //       </div>
  //     </header>
  //     {/* Main Content */}
  //     <main className="flex-1">
  //       <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
  //         {/* Hero Section */}
  //         <div className="mb-8 space-y-4">
  //           <Skeleton className="h-12 w-full md:h-16" />
  //           <Skeleton className="h-4 w-3/4 md:h-5" />
  //         </div>
  //         {/* Stats Grid */}
  //         <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  //           {[1, 2, 3, 4].map((i) => (
  //             <Skeleton key={i} className="h-32 w-full rounded-lg" />
  //           ))}
  //         </div>
  //         {/* Recent Activity Section */}
  //         <div className="space-y-6">
  //           <Skeleton className="h-8 w-48" />
  //           <div className="space-y-3">
  //             {[1, 2, 3].map((i) => (
  //               <Skeleton key={i} className="h-20 w-full rounded-lg" />
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </main>
  //     {/* Footer */}
  //     <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
  //       <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6">
  //         <Skeleton className="h-6 w-40" />
  //       </div>
  //     </footer>
  //   </div>
  // );
  return (
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
