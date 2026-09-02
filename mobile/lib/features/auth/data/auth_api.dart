import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_provider.dart';
import '../domain/user.dart';

/// `POST /users/login` and `/register` both return
/// `{success, data: {user, token}}` (`user.controller.ts:13-39`) and
/// auto-login on register.
class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  Future<({User user, String token})> login({required String email, required String password}) {
    return _post('/users/login', {'email': email, 'password': password});
  }

  Future<({User user, String token})> register({
    required String name,
    required String email,
    required String password,
  }) {
    return _post('/users/register', {'name': name, 'email': email, 'password': password});
  }

  Future<({User user, String token})> _post(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(path, data: body);
      final data = res.data!['data'] as Map<String, dynamic>;
      return (
        user: User.fromJson(data['user'] as Map<String, dynamic>),
        token: data['token'] as String,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

final authApiProvider = Provider<AuthApi>((ref) => AuthApi(ref.watch(dioProvider)));
