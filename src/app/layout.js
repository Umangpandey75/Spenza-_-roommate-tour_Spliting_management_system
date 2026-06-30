import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/shared/theme-provider.jsx";
import { StorageProvider } from "../contexts/storage-context.jsx";
import { SkipLink } from "../components/shared/skip-link.jsx";
import ErrorBoundary from '../components/error-boundary';  // ← ADD THIS LINE

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Spenza - Smart Expense Splitting",
  description: "Split expenses effortlessly, settle debts instantly. The most intuitive way to track shared expenses with friends, roommates, and travel groups.",
  icons: {
    icon: [
      { url: "/spenza-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/spenza-logo.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/spenza-logo.png",
    apple: "/spenza-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/spenza-logo.png" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('group-expense-splitter-theme') || 'system';
                  var root = document.documentElement;
                  
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                  
                  // Set initial style to prevent flash
                  root.style.colorScheme = theme === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                } catch (e) {
                  // Fallback to light mode if anything fails
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SkipLink />
        <StorageProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="group-expense-splitter-theme"
          >
            <ErrorBoundary>
              <div id="root" role="application" aria-label="Spenza - Smart Expense Splitting">
                {children}
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </StorageProvider>
      </body>
    </html>
  );
}
