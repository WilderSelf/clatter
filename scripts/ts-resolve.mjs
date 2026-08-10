// A resolve hook, so this harness can import the application's own modules as
// its oracle.
//
// Node runs TypeScript by stripping the types, but its resolver is the ESM one:
// a relative specifier must carry its extension. The application is built by
// Vite, whose resolver supplies the extension, so every module in `src/` imports
// its neighbour without one. This hook adds `.ts` and nothing else.
//
// It is a hook of the CHECK and never of the shipped application. Nothing in
// `src/` reads it, and `npm run build` never loads it.

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]sx?$|\.json$|\.css$/.test(specifier)) {
    try {
      return await next(`${specifier}.ts`, context);
    } catch {
      // Not a TypeScript module under that name. Let the default answer.
    }
  }
  return next(specifier, context);
}
