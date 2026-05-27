# Flowmate – Contexte permanent pour Claude

## 1. Stack technique
- React Native 0.85 (Expo 56)
- Navigation : bottom tabs (5 onglets) + stack modal pour le guide
- Stockage : AsyncStorage (clés `@flowmate:thoughts`, `@flowmate:draft`)
- UI : composants maison dans `src/components/`
- Thème : `ThemeContext` (light/dark/system) – utiliser `useTheme()`
- Gestes : Reanimated 4 + Gesture Handler
- API : backend Vercel (`/api/classify`, `/api/extract-date`, `/api/brief`, `/api/decompose`)

## 2. Structure des données (ThoughtContext)
Une pensée = 
{
  id, text, tag, reminder, createdAt, archived, archivedAt, steps
}

Tags valides (français) : 
  'tâche', 'idée', 'rendez-vous', 'émotion', 'rappel', 'routine', 'achat', 'santé', 'travail', 'autre'

Reminder (si présent) : 
  { hasDate, title, date, time, duration }

Steps : tableau de { label, done }

## 3. Composants clés
- `Card` : swipe gauche (archive), spinner (classification), badge reminder, expansion du texte, bouton décomposer si tag = 'tâche'
- `Tag` : badge avec couleur selon tag (mustard, terra, petrol, sage)
- `Fab` : bouton flottant moutarde, animation withSpring
- `CaptureModal` : champ texte + sauvegarde brouillon
- `KebabMenu` : trois points (développer, archiver)

## 4. Navigation (5 onglets, dans l’ordre)
1. Accueil → HomeScreen (pensées non archivées)
2. Focus → BodyDoublingScreen (timer Pomodoro)
3. Calendrier → CalendarScreen (rappels)
4. Archives → ArchiveScreen
5. Profil → ProfileScreen (stats, thème, guide)

## 5. Thème (couleurs)
- paper (#FAF8F5), paper2 (#F3EFE7), sage (#C5CFC1), petrol (#A3B5C7)
- mustard (#D4A017), terra (#C8734C), sepia (#3E3A35)
- En sombre : mustard → #E6B422, text → #E6DFD2, fond → #1E1C1A

## 6. Règles UI/UX
- Coins : cartes 18px, boutons 12px
- Ombre douce : elevation 3, shadowOpacity 0.08
- Haptique sur actions importantes
- Tutoiement, pas de messages culpabilisants

## 7. Points d’extension en cours
- Tiroirs (concept à implémenter) : voir preview HTML fournie séparément
- Mode sombre : déjà fonctionnel (`ThemeContext`)

## 8. Commandes utiles
- `npx expo start`
- `npx expo run:android` (build local APK développement)
- `eas build --profile preview --local` (build local autonome)

## 9. Fichiers sensibles (à ne pas modifier sans précaution)
- `src/context/ThoughtContext.js`
- `src/navigation/index.js`
- `src/theme/index.js`