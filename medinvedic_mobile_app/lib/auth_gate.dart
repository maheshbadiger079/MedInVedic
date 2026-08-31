import 'package:firebase_auth/firebase_auth.dart' hide EmailAuthProvider;
import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'main.dart'; // To get MainAppWrapper or similar

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    // Bypassing native login to prioritize integrated Phone/OTP portal
    return const MainAppWrapper();
  }
}
