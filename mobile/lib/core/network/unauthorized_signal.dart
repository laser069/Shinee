import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Bumped by the Dio auth interceptor whenever a request comes back 401.
/// `AuthController` (in `features/auth`) listens to this to clear its state
/// — kept here, decoupled from `features/auth`, so `core/network` has no
/// dependency on a feature module.
class UnauthorizedSignal extends ChangeNotifier {
  void fire() => notifyListeners();
}

final unauthorizedSignalProvider = ChangeNotifierProvider<UnauthorizedSignal>((ref) => UnauthorizedSignal());
