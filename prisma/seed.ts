import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Auriculares Inalámbricos Pro",
    slug: "auriculares-inalambricos-pro",
    description:
      "Auriculares over-ear con cancelación activa de ruido, 30h de batería y Bluetooth 5.4.",
    price: 12990,
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 25,
  },
  {
    name: "Teclado Mecánico RGB",
    slug: "teclado-mecanico-rgb",
    description:
      "Teclado mecánico con switches red, retroiluminación RGB y carcasa de aluminio.",
    price: 8990,
    category: "Periféricos",
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    stock: 40,
  },
  {
    name: "Mouse Gamer 16000 DPI",
    slug: "mouse-gamer-16000-dpi",
    description:
      "Mouse con sensor óptico de 16000 DPI, 8 botones programables y peso ultraligero.",
    price: 5490,
    category: "Periféricos",
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80",
    stock: 60,
  },
  {
    name: "Monitor 27'' 4K",
    slug: "monitor-27-4k",
    description:
      "Monitor IPS 27 pulgadas 4K UHD, 60Hz, HDR10 y cobertura 100% sRGB.",
    price: 249990,
    category: "Pantallas",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
    stock: 10,
  },
  {
    name: "Webcam Full HD",
    slug: "webcam-full-hd",
    description:
      "Cámara web 1080p con micrófono estéreo, corrección de luz y montaje universal.",
    price: 19990,
    category: "Cámaras",
    imageUrl:
      "https://images.unsplash.com/photo-1762681290673-ba1ad4ea0875?w=600&q=80",
    stock: 15,
  },
  {
    name: "Base de Carga Inalámbrica",
    slug: "base-carga-inalambrica",
    description:
      "Cargador inalámbrico 15W compatible con Qi, con superficie antideslizante.",
    price: 8990,
    category: "Accesorios",
    imageUrl:
      "https://images.unsplash.com/photo-1545235616-db3cd822ad8c?w=600&q=80",
    stock: 30,
  },
];

async function main() {
  const customerHash = await bcrypt.hash("demo1234", 12);
  const adminHash = await bcrypt.hash("admin1234", 12);

  await prisma.user.upsert({
    where: { email: "demo@tienda.cl" },
    update: { name: "Cliente Demo", passwordHash: customerHash },
    create: {
      name: "Cliente Demo",
      email: "demo@tienda.cl",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@tienda.cl" },
    update: { name: "Admin Demo", passwordHash: adminHash },
    create: {
      name: "Admin Demo",
      email: "admin@tienda.cl",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p },
      create: { ...p },
    });
  }
  const count = await prisma.product.count();
  const users = await prisma.user.count();
  console.log(
    `✅ Seed completado. ${count} productos y ${users} usuarios (demo@tienda.cl / demo1234 · admin@tienda.cl / admin1234).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
