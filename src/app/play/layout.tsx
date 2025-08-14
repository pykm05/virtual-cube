export const metadata = {
  title: 'Virtual Cube',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function PlayLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="w-screen h-screen">{children}</div>;
}
