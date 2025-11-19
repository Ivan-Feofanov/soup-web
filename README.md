# Soup Web

A modern recipe management application built with SvelteKit, designed to help you organize and discover delicious recipes.

## Features

- **Recipe Management**: Create, edit, and view detailed recipes.
- **Rich Media**: Upload and view recipe images, powered by Cloudinary.
- **Tagging System**: Organize recipes with tags for easy filtering.
- **Authentication**: Secure user accounts and session management.
- **Responsive Design**: Beautiful UI built with TailwindCSS and Shadcn/Bits UI.
- **Cloud Native**: Deployed on Cloudflare Workers for high performance and scalability.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Components**: [Bits UI](https://www.bits-ui.com/) / [Lucide Icons](https://lucide.dev/)
- **Forms**: [Superforms](https://superforms.rocks/) & [Zod](https://zod.dev/)
- **Image CDN**: [Cloudinary](https://cloudinary.com/)
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd soup-web
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory. You may need to configure variables such as:
   - `PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `API_URL` (required for API requests and type generation)

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the application for production.
- `pnpm preview`: Preview the production build locally.
- `pnpm check`: Run SvelteKit sync and check.
- `pnpm lint`: Run Prettier and ESLint.
- `pnpm gen-types`: Generate TypeScript types from the OpenAPI spec.

## Deployment

This project is configured for deployment on Cloudflare Workers.

```bash
pnpm build
```

Ensure you have the Cloudflare Wrangler CLI installed and authenticated to deploy.
