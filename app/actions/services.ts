"use server";

import { db } from "@/lib/db";
import { services, type Service } from "@/lib/db/schema";
import { initialServicesCatalog } from "@/lib/services-data";
import { verifySession, loginTeam as authLoginTeam, logoutTeam as authLogoutTeam } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: { teamName: string; password: string }) {
  const res = await authLoginTeam(formData);
  if (res.success) {
    revalidatePath("/");
  }
  return res;
}

export async function logoutAction() {
  await authLogoutTeam();
  revalidatePath("/");
}

export async function getServices(): Promise<{
  isAuthenticated: boolean;
  teamName?: string;
  data: Service[];
  isLiveNeon: boolean;
  branch: string;
}> {
  const session = await verifySession();
  const branch = process.env.NEON_BRANCH || "production";

  // CRITICAL SECURITY REQUIREMENT:
  // Do NOT leak services or link URLs to unauthenticated visitors
  if (!session.isAuthenticated) {
    return {
      isAuthenticated: false,
      data: [],
      isLiveNeon: false,
      branch,
    };
  }

  try {
    const queryPromise = db.select().from(services).orderBy(desc(services.id));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon direct connection timeout")), 2500)
    );

    const rows = await Promise.race([queryPromise, timeoutPromise]);
    if (rows && rows.length > 0) {
      return {
        isAuthenticated: true,
        teamName: session.teamName,
        data: rows,
        isLiveNeon: true,
        branch,
      };
    }
  } catch (err) {
    console.warn("Neon live query timed out or unreachable locally; using seeded catalog fallback:", (err as Error).message);
  }

  // Fallback to the 65 organized services (matching what is seeded in Neon Postgres)
  const fallbackData: Service[] = initialServicesCatalog.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    description: item.description,
    category: item.category,
    environment: item.environment,
    status: item.status,
    url: item.url,
    owner: item.owner,
    createdAt: new Date(),
  }));

  return {
    isAuthenticated: true,
    teamName: session.teamName,
    data: fallbackData,
    isLiveNeon: false,
    branch,
  };
}

export async function addService(data: {
  name: string;
  description: string;
  category: string;
  environment: string;
  status: string;
  url: string;
  owner?: string;
}) {
  const session = await verifySession();
  if (!session.isAuthenticated) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  try {
    const insertPromise = db
      .insert(services)
      .values({
        name: data.name,
        description: data.description,
        category: data.category,
        environment: data.environment,
        status: data.status,
        url: data.url,
        owner: data.owner || "Platform Team",
      })
      .returning();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );

    const [created] = await Promise.race([insertPromise, timeoutPromise]);
    revalidatePath("/");
    return { success: true, service: created };
  } catch (error) {
    console.warn("Neon insert warning (offline or timeout):", (error as Error).message);
    const synthetic: Service = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      category: data.category,
      environment: data.environment,
      status: data.status,
      url: data.url,
      owner: data.owner || "Platform Team",
      createdAt: new Date(),
    };
    return { success: true, service: synthetic, localOnly: true };
  }
}

export async function updateService(
  id: number,
  data: {
    name: string;
    description: string;
    category: string;
    environment: string;
    status: string;
    url: string;
    owner?: string;
  }
) {
  const session = await verifySession();
  if (!session.isAuthenticated) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  try {
    const updatePromise = db
      .update(services)
      .set({
        name: data.name,
        description: data.description,
        category: data.category,
        environment: data.environment,
        status: data.status,
        url: data.url,
        owner: data.owner,
      })
      .where(eq(services.id, id))
      .returning();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );

    const [updated] = await Promise.race([updatePromise, timeoutPromise]);
    revalidatePath("/");
    return { success: true, service: updated };
  } catch (error) {
    console.warn("Neon update warning:", (error as Error).message);
    return { success: true, localOnly: true };
  }
}

export async function deleteService(id: number) {
  const session = await verifySession();
  if (!session.isAuthenticated) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  try {
    const deletePromise = db.delete(services).where(eq(services.id, id));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );
    await Promise.race([deletePromise, timeoutPromise]);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.warn("Neon delete warning:", (error as Error).message);
    return { success: true, localOnly: true };
  }
}
