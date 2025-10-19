import './globals.css';
export const metadata = { title: 'P2P MiniApp' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      {/* <!-- Tailwind CSS CDN --> */}
<script src="https://cdn.tailwindcss.com"></script>

      </head>
      <body>
        <header style={{padding:16, borderBottom:'1px solid #eee'}}>
          <h1>P2P MiniApp (Vercel)</h1>
        </header>
        <main style={{padding:16}}>{children}</main>
      </body>
    </html>
  );
}
