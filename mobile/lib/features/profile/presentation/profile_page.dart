import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/tokens.dart';
import '../../../core/widgets/brutal_button.dart';
import '../../auth/presentation/auth_controller.dart';

/// Placeholder screen scaffolded in Phase 1, wired to auth in Phase 2 —
/// full profile/backup/restore UI lands in Phase 6.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.brutal;
    final auth = ref.watch(authControllerProvider);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            auth.when(
              loading: () => const CircularProgressIndicator(),
              unauthenticated: () => Text('Not signed in', style: TextStyle(color: t.fg)),
              authenticated: (user, token) => Text(
                'Signed in as ${user.email}',
                style: TextStyle(color: t.fg, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 20),
            BrutalButton(
              label: 'Log Out',
              variant: BrutalButtonVariant.danger,
              onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            ),
          ],
        ),
      ),
    );
  }
}
