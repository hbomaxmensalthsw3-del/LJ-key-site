import { Router, type IRouter } from "express";
import { eq, and, or, isNull, gt } from "drizzle-orm";
import { db, keysTable } from "@workspace/db";
import {
  RedeemKeyBody,
  ValidateKeyBody,
} from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateKeyValue(): string {
  const part = () => randomBytes(4).toString("hex").toUpperCase();
  return `${part()}-${part()}-${part()}-${part()}`;
}

router.post("/keys/redeem", async (req, res): Promise<void> => {
  const parsed = RedeemKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { keyValue, username } = parsed.data;
  const now = new Date();

  const [key] = await db
    .select()
    .from(keysTable)
    .where(eq(keysTable.keyValue, keyValue));

  if (!key) {
    res.status(400).json({ error: "Invalid key" });
    return;
  }

  if (key.status === "redeemed") {
    res.status(400).json({ error: "Key already redeemed" });
    return;
  }

  if (key.status === "expired") {
    res.status(400).json({ error: "Key has expired" });
    return;
  }

  if (key.expiresAt && key.expiresAt < now) {
    await db.update(keysTable).set({ status: "expired" }).where(eq(keysTable.id, key.id));
    res.status(400).json({ error: "Key has expired" });
    return;
  }

  const [updated] = await db
    .update(keysTable)
    .set({ status: "redeemed", redeemedBy: username, redeemedAt: now })
    .where(eq(keysTable.id, key.id))
    .returning();

  res.json({
    success: true,
    message: `Key redeemed successfully for ${username}!`,
    key: updated,
  });
});

router.post("/keys/verify", async (req, res): Promise<void> => {
  const { key, hwid } = req.body as { key?: string; hwid?: string };

  if (!key || !hwid) {
    res.json({ success: false, error: "Missing key or hwid" });
    return;
  }

  const now = new Date();

  const [row] = await db
    .select()
    .from(keysTable)
    .where(eq(keysTable.keyValue, key));

  if (!row) {
    res.json({ success: false, error: "Invalid key" });
    return;
  }

  if (row.expiresAt && row.expiresAt < now) {
    await db.update(keysTable).set({ status: "expired" }).where(eq(keysTable.id, row.id));
    res.json({ success: false, error: "Key has expired" });
    return;
  }

  if (row.status === "expired") {
    res.json({ success: false, error: "Key has expired" });
    return;
  }

  if (row.status === "active") {
    await db
      .update(keysTable)
      .set({ status: "redeemed", hwid, redeemedAt: now })
      .where(eq(keysTable.id, row.id));
    res.json({ success: true });
    return;
  }

  if (row.status === "redeemed") {
    if (row.hwid === hwid) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: "HWID mismatch" });
    }
    return;
  }

  res.json({ success: false, error: "Key is not active" });
});

router.post("/keys/validate", async (req, res): Promise<void> => {
  const parsed = ValidateKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ valid: false, message: parsed.error.message });
    return;
  }

  const { keyValue } = parsed.data;
  const now = new Date();

  const [key] = await db
    .select()
    .from(keysTable)
    .where(eq(keysTable.keyValue, keyValue));

  if (!key) {
    res.json({ valid: false, message: "Invalid key" });
    return;
  }

  if (key.status === "redeemed") {
    res.json({ valid: true, message: "Key is active" });
    return;
  }

  if (key.status === "expired" || (key.expiresAt && key.expiresAt < now)) {
    res.json({ valid: false, message: "Key has expired" });
    return;
  }

  if (key.status !== "active") {
    res.json({ valid: false, message: "Key is not active" });
    return;
  }

  res.json({ valid: true, message: "Key is valid" });
});

export { generateKeyValue };
export default router;
