import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/widgets/app_shell.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/auth/presentation/login_page.dart';
import 'features/auth/presentation/register_page.dart';
import 'features/auth/presentation/splash_page.dart';
import 'features/boards/presentation/boards_page.dart';
import 'features/habits/presentation/habits_page.dart';
import 'features/profile/presentation/profile_page.dart';
import 'features/stats/presentation/stats_page.dart';

/// Lets `AuthInterceptor`'s 401 handling reach the navigator from outside
/// the widget tree — kept for parity with the web's `window.location.href`
/// escape hatch, though the `redirect` guard below is what actually drives
/// navigation off of `AuthState` changes.
final rootNavigatorKey = GlobalKey<NavigatorState>();

/// Bridges Riverpod state changes into go_router's `refreshListenable` so
/// `redirect` re-runs every time `AuthState` changes. Caches the latest
/// `AuthState` on the notifier itself rather than having `redirect` call
/// `ref.read(authControllerProvider)` — go_router's redirect runs
/// synchronously off `notifyListeners`, at a point where that provider is
/// still mid-update and Riverpod forbids reading it.
class _RouterRefreshNotifier extends ChangeNotifier {
  _RouterRefreshNotifier(this.authState);
  AuthState authState;

  void update(AuthState next) {
    authState = next;
    notifyListeners();
  }
}

final _routerRefreshProvider = ChangeNotifierProvider<_RouterRefreshNotifier>((ref) {
  final notifier = _RouterRefreshNotifier(ref.read(authControllerProvider));
  ref.listen(authControllerProvider, (previous, next) => notifier.update(next));
  return notifier;
});

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(_routerRefreshProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: refresh,
    redirect: (context, routerState) {
      final auth = refresh.authState;
      final loc = routerState.matchedLocation;
      final atSplash = loc == '/splash';
      final atAuthScreen = loc == '/login' || loc == '/register';

      return auth.when(
        loading: () => atSplash ? null : '/splash',
        authenticated: (user, token) => (atSplash || atAuthScreen) ? '/boards' : null,
        unauthenticated: () => atAuthScreen ? null : '/login',
      );
    },
    routes: [
      GoRoute(path: '/splash', builder: (c, s) => const SplashPage()),
      GoRoute(path: '/login', builder: (c, s) => const LoginPage()),
      GoRoute(path: '/register', builder: (c, s) => const RegisterPage()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: '/boards', builder: (c, s) => const BoardsPage())]),
          StatefulShellBranch(routes: [GoRoute(path: '/habits', builder: (c, s) => const HabitsPage())]),
          StatefulShellBranch(routes: [GoRoute(path: '/stats', builder: (c, s) => const StatsPage())]),
          StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (c, s) => const ProfilePage())]),
        ],
      ),
    ],
  );
});
