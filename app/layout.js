import "./globals.css";

export const metadata = {
  title: "Hozex – nezáväzný dopyt",
  description: "Pošlite nám nezáväzný dopyt, ozveme sa vám čo najskôr.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
