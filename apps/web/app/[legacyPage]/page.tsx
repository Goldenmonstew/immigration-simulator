import type { Metadata } from 'next';
import { asset } from '../../lib/asset';
import { countryPath } from '../../lib/site-countries';

export const metadata: Metadata = { robots: { index: false } };
export const dynamicParams = false;

export function generateStaticParams() {
  return ['simulate', 'result', 'whatif', 'policy', 'about', 'game'].map(
    (legacyPage) => ({ legacyPage }),
  );
}

export default async function LegacyPage({
  params,
}: {
  params: Promise<{ legacyPage: string }>;
}) {
  const { legacyPage } = await params;
  const path = countryPath('uk', legacyPage);
  return (
    <main id="main">
      <a id="uk-destination" href={asset(path)}>
        {path}
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `const link = document.getElementById('uk-destination');
link.href += location.search + location.hash;
location.replace(link.href);`,
        }}
      />
    </main>
  );
}
