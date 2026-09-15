"use client";

import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

// Shared page/pageSize/search state for the Users, Responders, SOS Alerts,
// and Announcements pages. `search` is the debounced value a data hook
// should actually fetch with; `searchInput` is what the text box binds to
// so typing feels instant while the network request waits.
export function usePaginationState(initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchInput]);

  function setPageSize(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  function resetPage() {
    setPage(1);
  }

  return { page, setPage, pageSize, setPageSize, searchInput, setSearchInput, search, resetPage };
}
