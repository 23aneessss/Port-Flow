# Étape 1: Définir l'image de base commune
# Cette définition DOIT être la première pour que les autres stages puissent l'utiliser.
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production


# Étape 2: Installer les dépendances
# On part de l'image de base
FROM base AS deps
# libc6-compat utile pour certains modules natifs sur Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copie uniquement les fichiers nécessaires à l'installation des dépendances
# Cela permet de profiter du cache de Docker : si ces fichiers ne changent pas, cette étape n'est pas ré-exécutée.
COPY package.json package-lock.json ./

# Installe les dépendances en utilisant le lockfile pour une installation reproductible
RUN npm ci


# Étape 3: Construire l'application
# !! LA CORRECTION CLÉ EST ICI : on part de l'étape "deps", pas "base" !!
# Ainsi, on a déjà pnpm et les node_modules.
FROM deps AS builder
WORKDIR /app

# On copie le reste du code source du projet
COPY . .

# Pour désactiver la télémétrie Next.js pendant le build
ENV NEXT_TELEMETRY_DISABLED=1

# Build de l'application Next.js
RUN npm run build


# Étape 4: Étape finale, optimisée pour la production
# On repart d'une image de base propre pour qu'elle soit la plus légère possible
FROM base AS runner
WORKDIR /app

# Crée un groupe et un utilisateur non-root pour plus de sécurité
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# Copie les fichiers nécessaires depuis l'étape "builder"
# On ne copie que ce qui est strictement nécessaire à l'exécution

# Copie le dossier public (images, fonts, etc.)
COPY --from=builder /app/public ./public

# Copie le build standalone (optimisé pour la production) et le dossier static
# --chown permet de donner directement les bonnes permissions à l'utilisateur nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crée le dossier media pour les uploads et donne les bonnes permissions
RUN mkdir -p media && chown nextjs:nodejs media

# Passe à l'utilisateur non-root
USER nextjs

# Expose le port sur lequel l'application tournera
EXPOSE 3000

# Variables d'environnement pour le runtime
ENV PORT=3000
# HOSTNAME=0.0.0.0 est nécessaire pour que le conteneur soit accessible de l'extérieur
ENV HOSTNAME=0.0.0.0

# La commande pour démarrer le serveur Next.js en mode standalone
CMD ["node", "server.js"]