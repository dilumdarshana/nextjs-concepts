# Next basic concepts (V15)

## Technologies used
- NextJS
- MockAPI (https://mockapi.io/)
- JSON Placeholder (https://jsonplaceholder.typicode.com/)
- Clerk

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

- Layout - The root layout will take effect for all routes. When page re rendering, only the page contents will be rendered, layout doesn't re render

- Sub Layout - Inside each page folder, can have own layout name with layout.tsx
  Eg. products/[id]/layout.tsx

- Navigation - Next has next/link with <Link> component. Can use usePathname hook to identify the current path using 'next/navigation'
  Eg. import Link from 'next/link'
    import { usePathname } from 'next/navigation'

- Route Hanlder - Can create HTTP verbs (GET, POST, PUT, DELETE) as custom APIs. File name should be route.ts by convention
  Eg. app/users/route.ts -> GET => http://localhost:3000/users

- Route handler (dynamic routes) - Can create routes for dynamic routes. Create folder name with [id] inside the feature folder and create route call route.ts
  Eg. app/users/[id]/route.ts -> GET => http://localhost:3000/users/1

- Fetch data (from client side) - Traditional approach. Need to use the 'use client' directive.
  Eg. app/users-client/page.tsx -> localhost:3000/users-client

- Fetch data (from server side) - SSR way to fetch data from server. There are few rules to apply here. Loading and error has to be manged manually. Put loading.tsx and error.tsx insid the same folder. Names are mush follow the names.
  Eg. app/users-server/page.tsx -> localhost:3000/users-server
    app/users-server/loading.tsx
    app/users-server/error.tsx

- Server Actions - Execute code fragment from server side using 'use server' directive.
  Eg. app/users-form -> localhost:3000/users-form

- Authentication with Clerk
  Eg. app/layout.tsx
      app/components/navigation.tsx

## Setup Clerk
- Create a new Cleark account
- Follow bellow steps

```bash
pnpm add @clerk/nextjs

# follow instructions given by Clerk
```
- Protected routes
  - Add changes to src/middleware.ts
- Get logged in user infor from server components
  Eg. app/users-form/page.tsx -> import { auth, currentUser } from '@clerk/nextjs/server';
- Get looged in user info from client components
  Eg. app/components/counter.tsx -> import { useAuth, useUser } from '@clerk/nextjs';

## .env varialble access
- .env.local will be picked when in development mode
- Both client and server components can access the same environment variables
- Variable prefix matter here. Prefix NEXT_PUBLIC_ variables only can access from client components. Others can access by both client and server components

## Deployment
- TBD
