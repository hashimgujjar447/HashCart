import Header from '@/shared/widgets';
import './global.css';
import { Poppins, Roboto } from 'next/font/google';
import QueryProvider from './providers';

export const metadata = {
  title: 'HashCart',
  description:
    'HashCart is a multi-vendor e-commerce platform that allows users to buy and sell products from multiple vendors in one place. It provides a seamless shopping experience with features like product search, vendor ratings, and secure payment options.',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700', '900'],
  variable: '--font-roboto',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable} `}>
        <QueryProvider>
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
