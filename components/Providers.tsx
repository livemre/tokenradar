'use client';

import { WalletProvider } from '@/components/wallet/WalletProvider';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { FavoritesProvider } from '@/lib/context/FavoritesContext';
import { LoginModal } from '@/components/auth/LoginModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <NotificationProvider>
        <AuthProvider>
          <FavoritesProvider>
            {children}
            <LoginModal />
          </FavoritesProvider>
        </AuthProvider>
      </NotificationProvider>
    </WalletProvider>
  );
}
