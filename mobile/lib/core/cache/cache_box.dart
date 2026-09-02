import 'package:hive_ce_flutter/hive_ce_flutter.dart';

/// Read-cache box: raw response JSON keyed by `endpoint + params`, plus a
/// `fetchedAt` stamp per entry. Full read-through logic (`cached_query.dart`)
/// lands in Phase 7 — this just owns box lifecycle so `main.dart` has
/// somewhere to call `CacheBox.init()` from app start.
class CacheBox {
  CacheBox._();

  static const boxName = 'shinee_cache';

  static Future<Box> init() async {
    await Hive.initFlutter();
    return Hive.openBox(boxName);
  }

  static Future<void> clear() async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}
