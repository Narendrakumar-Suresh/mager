export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
      </nav>
      <main>{children}</main>
    </>
  );
}
