import 'package:dio/dio.dart';

import 'auth_interceptor.dart';
import 'token_storage.dart';

/// Default emulator loopback to the host machine's `localhost:5000`
/// (`10.0.2.2` is the Android emulator's alias for the host). A physical
/// device must override this with the host's LAN IP via `--dart-define`:
///
///   flutter run --dart-define=API_URL=http://192.168.1.23:5000
const _defaultApiUrl = 'http://10.0.2.2:5000';
const apiUrl = String.fromEnvironment('API_URL', defaultValue: _defaultApiUrl);

/// Builds the shared [Dio] instance. `onUnauthorized` is supplied by
/// `router.dart` to redirect to `/login` via the global navigator key.
Dio buildDioClient({required TokenStorage tokenStorage, required void Function() onUnauthorized}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: '$apiUrl/api',
      headers: {'Content-Type': 'application/json'},
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  dio.interceptors.add(
    AuthInterceptor(tokenStorage: tokenStorage, onUnauthorized: onUnauthorized),
  );

  return dio;
}
