"use client";

import { ListingsProvider } from "./ListingsProvider";
import { CategoriesProvider } from "./CategoriesProvider";

export function SalesWorkspace({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  return enabled ? <ListingsProvider><CategoriesProvider>{children}</CategoriesProvider></ListingsProvider> : <>{children}</>;
}
