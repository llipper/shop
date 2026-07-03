import prisma from "../db.server";

export async function getInstalledShopDomain(): Promise<string | null> {
  if (process.env.SHOP_STORE_DOMAIN) {
    return process.env.SHOP_STORE_DOMAIN;
  }

  const session = await prisma.session.findFirst({
    where: { isOnline: false },
    orderBy: { id: "desc" },
  });

  return session?.shop ?? null;
}