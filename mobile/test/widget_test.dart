// Smoke test: app boots to the splash gate, then routes an unauthenticated
// session to /login. Feature-level tests land alongside their features per
// phase.
//
// flutter_secure_storage and shared_preferences both hit platform channels
// during AuthController's rehydrate — mock both so the read resolves
// (to "nothing stored") instead of hanging on an unregistered channel.

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/main.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    const secureStorageChannel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      secureStorageChannel,
      (call) async => call.method == 'read' ? null : <String, String>{},
    );
  });

  testWidgets('Unauthenticated boot lands on the login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ShineeApp()));
    // Rehydrate (empty storage -> unauthenticated) + redirect to /login,
    // then let the login page's 700ms entrance animation finish.
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
    // BrutalButton uppercases its label.
    expect(find.text('SIGN IN NOW'), findsOneWidget);
  });
}
