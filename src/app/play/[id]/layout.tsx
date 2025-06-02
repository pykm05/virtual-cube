import GameHeader from "@/components/GameHeader";

export default function WindowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex flex-col border-2 border-red-800 w-screen h-screen">
          <GameHeader />
          {children}
      </div>
  );
}
