import './globals.css';
import { WalletProvider } from '../components/WalletProvider';

export const metadata = {
  title: '$GOR Coin Flip Game',
  description: 'Coin flip game on Gorbagana chain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}