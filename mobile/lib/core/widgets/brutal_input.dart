import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// 4px border, r16, focus tint `accent @ 10%`.
class BrutalInput extends StatelessWidget {
  const BrutalInput({
    super.key,
    this.controller,
    this.label,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.onChanged,
    this.maxLines = 1,
  });

  final TextEditingController? controller;
  final String? label;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      validator: validator,
      onChanged: onChanged,
      maxLines: obscureText ? 1 : maxLines,
      style: TextStyle(color: t.fg),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: t.bg,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusLg),
          borderSide: BorderSide(color: t.border, width: t.borderWidthThick),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusLg),
          borderSide: BorderSide(color: t.border, width: t.borderWidthThick),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusLg),
          borderSide: BorderSide(color: t.border, width: t.borderWidthThick),
        ),
        focusColor: t.accent.withValues(alpha: 0.1),
      ),
    );
  }
}
