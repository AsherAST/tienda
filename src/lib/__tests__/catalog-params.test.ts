import { describe, expect, it } from "vitest";
import {
  parseCatalogParams,
  buildCatalogUrl,
  PRICE_FILTERS,
} from "@/lib/catalog-params";

describe("parseCatalogParams", () => {
  it("devuelve vacío sin parámetros", () => {
    expect(parseCatalogParams({})).toEqual({});
  });

  it("parsea búsqueda, categoría, precio y orden", () => {
    const result = parseCatalogParams({
      q: "auricular",
      categoria: "Audio",
      precio: "50000",
      orden: "price-asc",
    });
    expect(result).toEqual({
      search: "auricular",
      category: "Audio",
      maxPrice: 50000,
      sort: "price-asc",
    });
  });

  it("ignora orden inválido", () => {
    const result = parseCatalogParams({ orden: "bogus" });
    expect(result.sort).toBeUndefined();
  });

  it("ignora precio no numérico", () => {
    const result = parseCatalogParams({ precio: "abc" });
    expect(result.maxPrice).toBeUndefined();
  });

  it("usa el primer valor cuando llega un array", () => {
    const result = parseCatalogParams({ q: ["uno", "dos"] });
    expect(result.search).toBe("uno");
  });
});

describe("buildCatalogUrl", () => {
  it("construye la URL con parámetros", () => {
    expect(buildCatalogUrl({ q: "teclado", categoria: "Periféricos" })).toBe(
      "/?q=teclado&categoria=Perif%C3%A9ricos",
    );
  });

  it("omite valores vacíos y devuelve /", () => {
    expect(buildCatalogUrl({ q: undefined, categoria: "" })).toBe("/");
  });
});

describe("PRICE_FILTERS", () => {
  it("ofrece la opción sin filtro", () => {
    expect(PRICE_FILTERS[0]).toEqual({ value: "", label: "Todos los precios" });
  });
});
