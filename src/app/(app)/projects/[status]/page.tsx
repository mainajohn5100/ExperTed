// This file is deprecated and should be deleted.
// The correct dynamic route is now /src/app/(app)/projects/[projectStatusParam]/page.tsx
// Please ensure this file and its parent directory "[status]" are removed.
import { AppHeader } from '@/components/layout/header';
import { PageTitle } from '@/components/common/page-title';

export default function DeprecatedProjectStatusPage() {
  console.warn("DEPRECATED_ROUTE_ACCESS: /projects/[status]/page.tsx was accessed. This route should be deleted. Use /projects/[projectStatusParam]/page.tsx instead.");
  return (
    <>
      <AppHeader title="Deprecated Page" />
      <div className="p-6">
        <PageTitle title="Deprecated Page" />
        <p className="text-red-500 font-bold">This page (/projects/[status]) is deprecated and should be removed.</p>
        <p>The correct route uses "[projectStatusParam]" instead of "[status]".</p>
        <p>Please ensure your project uses the correct directory structure.</p>
      </div>
    </>
  );
}
