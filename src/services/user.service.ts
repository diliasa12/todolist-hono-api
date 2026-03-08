import { NewUser } from "../../types";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import db from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { password } from "bun";
import { Result } from "pg";

export const user = {
  register: async (data: NewUser) => {
    if (!data) {
      return null;
    }
    console.log(data);
    const { passwordHash } = data;
    const salt = genSaltSync(10);
    const password = hashSync(passwordHash, salt);
    const result = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.username,
        passwordHash: password,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
      });
    return result;
  },
  login: async (data: { email: string; password: string }) => {
    console.log(data);
    const [result] = await db
      .select({
        password: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, data.email));
    console.log(result);
    const { password } = result;
    console.log(password);
    const passMatch = compareSync(data.password, password);

    if (!passMatch) return { success: false, message: "Wrong password" };
    return { success: true, message: "Login succesfull" };
  },
  update: async (data: object, id: string) => {
    const updateData = data;
    await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id));

    return { succes: true, message: "user succesfully updated" };
  },
  passUpdate: async (password: string, id: string) => {
    const salt = genSaltSync(10);

    const passwordHash = hashSync(password, salt);
    console.log(passwordHash);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
    return { success: true, message: "Password change" };
  },
};
