import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  pageCount: number;
  // Builds the URL for a given page, keeping any other query params.
  hrefForPage: (page: number) => string;
}

// Link-based (works without JS, server-rendered) Previous/Next pager, styled
// like the clients table's existing pager so every paginated list looks the
// same. Renders nothing when everything fits on one page.
export function PaginationControls({ page, pageCount, hrefForPage }: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-end space-x-2 py-4">
      <span className="text-sm text-muted-foreground mr-2">
        Page {page} of {pageCount}
      </span>
      {hasPrevious ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={hrefForPage(page - 1)} scroll={false} rel="prev">
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      {hasNext ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={hrefForPage(page + 1)} scroll={false} rel="next">
            Next
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
