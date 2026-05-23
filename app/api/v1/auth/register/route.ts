import { NextResponse } from "next/server";
import { signJwt } from "@/lib/utils/jwt";
import { authCookieOptions, AUTH_COOKIE_NAME } from "@/lib/utils/authCookie";
import dbConnect from "@/lib/db/mongoose";
import { registerUser } from "@/lib/services/auth.service";
import { RegisterSchema } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const json = await request.json();
    const parsed = RegisterSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);
    const token = await signJwt({
      sub: user._id.toString(),
      role: user.role,
      businessId: user.businessId,
    });

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessName: user.businessName,
          businessId: user.businessId,
        },
      },
      { status: 201 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Registration failed";
    if (message === "User already exists") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
