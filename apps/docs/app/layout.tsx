import type { ReactNode } from 'react';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style-prefixed.css';

export const metadata = {
  description: 'Documentation for the Lumia Design System.',
  title: 'Lumia Design System',
};

const navbar = (
  <Navbar
    logo={<span>Lumia DS</span>}
    projectLink="https://github.com/archan96/lumia-ds"
  />
);

const footer = <Footer>Lumia Design System</Footer>;

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          docsRepositoryBase="https://github.com/archan96/lumia-ds/tree/main/apps/docs"
          footer={footer}
          navbar={navbar}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
