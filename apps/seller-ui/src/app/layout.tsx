import './global.css';
import QueryProvider from './provider';

export const metadata = {
  title: 'Becodemy Seller Dashboard',
  description: 'Multi-vendor ecommerce seller administration and analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-poppins bg-black text-white antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
