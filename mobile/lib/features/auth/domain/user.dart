/// Mirrors the server's user shape (`server/src/models/User.ts`), minus
/// `password`. Hand-written (not freezed/json_serializable) — the pinned
/// codegen toolchain doesn't yet support this SDK's language version; revisit
/// once `analyzer`/`freezed` catch up (see `dart run build_runner build`
/// failure: `visitDotShorthandPropertyAccess` not implemented).
class User {
  const User({required this.id, required this.name, required this.email, this.isAdmin = false});

  final String id;
  final String name;
  final String email;
  final bool isAdmin;

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['_id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        isAdmin: json['isAdmin'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'email': email,
        'isAdmin': isAdmin,
      };
}
