import { baselightTheme } from "@/utils/theme/DefaultColors";
import "./global.css";
import { Providers } from "./Providers";

export const metadata = {
  title: "ITA - Information Technology Administration",
  description: "IT Administration System",
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
