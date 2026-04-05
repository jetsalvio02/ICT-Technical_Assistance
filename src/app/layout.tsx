import { baselightTheme } from "@/utils/theme/DefaultColors";
import "./global.css";
import { Providers } from "./Providers";

export const metadata = {
  title: "ICT Support Technical Assistance",
  description: "ICT Support Technical Assistance",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
