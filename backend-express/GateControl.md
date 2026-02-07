 🛂 Gate Control & Internal Truck Orchestration
## Approche de solution pour la régulation intelligente de l’accès et de la circulation interne au port

---

## 1. Contexte et problématique réelle

Les ports maritimes modernes font face à une **congestion chronique**, non seulement à l’entrée du port, mais surtout **à l’intérieur des terminaux**.  
La problématique ne se limite pas à autoriser ou refuser l’accès des camions : elle concerne **la gestion du flux après l’entrée**.

Dans la majorité des ports aujourd’hui :

- Les camions arrivent parfois **trop tôt** ou **hors créneau**
- Les zones d’attente sont **mal organisées**
- Les files internes (lanes) sont **déséquilibrées**
- Certaines grues ou équipements sont **surchargés** tandis que d’autres sont sous-utilisés
- Les chauffeurs ne savent pas :
  - où attendre
  - quand avancer
  - quelle file emprunter
  - par où sortir après l’opération

👉 Résultat :  
**perte de temps, congestion interne, inefficacité opérationnelle et stress pour les chauffeurs et opérateurs.**

La problématique proposée dans le hackathon évoque déjà :
- la régulation de l’accès au port
- la gestion des créneaux
- le manque de visibilité en temps réel  

Mais **le vrai problème critique du port** se situe **après le gate**.

---

## 2. Vision de la solution proposée

Notre approche ne se limite pas à un simple système de réservation de créneaux.  
Elle introduit une **logique de “Gate Control & Internal Orchestration”** :

> *Passer d’un système qui autorise l’entrée, à un système qui guide et orchestre le parcours du camion à l’intérieur du port.*

L’objectif est de transformer le port en un espace **piloté**, où chaque camion :
- sait **quand entrer**
- sait **où attendre**
- sait **quand avancer**
- sait **par où sortir**

---

## 3. Principe clé : Gate Control intelligent

Le **Gate Control** devient un point de décision intelligent, et non plus un simple point de passage.

Il agit comme un **filtre dynamique**, basé sur :
- la validité de la réservation
- la fenêtre horaire réelle
- l’état du terminal
- la charge interne actuelle

Le gate est donc connecté au système central et agit comme une **extension opérationnelle du moteur de réservation**.

---

## 4. Parcours complet d’un camion (end-to-end)

### 4.1. Avant l’arrivée — réservation et préparation

1. Le transporteur effectue une **demande de réservation**
2. L’opérateur valide la demande selon la capacité du terminal
3. Le système :
   - réserve un slot
   - prépare un **plan de passage interne**
   - garde le QR code **inactif**

À ce stade, le camion est **autorisé à venir**, mais pas encore à entrer.

---

### 4.2. Pré-arrivée — sécurisation temporelle

- **T-30 min** : notification de préparation envoyée au chauffeur
- **T-15 min** : activation et envoi du **QR code dynamique**

Caractéristiques du QR :
- validité temporelle courte
- lié à un chauffeur précis
- lié à un terminal précis
- non réutilisable

👉 Cela empêche :
- les arrivées trop tôt
- les entrées hors créneau
- les usages frauduleux

---

### 4.3. Arrivée au Gate — décision en temps réel

Lors du scan du QR code, le Gate Control vérifie :

1. **QR valide ?**
2. **Créneau horaire respecté ?**
3. **Terminal actif et non saturé ?**

#### Cas 1 — Accès autorisé
- Le camion entre
- Le statut passe à `IN_PORT`
- Le système fournit une **instruction claire** :
  - zone d’attente assignée

#### Cas 2 — Trop tôt / trop tard
- Accès refusé temporairement
- Instruction :
  - attendre dans une zone externe
  - ou replanifier

#### Cas 3 — Incident interne
- Accès différé
- Le chauffeur est redirigé vers une zone tampon

---

## 5. Orchestration interne du terminal (innovation clé)

### 5.1. Zones internes modélisées

À l’intérieur du port, on distingue :

- **Waiting Zones (zones d’attente)**  
  Espaces tampon avant traitement
- **Lanes (files internes)**  
  Files menant aux zones de chargement/déchargement
- **Service Points / Cranes (ressources)**  
  Grues ou équipements de manutention
- **Exit Gates (portes de sortie)**  

Chaque camion suit un **parcours contrôlé**.

---

### 5.2. Logique de Dispatch (MVP réaliste)

À l’approbation ou à l’entrée :

- le système assigne :
  - une **zone d’attente**
  - une **file (lane)**
  - une **porte de sortie**

