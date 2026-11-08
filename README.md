# Daily

Daily is a polished Expo/React Native quote reader. It fetches a quote from the
DummyJSON Quotes API, caches it on-device, keeps a history and favorites list,
and asks the operating system to refresh the quote in the background.

## Run locally

```bash
yarn install
yarn start
```

Open the project in an iOS simulator, Android emulator, or a development build.
The app also renders in Expo Go, but Expo Go does not provide reliable native
background execution. Use a development or standalone build to test scheduling.

Useful checks:

```bash
yarn typecheck
yarn lint
yarn doctor
```

## Background tasks

The task is defined at module scope in
`src/tasks/quoteBackgroundTask.ts` and imported before navigation in
`src/app/_layout.tsx`. It uses `expo-background-task` with a 12-hour minimum
interval. The interval is a scheduling hint: iOS and Android decide when the
task actually runs, and neither platform promises an exact time.

On Android, build and install a development build, open the app once, then
inspect scheduled jobs with:

```bash
adb shell dumpsys jobscheduler
```

You can use the Expo background-task testing controls where supported, or
temporarily trigger the worker from a development-only test harness. On iOS,
use a development/standalone build on a physical device and exercise the
background refresh through Xcode's background task simulation. Background
execution is not dependable on a simulator and may be throttled by the OS.

## EAS builds

Install and authenticate with EAS, then create a build:

```bash
yarn global add eas-cli
eas build:configure
eas build --profile development --platform android
eas build --profile development --platform ios
```

Use a preview or production profile for distributable builds. Native background
execution requires the generated native configuration from the build; it is not
equivalent to a JavaScript timer and does not require notifications.

## Storage and offline behavior

`src/storage/quoteStorage.ts` owns AsyncStorage access and safely falls back
when data is missing or corrupted. A valid cached quote remains visible when
the API is unavailable, times out, or returns malformed data. Technical details
are logged only in development.
