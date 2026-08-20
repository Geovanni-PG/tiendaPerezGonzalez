"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
  busqueda: string;
  setBusqueda: (valor: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  busqueda: "",
  setBusqueda: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [busqueda, setBusqueda] = useState("");

  return (
    <SearchContext.Provider value={{ busqueda, setBusqueda }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}