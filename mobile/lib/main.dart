import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/cache/cache_box.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'router.dart' show routerProvider;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await CacheBox.init();
  runApp(const ProviderScope(child: ShineeApp()));
}

class ShineeApp extends ConsumerWidget {
  const ShineeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'SHINEE',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      routerConfig: router,
    );
  }
}
