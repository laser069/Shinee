import 'package:dio/dio.dart';

/// Normalizes the server's three inconsistent error response shapes:
/// - Zod validation: `{success: false, message, errors: [...]}`
/// - Auth middleware: `{message}` (no `success` key at all)
/// - Generic controller error: `{success: false, message}`
///
/// Plus a fallback for a non-JSON/HTML body (e.g. a proxy 502, or any route
/// not yet covered by the JSON 404/error handler).
class ApiException implements Exception {
  ApiException({required this.statusCode, required this.message, this.errors});

  final int? statusCode;
  final String message;
  final List<dynamic>? errors;

  factory ApiException.fromDioError(DioException e) {
    final response = e.response;
    if (response == null) {
      return ApiException(statusCode: null, message: e.message ?? 'Network error');
    }

    final data = response.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'] as String? ?? 'Something went wrong';
      final errors = data['errors'] as List<dynamic>?;
      return ApiException(statusCode: response.statusCode, message: message, errors: errors);
    }

    // Non-JSON body (HTML error page etc.) — should not happen once Phase
    // 0.1's JSON 404/error handler is live, but guard for it anyway.
    return ApiException(
      statusCode: response.statusCode,
      message: 'Unexpected server response (${response.statusCode})',
    );
  }

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
