export default function WindowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex flex-col w-screen h-screen">
          {children}
      </div>
  );
}
