// components/GlobalLayout.tsx
import React, { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { GlobalStateProvider } from '@/services/GlobalStateContext';

const inter = Inter({ subsets: ['latin'] });

interface GlobalLayoutProps {
    children: ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Script src="https://code.createjs.com/1.0.0/createjs.min.js" strategy="beforeInteractive" />
            </head>
            <body className={inter.className} suppressHydrationWarning={true}>
                <GlobalStateProvider>
                    {children}
                </GlobalStateProvider>
            </body>
        </html>
    );
};

export default GlobalLayout;
