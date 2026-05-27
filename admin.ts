import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, keysTable } from "@workspace/db";
import {
  ListKeysQueryParams,
  CreateKeyBody,
  CreateKeysBulkBody,
  DeleteKeyParams,
} from "@workspace/api-zod";
import { generateKeyValue } from "./keys";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/keys", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListKeysQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20, status = "all" } = parsed.data;
  const offset = (page - 1) * limit;

  const whereClause = status && status !== "all"
    ? eq(keysTable.status, status)
    : undefined;

  const [keysResult, totalResult] = await Promise.all([
    db
      .select()
      .from(keysTable)
      .where(whereClause)
      .orderBy(sql`${keysTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(keysTable)
      .where(whereClause),
  ]);

  res.json({
    keys: keysResult,
    total: totalResult[0]?.count ?? 0,
  });
});

router.post("/admin/keys", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { note, expiresInDays } = parsed.data;
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const [key] = await db
    .insert(keysTable)
    .values({ keyValue: generateKeyValue(), note: note ?? null, expiresAt: expiresAt ?? null })
    .returning();

  res.status(201).json(key);
});

router.post("/admin/keys/bulk", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateKeysBulkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { count: keyCount, note, expiresInDays } = parsed.data;
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const values = Array.from({ length: keyCount }, () => ({
    keyValue: generateKeyValue(),
    note: note ?? null,
    expiresAt: expiresAt ?? null,
  }));

  const keys = await db.insert(keysTable).values(values).returning();

  res.status(201).json({ keys, count: keys.length });
});

router.delete("/admin/keys/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteKeyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(keysTable)
    .where(eq(keysTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json({ success: true, message: "Key deleted" });
});

router.get("/admin/stats", requireAuth, async (_req, res): Promise<void> => {
  const stats = await db
    .select({
      status: keysTable.status,
      count: count(),
    })
    .from(keysTable)
    .groupBy(keysTable.status);

  const totalKeys = stats.reduce((sum, s) => sum + Number(s.count), 0);
  const activeKeys = Number(stats.find((s) => s.status === "active")?.count ?? 0);
  const redeemedKeys = Number(stats.find((s) => s.status === "redeemed")?.count ?? 0);
  const expiredKeys = Number(stats.find((s) => s.status === "expired")?.count ?? 0);

  res.json({ totalKeys, activeKeys, redeemedKeys, expiredKeys });
});

export default router;
