// Vite turns a stylesheet import into a side effect and emits a CSS file. The
// compiler has no other way to know that, so this declares the shape. It names
// no global, which keeps the global scope to what tsconfig.json asked for.
declare module '*.css';
