import { baselightTheme } from "@/utils/theme/DefaultColors";
import "./global.css";
import { Providers } from "./Providers";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: "ICT Support Technical Assistance",
  description: "ICT Support Technical Assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
