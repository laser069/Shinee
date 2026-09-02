import 'package:dio/dio.dart';

import 'token_storage.dart';

/// Mirrors `client/src/lib/apiClient.ts`'s two interceptors:
/// - request: inject `Authorization: Bearer <token>` from storage.
/// - response: on 401, clear the token and let [onUnauthorized] redirect to
///   `/login` (via a global `go_router` key set up in `router.dart` — kept
///   as a callback here so this file has no router dependency).
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.tokenStorage, required this.onUnauthorized});

  final TokenStorage tokenStorage;
  final void Function() onUnauthorized;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await tokenStorage.readToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      await tokenStorage.clearToken();
      onUnauthorized();
    }
    handler.next(err);
  }
}
