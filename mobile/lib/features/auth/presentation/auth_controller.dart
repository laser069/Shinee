import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/token_storage.dart';
import '../../../core/network/unauthorized_signal.dart';
import '../data/auth_api.dart';
import '../data/user_storage.dart';
import '../domain/user.dart';

/// Hand-written sealed union (not freezed — see `domain/user.dart`'s note on
/// the codegen toolchain/SDK mismatch).
sealed class AuthState {
  const AuthState();

  const factory AuthState.loading() = AuthLoading;
  const factory AuthState.authenticated({required User user, required String token}) = AuthAuthenticated;
  const factory AuthState.unauthenticated() = AuthUnauthenticated;

  T when<T>({
    required T Function() loading,
    required T Function(User user, String token) authenticated,
    required T Function() unauthenticated,
  }) {
    final self = this;
    return switch (self) {
      AuthLoading() => loading(),
      AuthAuthenticated(:final user, :final token) => authenticated(user, token),
      AuthUnauthenticated() => unauthenticated(),
    };
  }
}

/// Rehydrating from storage on boot — the splash gate.
final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated({required this.user, required this.token});
  final User user;
  final String token;
}

final class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// `login`/`register` intentionally do NOT go through `AuthState.loading` —
/// that state is reserved for the initial rehydrate gate. In-flight
/// submission state is local to the login/register pages so a failed
/// attempt doesn't bounce the router back to the splash screen.
class AuthController extends Notifier<AuthState> {
  late final TokenStorage _tokenStorage;
  late final UserStorage _userStorage;

  @override
  AuthState build() {
    _tokenStorage = TokenStorage();
    _userStorage = UserStorage();

    // A 401 from anywhere in the app clears session state here, mirroring
    // apiClient.ts's "any 401 -> clear storage, go to /login".
    ref.listen(unauthorizedSignalProvider, (previous, next) => handleUnauthorized());

    Future.microtask(_rehydrate);
    return const AuthState.loading();
  }

  Future<void> _rehydrate() async {
    try {
      final token = await _tokenStorage.readToken();
      final user = await _userStorage.read();
      if (token != null && user != null) {
        state = AuthState.authenticated(user: user, token: token);
        return;
      }
    } catch (_) {
      // A broken storage read shouldn't hang the splash gate forever —
      // fall through to the same "force login" path as missing data.
    }
    try {
      await _tokenStorage.clearToken();
      await _userStorage.clear();
    } catch (_) {
      // Best-effort clear; state below is what actually matters.
    }
    state = const AuthState.unauthenticated();
  }

  Future<void> login({required String email, required String password}) async {
    final api = ref.read(authApiProvider);
    final result = await api.login(email: email, password: password);
    await _tokenStorage.writeToken(result.token);
    await _userStorage.write(result.user);
    state = AuthState.authenticated(user: result.user, token: result.token);
  }

  Future<void> register({required String name, required String email, required String password}) async {
    final api = ref.read(authApiProvider);
    final result = await api.register(name: name, email: email, password: password);
    await _tokenStorage.writeToken(result.token);
    await _userStorage.write(result.user);
    state = AuthState.authenticated(user: result.user, token: result.token);
  }

  Future<void> logout() async {
    await _tokenStorage.clearToken();
    await _userStorage.clear();
    state = const AuthState.unauthenticated();
  }

  Future<void> handleUnauthorized() async {
    await _tokenStorage.clearToken();
    await _userStorage.clear();
    state = const AuthState.unauthenticated();
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
