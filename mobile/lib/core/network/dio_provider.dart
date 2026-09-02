import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dio_client.dart';
import 'token_storage.dart';
import 'unauthorized_signal.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final dioProvider = Provider<Dio>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  final signal = ref.watch(unauthorizedSignalProvider);
  return buildDioClient(tokenStorage: tokenStorage, onUnauthorized: signal.fire);
});
