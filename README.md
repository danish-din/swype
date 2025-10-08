# SwipeFlow

SwipeFlow is a swipe-first triage tool prototype built with Expo Router, Reanimated, and Zustand. The app connects to mocked data sources and lets you map swipe directions to mocked actions, swipe through paginated decks, undo actions, and monitor activity with retry + backoff.

## Getting Started

```bash
npm install -g expo-cli # if you don't already have the Expo CLI
pnpm install           # or use `npm install` / `yarn install`
pnpm exec expo start   # or `npx expo start`
```

Expo will provide a QR code and platform options to launch the app in development.

## Features

- Mock connector selection (Trello, Gmail, Notion)
- Customizable swipe mappings persisted locally
- Tinder-style deck with gesture-driven left/right swipes and accessibility buttons
- Optimistic queue with background retry (exponential backoff) and undo history (10 actions)
- Activity log showing operation status with retry controls
- Settings with haptics toggle and undo cache clearing

## Known Limitations / Next Steps

- Connectors are mocked; real OAuth + APIs would replace the service stubs
- Only left/right swipes are implemented (no vertical gestures yet)
- Undo issues a mock compensating action rather than a real API rollback
- UI is optimized for phones; tablet/Desktop layout could be improved
