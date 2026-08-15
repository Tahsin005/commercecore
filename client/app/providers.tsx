'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { getQueryClient } from '@/lib/query-client';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#321014',
              color: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #5B1E26',
              fontSize: '13px',
              fontFamily: 'var(--font-poppins), system-ui, sans-serif',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#D9C6B5',
                secondary: '#321014',
              },
            },
            error: {
              style: {
                background: '#42151B',
                color: '#F3E4E3',
                border: '1px solid #7A2933',
              },
              iconTheme: {
                primary: '#D9A6A3',
                secondary: '#42151B',
              },
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </LanguageProvider>
    </QueryClientProvider>
  );
}