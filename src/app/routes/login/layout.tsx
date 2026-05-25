export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page-shell fixed inset-x-0 top-16 bottom-0 z-0 overflow-hidden">
      {children}
    </div>
  );
}
