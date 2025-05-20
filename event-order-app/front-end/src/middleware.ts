import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_PATH = "/dashboard";

function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  console.log("Token from cookie:", token ? "exists" : "not found");
  if (!token) return null;

  try {
    // Decode JWT payload (second part of token)
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Invalid JWT format");
      return null;
    }

    // Add padding to base64 if needed
    let base64Payload = parts[1];
    base64Payload = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Payload.length % 4) {
      base64Payload += "=";
    }

    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());

    // Verifikasi bahwa payload memiliki properti yang diharapkan
    if (!payload || typeof payload !== "object" || !payload.role) {
      console.log("Invalid JWT payload structure:", payload);
      return null;
    }

    console.log("Decoded JWT payload role:", payload.role);
    return payload;
  } catch (e) {
    console.log("JWT decode error:", e);
    return null;
  }
}

export function middleware(req: NextRequest) {
  console.log("Middleware running for:", req.nextUrl.pathname);

  // Check if we're on the dashboard path
  if (req.nextUrl.pathname.startsWith(DASHBOARD_PATH)) {
    console.log("Checking dashboard access");

    // Get user from JWT
    const user = getUserFromRequest(req);

    // Debug cookies
    console.log(
      "All cookies:",
      Array.from(req.cookies.getAll()).map((c) => c.name)
    );

    // If no user found, redirect to login
    if (!user) {
      console.log("User not found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check role
    if (user.role !== "event_organizer") {
      console.log("User role not allowed:", user.role);
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    console.log("Access granted to dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
