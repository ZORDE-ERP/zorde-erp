# Stage 1: dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# Install only production dependencies and save to a separate directory
RUN npm install --omit=dev && cp -R node_modules /prod_node_modules
# Now install all dependencies (including devDependencies)
RUN npm install

# Stage 2: builder
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json tsconfig.build.json nest-cli.json webpack.config.js ./
COPY prisma ./prisma
COPY src ./src
# Generate Prisma Client and build
RUN npx prisma generate
RUN npm run build

# Stage 3: runner
FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs && adduser --system --uid 1001 nestjs

# Copy production node_modules and Prisma client packages
COPY --from=deps /prod_node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

RUN chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
