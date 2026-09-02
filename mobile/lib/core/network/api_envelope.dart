/// Unwraps the server's `{success, data, message, errors}` response shape
/// (every controller in `server/src/controllers/*.ts` returns this).
class ApiEnvelope<T> {
  ApiEnvelope({required this.success, this.data, this.message, this.errors});

  final bool success;
  final T? data;
  final String? message;
  final List<dynamic>? errors;

  factory ApiEnvelope.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromData,
  ) {
    return ApiEnvelope<T>(
      success: json['success'] as bool? ?? true,
      data: json['data'] != null ? fromData(json['data']) : null,
      message: json['message'] as String?,
      errors: json['errors'] as List<dynamic>?,
    );
  }
}
