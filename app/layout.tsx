import './globals.css';
import MiniKitProvider from './minikit-provider';
export const metadata = { title: 'P2P Services' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      {/* <!-- Tailwind CSS CDN --> */}
<script src="https://cdn.tailwindcss.com"></script>

      </head>
      <MiniKitProvider>
      <body>
        <main>{children}</main>
      </body>
      </MiniKitProvider>
    </html>
  );
}
