export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // Bare layout — no navbar, sidebar, dark background.
  // Just a white page for printing.
  return children;
}
