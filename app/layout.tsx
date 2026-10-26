import "./globals.css";
export const metadata = { title: "MESCO DevOps Analytics", description: "Live Azure DevOps portfolio analytics" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
