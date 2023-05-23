"use client";

import React, { useMemo } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const client = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } }),
    []
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default ReactQueryProvider;
