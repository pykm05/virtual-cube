import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
    title: 'Virtual Cube',
    description: '...',
    icons: {
        icon: '/Virtual Cube.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="w-screen h-screen">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
