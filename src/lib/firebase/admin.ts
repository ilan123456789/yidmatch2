
// Cloudflare Workers and Edge runtimes do not support the Node.js gRPC/TLS internals
// or dynamic code generation (eval/new Function) required by the heavy firebase-admin SDK.
// When deployed to Cloudflare, the application safely operates using the built-in edge persistence.

export function getFirebaseAdmin(): {
  adminAuth: any;
  adminDb: any;
  adminStorage: any;
} | null {
  return null;
}

