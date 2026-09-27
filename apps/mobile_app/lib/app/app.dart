import 'package:flutter/material.dart';
import 'router.dart';
import 'theme.dart';

class BusApp extends StatelessWidget {
  const BusApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Abyssinia Bus',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
    );
  }
}
