export default function PlayLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="border-2 border-red-800 w-screen h-screen">
            {children}
        </div>
    );
}
