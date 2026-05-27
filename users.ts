import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, ne } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { CreateUserBody, DeleteUserParams, ChangeUserPasswordParams, ChangeUserPasswordBody } from "@workspace/api-zod";
import { requireOwner } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", requireOwner, async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      role: adminUsersTable.role,
      createdAt: adminUsersTable.createdAt,
    })
    .from(adminUsersTable)
    .orderBy(adminUsersTable.createdAt);

  res.json({
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  });
});

router.post("/users", requireOwner, async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, username));

  if (existing) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(adminUsersTable)
    .values({ username, passwordHash, role: "admin" })
    .returning();

  res.status(201).json({
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });
});

router.delete("/users/:id", requireOwner, async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.role === "owner") {
    res.status(400).json({ error: "Cannot delete the owner account" });
    return;
  }

  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, params.data.id));

  res.json({ success: true, message: "User deleted" });
});

router.patch("/users/:id/password", requireOwner, async (req, res): Promise<void> => {
  const params = ChangeUserPasswordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ChangeUserPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db
    .update(adminUsersTable)
    .set({ passwordHash })
    .where(eq(adminUsersTable.id, params.data.id));

  res.json({ success: true, message: "Password updated" });
});

export default router;
