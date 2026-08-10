"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductActionResult } from "@/app/actions/products";

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};

const emptyState: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "0",
  category: "",
};

export function ProductForm({
  initial,
  currentImageUrl,
  action,
  submitLabel,
}: {
  initial?: Partial<FormState>;
  currentImageUrl?: string | null;
  action: (formData: FormData) => Promise<ProductActionResult>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...emptyState, ...initial });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return next;
    });
  }

  const label = "block text-sm font-medium text-zinc-700";
  const input =
    "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(undefined);

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("slug", form.slug);
    fd.set("description", form.description);
    fd.set("category", form.category);
    fd.set("price", form.price);
    fd.set("stock", form.stock);
    if (imageFile) fd.set("image", imageFile);
    if (removeImage) fd.set("removeImage", "on");

    const result = await action(fd);
    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  }

  const showCurrentImage = currentImageUrl && !imageFile && !removeImage;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className={label}>
          Nombre
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="slug" className={label}>
          Slug (URL)
        </label>
        <input
          id="slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", e.target.value);
          }}
          className={input}
          placeholder="se genera del nombre"
        />
      </div>
      <div>
        <label htmlFor="category" className={label}>
          Categoría
        </label>
        <input
          id="category"
          required
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={input}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className={label}>
            Precio (CLP)
          </label>
          <input
            id="price"
            type="number"
            required
            min={1}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="stock" className={label}>
            Stock
          </label>
          <input
            id="stock"
            type="number"
            required
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className={input}
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className={label}>
          Descripción
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="image" className={label}>
          Imagen
        </label>
        {showCurrentImage ? (
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-zinc-100">
              <Image
                src={currentImageUrl}
                alt="Imagen actual"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
              />
              Quitar imagen actual
            </label>
          </div>
        ) : null}
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files?.[0] ?? null);
            setRemoveImage(false);
          }}
          className={`${input} file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white`}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Imagen de hasta 4 MB en formato JPG, PNG o WebP.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
