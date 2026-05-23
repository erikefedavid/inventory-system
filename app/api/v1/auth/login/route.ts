// app/api/v1/auth/login/route.ts
import { NextResponse } from "next/server";
import { loginUser } from "@/lib/services/auth.service";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/utils/authCookie";
import dbConnect from "@/lib/db/mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const json = await req.json();
    const parsed = LoginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const { token, user } = await loginUser(email, password);
    const response = NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
