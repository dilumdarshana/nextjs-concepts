# Next basic concepts (V15)

## Create Next project
```bash
npx create-next-app@latest
```
## Getting Started

```bash
pnpm install

pnpm dev

```

## Main concepts
- Server Components - By default all are server components
- Client Components - Use 'use client' directive at the very top of the page

- Static Route - File based routing. Anything inside app folder will follow the route path page name must me page.tsx
  Eg. app/about/page.tsx -> localhost:3000/about
  app/blog/post/page.tsx -> localhost:3000/blog/post

- Dynamic Route - Still follow the file path pattern. Use [xxx] as a folder name for dynamic paths
  Eg. app/products/[id]/page.tsx -> localhost:3000/products/<id OR name>

- Route Groups - Use the paranthesis () as a group name of the folder. Then put dieferent folder names inside it for different routs within it
  Eg. app/(auth)/login/page.tsx -> localhost:3000/login
  app/(auth)/signup/page.ts -> localhost:3000/signup
  app/(auth)/forgot-password/page.tsx -> localhost:3000/forgot-password

- Layout 