import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../theme/theme_controller.dart';
import '../theme/tokens.dart';

/// Material adaptation of the web's 80px sticky Navbar: a top [AppBar]
/// carrying the `SH[I]NEE` Syne logo + theme toggle, and a bottom
/// [NavigationBar] for Boards / Habits / Stats / Profile. Board detail and
/// auth screens are full-screen pushes outside this shell.
class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _destinations = [
    NavigationDestination(icon: Icon(Icons.view_kanban_outlined), selectedIcon: Icon(Icons.view_kanban), label: 'Boards'),
    NavigationDestination(icon: Icon(Icons.local_fire_department_outlined), selectedIcon: Icon(Icons.local_fire_department), label: 'Habits'),
    NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Stats'),
    NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.brutal;
    final themeMode = ref.watch(themeModeProvider);
    final isDark = switch (themeMode) {
      ThemeMode.dark => true,
      ThemeMode.light => false,
      ThemeMode.system => MediaQuery.platformBrightnessOf(context) == Brightness.dark,
    };

    return Scaffold(
      appBar: AppBar(
        title: RichText(
          text: TextSpan(
            style: const TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.w800, fontSize: 20),
            children: [
              TextSpan(text: 'SH', style: TextStyle(color: t.fg)),
              TextSpan(text: '[I]', style: TextStyle(color: t.accent)),
              TextSpan(text: 'NEE', style: TextStyle(color: t.fg)),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.dark_mode : Icons.light_mode),
            onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
          ),
        ],
      ),
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (i) => navigationShell.goBranch(
          i,
          initialLocation: i == navigationShell.currentIndex,
        ),
        destinations: _destinations,
      ),
    );
  }
}
