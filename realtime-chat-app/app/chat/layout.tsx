export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-7rem)] min-h-[400px] w-full overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-soft">
      {children}
    </div>
  );
}
