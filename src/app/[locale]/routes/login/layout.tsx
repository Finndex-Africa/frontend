export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page-shell fixed inset-0 z-0 overflow-hidden">
      {children}
    </div>
  );
}
