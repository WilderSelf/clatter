// The one node type this repository needs. `@types/node` is a whole runtime
// surface, and the constraint list forbids a new dependency, so the two calls
// `profileHash` makes are declared here instead. `scripts/check-branding.mjs`
// already uses the same two calls, so the shape is proven inside this
// repository.

declare module 'node:crypto' {
  interface Hash {
    update(data: string): Hash;
    digest(encoding: 'hex'): string;
  }
  export function createHash(algorithm: 'sha256'): Hash;
}
