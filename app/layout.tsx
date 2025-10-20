import './globals.css';
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
export const metadata = { title: 'P2P MiniApp' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      {/* <!-- Tailwind CSS CDN --> */}
<script src="https://cdn.tailwindcss.com"></script>

      </head>
      <MiniKitProvider>
      <body>
        <main style={{padding:16}}>{children}</main>
      </body>
      </MiniKitProvider>
    </html>
  );
}
