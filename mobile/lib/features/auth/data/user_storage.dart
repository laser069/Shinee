import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../domain/user.dart';

/// Persists the logged-in user's JSON in `shared_preferences` — the JWT
/// itself lives in `flutter_secure_storage` (`core/network/token_storage.dart`).
class UserStorage {
  static const _key = 'user';

  Future<void> write(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(user.toJson()));
  }

  /// Returns null on missing OR malformed stored JSON — the caller should
  /// treat either as "not logged in", mirroring `AuthContext.tsx:29-47`.
  Future<User?> read() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    try {
      return User.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
