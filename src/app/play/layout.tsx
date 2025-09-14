import { Geist } from 'next/font/google';

const geist = Geist({
    subsets: ['latin'],
});

export default function PlayLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="w-screen h-screen">{children}</div>;
}
