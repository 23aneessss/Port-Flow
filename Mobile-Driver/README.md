# 🚛 PORT FLOW DRIVER

Application mobile React Native (TypeScript) pour les chauffeurs du système PORT FLOW.

## 📱 Aperçu

PORT FLOW DRIVER est une application mobile-first conçue pour les chauffeurs de poids lourds. Elle permet de :

- **Consulter les missions** assignées et confirmées
- **Accéder au QR code** pour entrer dans le port (time-gated 15 min avant le créneau)
- **Recevoir des notifications** pour les confirmations de trajets
- **Voir l'historique** des trajets effectués

## 🎨 Branding

| Couleur | Hex | Usage |
|---------|-----|-------|
| Navy | `#0F172A` | Background, headers |
| Cyan | `#38BDF8` | CTAs, accents, badges |
| Slate | `#64748B` | Texte secondaire |
| White | `#F8FAFC` | Cards, texte sur dark |

**Typographies :**
- Titres : **Montserrat** (Bold, SemiBold)
- UI : **Roboto Condensed** (Regular, Medium, Bold)

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app sur votre téléphone (pour tester)

### Installation

```bash
# Cloner le repo
cd Mobile-MC3.0

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
# ou
npx expo start
```

### Tester sur téléphone

1. Télécharger l'app **Expo Go** sur votre téléphone
2. Scanner le QR code affiché dans le terminal
3. L'app se lance automatiquement

## 📁 Structure du projet

```
src/
├── api/               # Client API et mock data
│   ├── client.ts      # Fonctions API (login, bookings, etc.)
│   ├── mockData.ts    # Données de test
│   └── index.ts
├── components/        # Composants réutilisables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── EmptyState.tsx
│   ├── Toast.tsx
│   ├── CountdownTimer.tsx
│   └── index.ts
├── context/           # Contextes React
│   ├── AuthContext.tsx
│   └── index.ts
├── hooks/             # Custom hooks
├── navigation/        # Configuration navigation
│   ├── AppNavigation.tsx
│   └── index.ts
├── screens/           # Écrans de l'app
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── QRCodeScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── ProfileScreen.tsx
│   └── index.ts
├── theme/             # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── types/             # Types TypeScript
│   └── index.ts
└── utils/             # Utilitaires
    ├── timeGating.ts  # Logique QR time-gating
    ├── dateFormat.ts  # Formatage dates FR
    ├── storage.ts     # SecureStore wrapper
    └── index.ts
```

## 🔐 Sécurité : Time-Gating QR

Le QR code n'est visible que **15 minutes avant** l'heure du créneau réservé.

```typescript
// src/utils/timeGating.ts
function isQrAvailable(startTimeISO: string, now: Date = new Date()): boolean {
  const startTime = new Date(startTimeISO);
  const qrAvailableTime = new Date(startTime.getTime() - 15 * 60 * 1000);
  return now >= qrAvailableTime;
}
```

## 🔌 API Endpoints

Configurer `EXPO_PUBLIC_API_URL` dans un fichier `.env` :

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

### Endpoints utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Authentification chauffeur (multi-rôle) |
| GET | `/driver/bookings/mine` | Récupérer les missions |
| GET | `/driver/notifications` | Liste des notifications |
| POST | `/driver/notifications/:id/read` | Marquer comme lu |
| GET | `/driver/history` | Historique des trajets |
| GET | `/driver/profile` | Profil chauffeur |
| GET | `/driver/bookings/:id/qr` | Générer/récupérer le payload QR |

## 📲 Écrans

1. **Splash** - Animation de démarrage avec branding
2. **Login** - Authentification (pas d'inscription)
3. **Home** - Mission actuelle + accès QR
4. **QR Code** - Affichage QR avec infos sécurité
5. **Notifications** - Liste avec badges non-lu
6. **Historique** - Trajets passés
7. **Profil** - Infos chauffeur + déconnexion

## 🛠️ Technologies

- **React Native** avec **Expo**
- **TypeScript** strict
- **React Navigation** (Stack + Bottom Tabs)
- **Expo SecureStore** pour tokens
- **react-native-qrcode-svg** pour QR
- **Google Fonts** (Montserrat, Roboto Condensed)

## 📝 Notes

- L'app est **mobile-first** : gros boutons, haute lisibilité
- Conçue pour être utilisée **d'une main** sur le terrain
- Le compte chauffeur est créé par le transporteur (pas de register)
- Les tokens sont stockés de manière sécurisée avec SecureStore

## 🚧 TODO

- [ ] Push notifications avec Expo Notifications
- [ ] Mode offline avec cache local
- [ ] Tests unitaires et E2E
- [ ] Build production iOS/Android

---

**PORT FLOW © 2024** - Application Chauffeur