Décision basée sur :
- le nombre de camions en attente
- la capacité restante par lane
- le type d’opération (chargement / déchargement)

👉 Règles simples, mais efficaces et explicables.

---

### 5.3. Extension intelligente (bonus innovation)

En version avancée, le système peut intégrer :
- l’état des grues (`ACTIVE / BUSY / DOWN`)
- le workload par zone
- des règles de réaffectation dynamique

Exemples :
- grue en panne → reroutage automatique
- file saturée → redirection vers une autre lane

---

## 6. Expérience chauffeur : guidage clair et progressif

Le chauffeur ne reçoit **pas tout en une fois**.

Il reçoit des instructions **étape par étape** :

1. *“Proceed to Waiting Zone B”*
2. *“Advance to Lane 3 (RTG-2)”*
3. *“Operation completed — Exit via Gate E2”*

En cas d’incident :
- *“Lane blocked — please wait”*
- *“Rerouted to Lane 1”*

👉 Le chauffeur devient un **acteur guidé**, et non une source de désordre.

---

## 7. Valeur ajoutée de l’approche

### Pour le port
- réduction de la congestion interne
- meilleure utilisation des ressources
- traçabilité complète des flux

### Pour les opérateurs
- visibilité en temps réel
- décisions assistées
- moins d’interventions manuelles

### Pour les chauffeurs
- moins d’attente inutile
- instructions claires
- stress réduit

---

## 8. Positionnement par rapport à la problématique du hackathon

Cette approche répond directement à :
- la régulation des flux
- le manque de visibilité
- la saturation des terminaux

---

## 9. APIs de la solution (MVP actuel)

Le backend actuel couvre déjà une base exploitable pour le Gate Control :

- `POST /carrier/register`  
  Inscription transporteur (avec statut `PENDING`, validation admin ensuite)
- `POST /carrier/bookings`  
  Création d’une demande de slot
- `GET /carrier/bookings`  
  Suivi des demandes transporteur
- `GET /operator/bookings`  
  Vue opérationnelle des demandes
- `POST /operator/bookings/:id/approve`  
  Validation opérationnelle d’un créneau
- `POST /operator/bookings/:id/reject`  
  Rejet opérationnel
- `GET /driver/bookings/mine`  
  Vue chauffeur des missions assignées
- `GET /driver/bookings/:id/qr`  
  QR utilisé au gate
- `GET /driver/notifications`  
  Instructions/alertes chauffeur

👉 Ces endpoints permettent déjà la boucle MVP : demande, validation, notification, passage QR.

---

## 10. Endpoints CRUD à ajouter (Future Gate Control)

Pour industrialiser l’orchestration interne, voici les APIs recommandées (brief) :

### 10.1. Waiting Zones (CRUD)
- `POST /admin/waiting-zones`
- `GET /admin/waiting-zones`
- `GET /admin/waiting-zones/:id`
- `PUT /admin/waiting-zones/:id`
- `DELETE /admin/waiting-zones/:id`

### 10.2. Lanes internes (CRUD)
- `POST /admin/lanes`
- `GET /admin/lanes`
- `GET /admin/lanes/:id`
- `PUT /admin/lanes/:id`
- `DELETE /admin/lanes/:id`

### 10.3. Service Points / Cranes (CRUD + statut)
- `POST /admin/service-points`
- `GET /admin/service-points`
- `GET /admin/service-points/:id`
- `PUT /admin/service-points/:id`
- `DELETE /admin/service-points/:id`
- `PATCH /operator/service-points/:id/status` (`ACTIVE | BUSY | DOWN`)

### 10.4. Gate decisions & events
- `POST /gate/scan` (validation QR + fenêtre horaire + état terminal)
- `POST /gate/events` (`ENTER_GRANTED`, `ENTER_DENIED`, `EXIT_CONFIRMED`)
- `GET /operator/gate/events?date=&terminalId=`

### 10.5. Dispatch interne camion
- `POST /operator/bookings/:id/dispatch` (assign waiting zone / lane / exit gate)
- `PATCH /operator/dispatch/:id/reassign` (reroutage dynamique)
- `GET /operator/dispatch?status=`
- `GET /driver/dispatch/current` (instruction active chauffeur)

### 10.6. Audit & traçabilité opérationnelle
- `GET /operator/bookings/:id/timeline`
- `GET /admin/analytics/gate-throughput`
- `GET /admin/analytics/zone-occupancy`

Ces endpoints futurs donnent une vraie couche “Gate Control” : contrôle d’entrée + pilotage interne + preuve opérationnelle.
---

## 11. Architecture Diagram

![Gate Control Architecture](diagram.png)