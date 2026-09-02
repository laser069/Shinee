import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Material bottom sheet wearing the brutal modal's skin: thick top border,
/// square-ish top corners, hard shadow.
class BrutalBottomSheet {
  BrutalBottomSheet._();

  static Future<T?> show<T>(BuildContext context, {required Widget child, String? title}) {
    final t = context.brutal;
    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: t.bg,
          border: Border(top: BorderSide(color: t.border, width: t.borderWidthThick)),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(t.radiusLg),
            topRight: Radius.circular(t.radiusLg),
          ),
        ),
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (title != null) ...[
                Text(
                  title.toUpperCase(),
                  style: TextStyle(
                    fontFamily: 'Sora',
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    color: t.fg,
                  ),
                ),
                const SizedBox(height: 16),
              ],
              child,
            ],
          ),
        ),
      ),
    );
  }
}
