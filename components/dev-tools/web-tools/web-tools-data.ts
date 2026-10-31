export interface ExternalDevTool {
  id: string
  name: string
  description: string
  url: string
  category: "Converters" | "API & Network" | "Performance & Specs" | "RegEx & Parsers" | "Diagrams & Design" | "Security & Utilities"
  tags: string[]
  badge?: string
  isPopular?: boolean
}

export const EXTERNAL_DEV_TOOLS: ExternalDevTool[] = [
  // Converters & Code
  {
    id: "transform-tools",
    name: "Transform.tools",
    description: "Multipurpose polyglot converter: JSON to TypeScript, SVG to JSX, HTML to JSX, CSS to Tailwind, GraphQL to TypeScript.",
    url: "https://transform.tools",
    category: "Converters",
    tags: ["typescript", "json", "svg", "jsx", "tailwind", "converter"],
    badge: "Must-Have",
    isPopular: true,
  },
  {
    id: "ray-so",
    name: "Ray.so",
    description: "Create gorgeous, production-ready code snippet screenshots with custom dark/light gradients, padding, and language syntax.",
    url: "https://ray.so",
    category: "Converters",
    tags: ["snippet", "screenshot", "presentation", "sharing", "syntax"],
    badge: "Popular",
    isPopular: true,
  },
  {
    id: "quicktype",
    name: "QuickType",
    description: "Instantly generate strongly-typed models, serializers, and schemas from JSON in TypeScript, Go, C#, Python, Rust, and Java.",
    url: "https://quicktype.io",
    category: "Converters",
    tags: ["json", "types", "golang", "typescript", "csharp", "schema"],
    badge: "Fast",
    isPopular: true,
  },
  {
    id: "carbon",
    name: "Carbon.now.sh",
    description: "Create and share aesthetic images of your source code with customizable themes, drop shadows, and window controls.",
    url: "https://carbon.now.sh",
    category: "Converters",
    tags: ["code", "image", "export", "presentation"],
  },
  {
    id: "bundlephobia",
    name: "Bundlephobia",
    description: "Find the exact bundle size, minified size, gzip weight, and download time impact of any npm package before installing.",
    url: "https://bundlephobia.com",
    category: "Performance & Specs",
    tags: ["npm", "bundle", "performance", "gzip", "javascript"],
    badge: "Indispensable",
    isPopular: true,
  },

  // API & Network
  {
    id: "hoppscotch",
    name: "Hoppscotch",
    description: "Open-source, lightning-fast web-based API development ecosystem. Send REST, GraphQL, and WebSocket requests directly in browser.",
    url: "https://hoppscotch.io",
    category: "API & Network",
    tags: ["api", "rest", "graphql", "websocket", "client", "postman"],
    badge: "Postman Alt",
    isPopular: true,
  },
  {
    id: "webhook-site",
    name: "Webhook.site",
    description: "Instant unique URL to capture, inspect, and debug incoming webhooks, HTTP requests, headers, and payloads in real time.",
    url: "https://webhook.site",
    category: "API & Network",
    tags: ["webhook", "debug", "payload", "http", "testing"],
    badge: "Live Debug",
    isPopular: true,
  },
  {
    id: "httpbin",
    name: "Httpbin.org",
    description: "Simple HTTP request & response service. Test status codes, delays, basic auth, redirects, and custom response bodies.",
    url: "https://httpbin.org",
    category: "API & Network",
    tags: ["http", "mock", "testing", "headers", "status"],
  },
  {
    id: "badgen",
    name: "Badgen.net",
    description: "Fast, SVG badge generator for GitHub READMEs, build statuses, version tags, and custom metrics with icons and colors.",
    url: "https://badgen.net",
    category: "API & Network",
    tags: ["badges", "svg", "readme", "github", "shields"],
  },

  // Performance & Standards
  {
    id: "caniuse",
    name: "Can I Use",
    description: "Up-to-date browser support tables for modern desktop and mobile browsers across HTML5, CSS features, and JavaScript APIs.",
    url: "https://caniuse.com",
    category: "Performance & Specs",
    tags: ["browser", "compatibility", "css", "html5", "web-apis"],
    badge: "Essential",
    isPopular: true,
  },
  {
    id: "pagespeed",
    name: "PageSpeed Insights",
    description: "Google's official web performance and Core Web Vitals diagnostic tool for mobile and desktop page speed scoring.",
    url: "https://pagespeed.web.dev",
    category: "Performance & Specs",
    tags: ["google", "performance", "cwv", "lighthouse", "seo"],
  },
  {
    id: "squoosh",
    name: "Google Squoosh",
    description: "In-browser image compression tool by Google Chrome Labs. Compare MozJPEG, WebP, AVIF, and OxiPNG with live slider.",
    url: "https://squoosh.app",
    category: "Performance & Specs",
    tags: ["image", "compression", "webp", "avif", "google"],
  },
  {
    id: "svgomg",
    name: "SVGOMG",
    description: "Web GUI for SVGO. Clean, optimize, and strip metadata from SVG graphics to dramatically reduce payload size.",
    url: "https://jakearchibald.github.io/svgomg/",
    category: "Performance & Specs",
    tags: ["svg", "optimization", "cleaner", "vector"],
  },

  // RegEx & Parsers
  {
    id: "regex101",
    name: "Regex101",
    description: "Full-featured regular expression tester and debugger with step-by-step match explanations, PCRE/JavaScript/Python engines.",
    url: "https://regex101.com",
    category: "RegEx & Parsers",
    tags: ["regex", "debugger", "evaluator", "pcre", "javascript"],
    badge: "Top RegEx",
    isPopular: true,
  },
  {
    id: "crontab-guru",
    name: "Crontab.guru",
    description: "The quick and simple cron schedule expression editor. Type in any cron format to see plain English execution timing.",
    url: "https://crontab.guru",
    category: "RegEx & Parsers",
    tags: ["cron", "schedule", "parser", "devops", "linux"],
  },
  {
    id: "astexplorer",
    name: "AST Explorer",
    description: "Interactive Abstract Syntax Tree parser and visualizer for JavaScript, TypeScript, Babel, CSS, HTML, and GraphQL.",
    url: "https://astexplorer.net",
    category: "RegEx & Parsers",
    tags: ["ast", "parser", "compiler", "babel", "typescript"],
  },
  {
    id: "jsonpath",
    name: "JSONPath Evaluator",
    description: "Test and debug JSONPath expressions against complex nested JSON objects with real-time query match results.",
    url: "https://jsonpath.com",
    category: "RegEx & Parsers",
    tags: ["json", "jsonpath", "query", "filter"],
  },

  // Diagrams & Architecture
  {
    id: "excalidraw",
    name: "Excalidraw",
    description: "Virtual collaborative whiteboard for sketching hand-drawn diagrams, software architecture, UI wireframes, and flows.",
    url: "https://excalidraw.com",
    category: "Diagrams & Design",
    tags: ["architecture", "diagram", "whiteboard", "wireframe", "sketch"],
    badge: "Team Favorite",
    isPopular: true,
  },
  {
    id: "mermaid-live",
    name: "Mermaid Live Editor",
    description: "Online code-based diagram generator. Turn Markdown-like text definitions into flowcharts, sequence diagrams, and Gantt charts.",
    url: "https://mermaid.live",
    category: "Diagrams & Design",
    tags: ["mermaid", "flowchart", "sequence", "architecture", "markdown"],
    badge: "Markdown",
    isPopular: true,
  },
  {
    id: "eraser-io",
    name: "Eraser.io",
    description: "All-in-one document and diagram editor built for engineering teams. Write technical specs alongside live architectural diagrams.",
    url: "https://www.eraser.io",
    category: "Diagrams & Design",
    tags: ["architecture", "spec", "diagram", "docs"],
  },
  {
    id: "dbdocs",
    name: "dbdocs.io",
    description: "Generate and host interactive, searchable database documentation and ER diagrams directly from simple DBML syntax.",
    url: "https://dbdocs.io",
    category: "Diagrams & Design",
    tags: ["database", "erd", "dbml", "schema", "postgres"],
  },

  // Security & Utilities
  {
    id: "cyberchef",
    name: "CyberChef",
    description: "The Swiss Army Knife for encryption, encoding, compression, hashing, and data analysis by GCHQ. Run multi-step data pipelines.",
    url: "https://gchq.github.io/CyberChef/",
    category: "Security & Utilities",
    tags: ["crypto", "encoding", "decoding", "hex", "security", "pipeline"],
    badge: "Swiss Army Knife",
    isPopular: true,
  },
  {
    id: "jwt-io",
    name: "JWT.io",
    description: "Decode, verify, and generate JSON Web Tokens with secret validation and claims inspector.",
    url: "https://jwt.io",
    category: "Security & Utilities",
    tags: ["jwt", "auth", "token", "security"],
  },
  {
    id: "keycodes",
    name: "Keycode.info",
    description: "JavaScript event keycode visualizer by Wes Bos. Press any key to see event.key, event.code, and keyCode values.",
    url: "https://keycode.info",
    category: "Security & Utilities",
    tags: ["keyboard", "events", "javascript", "dom"],
  },
]
