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
    const passMatch = compareSync(data.password, password);
    if (!passMatch) return { success: false, message: "Wrong password" };
    return { success: true, message: "Login succesfull" };
  },
};
