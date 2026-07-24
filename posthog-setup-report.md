<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this Expo subscription management app. The integration covers the full user journey — from account creation and authentication through subscription browsing and sign-out. PostHog is initialized in `src/config/posthog.ts` via `expo-constants`, wrapped around the app in `app/_layout.tsx` with `PostHogProvider`, and manual screen tracking fires on every route change via `posthog.screen()`. Users are identified on sign-in and sign-up using Clerk's user/session IDs. Autocapture is enabled for touch events. This run also installed the missing peer dependencies (`expo-file-system`, `expo-application`, `expo-localization`) and added the `expo-localization` plugin to `app.config.js`.

| Event name | Description | File |
|---|---|---|
| `user_signed_in` | Fired when a user successfully completes sign-in with password or password + MFA. | `src/app/(auth)/sign-in.tsx` |
| `sign_in_error` | Fired when a sign-in attempt fails, capturing the error message. | `src/app/(auth)/sign-in.tsx` |
| `mfa_code_requested` | Fired when an MFA email code is sent to the user during sign-in. | `src/app/(auth)/sign-in.tsx` |
| `mfa_verified` | Fired when the user successfully verifies their MFA email code. | `src/app/(auth)/sign-in.tsx` |
| `user_signed_up` | Fired when a user successfully creates a new account. | `src/app/(auth)/sign-up.tsx` |
| `sign_up_error` | Fired when account creation fails, capturing the error message. | `src/app/(auth)/sign-up.tsx` |
| `email_verification_sent` | Fired when an email verification code is dispatched to the new user. | `src/app/(auth)/sign-up.tsx` |
| `email_verification_completed` | Fired when the user successfully verifies their email address during sign-up. | `src/app/(auth)/sign-up.tsx` |
| `subscription_card_expanded` | Fired when the user taps a subscription card to expand its details on the home screen. | `src/app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | Fired when the user navigates to a subscription's detail screen. | `src/app/subscriptions/[id].tsx` |
| `user_signed_out` | Fired when the user logs out from the settings screen. | `src/app/(tabs)/settings.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/231990/dashboard/848011)
- [User sign-ins & sign-ups (wizard)](https://eu.posthog.com/project/231990/insights/WZsoQ1pp)
- [Sign-up conversion funnel (wizard)](https://eu.posthog.com/project/231990/insights/zuegrpkN)
- [Subscription engagement (wizard)](https://eu.posthog.com/project/231990/insights/uD0LlYby)
- [Auth errors (wizard)](https://eu.posthog.com/project/231990/insights/G7icPUeH)
- [User sign-outs (wizard)](https://eu.posthog.com/project/231990/insights/zervs1Wm)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
