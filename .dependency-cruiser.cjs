// Architecture rules (ADR-0002), checked by `pnpm check` and by tests/architecture.test.ts.
// Every `comment` tells whoever broke the rule how to fix it.
// A rule that gets in the way during the kata is noted for /retro, not switched off.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This import closes a cycle. Break it by moving the shared piece into the module both sides depend on (in a service, usually down into domain/), or by passing it in as an argument instead of importing it.",
      from: {},
      to: { circular: true },
    },
    {
      name: "services-are-isolated",
      severity: "error",
      comment:
        "A service never imports another service's code. Declare a port in domain/ports/<other>.port.ts, implement it in infra/<other>-http.adapter.ts with createServiceClient from @hmk/kit and the other service's schemas from @hmk/contracts, and wire it in composition.ts. See services/rounds/src/infra/catalog-http.adapter.ts.",
      from: { path: "^services/([^/]+)/" },
      to: { path: "^services/", pathNot: "^services/$1/" },
    },
    {
      name: "domain-is-pure",
      severity: "error",
      comment:
        "domain/ may only import its own domain/ and types from @hmk/contracts: no npm packages (hono, zod, better-auth...), no node: modules, no application/, infra/ or http/. Pass what the domain needs as arguments, or declare a port in domain/ports/ and implement it in infra/. Validation with zod belongs in http/.",
      from: { path: "^services/([^/]+)/src/domain/" },
      to: { pathNot: "^(services/$1/src/domain/|packages/contracts/)" },
    },
    {
      name: "application-knows-no-details",
      severity: "error",
      comment:
        "application/ (use cases and queries) only uses domain/. Depend on the port or repository interface declared in domain/ and let composition.ts pass in the infra/ adapter. HTTP concerns stay in http/.",
      from: { path: "^services/([^/]+)/src/application/" },
      to: {
        path: "^services/$1/src/(infra/|http/|composition\\.ts|main\\.ts)",
      },
    },
    {
      name: "http-is-thin",
      severity: "error",
      comment:
        "http/ routes call use cases and queries from application/ and validate with @hmk/contracts. They never reach into domain/ (except *.errors.ts) or infra/. Receive the use cases as arguments of the routes function and build them in composition.ts.",
      from: { path: "^services/([^/]+)/src/http/" },
      to: {
        path: "^services/$1/src/(domain|infra)/",
        pathNot: "^services/$1/src/domain/[^/]+\\.errors\\.ts$",
      },
    },
    {
      name: "only-composition-sees-infra",
      severity: "error",
      comment:
        "Only composition.ts imports infra/ adapters (tests in test/ may too). Elsewhere, depend on the port or repository interface from domain/ and receive the adapter through the constructor; composition.ts decides which adapter to pass.",
      from: {
        path: "^services/([^/]+)/src/",
        pathNot: "^services/[^/]+/src/(composition\\.ts|infra/)",
      },
      to: { path: "^services/$1/src/infra/" },
    },
    {
      name: "services-have-no-ui",
      severity: "error",
      comment:
        "Services are backends: they never import @hmk/ui or apps/. Screens live in apps/web/src/features/<group>/ and reach the service through the gateway with `api` from apps/web/src/shell.",
      from: { path: "^services/" },
      to: { path: "^(packages/ui/|apps/)" },
    },
    {
      name: "web-talks-http-only",
      severity: "error",
      comment:
        "The web app never imports service code. Call the service through the gateway with `api('/<service>/...')` from apps/web/src/shell/api.ts and parse the answer with the schema from @hmk/contracts.",
      from: { path: "^apps/" },
      to: { path: "^services/" },
    },
    {
      name: "features-are-isolated",
      severity: "error",
      comment:
        "A feature in apps/web/src/features/<group>/ imports another feature only through its index.ts, the screens that group agreed to export. Share code through apps/web/src/shell/ (open a PR) or @hmk/ui; to show another group's data, fetch it from their service.",
      from: { path: "^apps/web/src/features/([^/]+)/" },
      to: {
        path: "^apps/web/src/features/",
        pathNot: [
          "^apps/web/src/features/$1/",
          "^apps/web/src/features/[^/]+/index\\.tsx?$",
        ],
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(dist|dist-types|storybook-static)/" },
    // Type-only imports count too: a domain that imports a type from infra/ still depends on it.
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "node", "default"],
      extensions: [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
