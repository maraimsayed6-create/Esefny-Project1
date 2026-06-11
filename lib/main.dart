import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart'; // المكتبة اللي بتشغل الـ HTML

void main() {
  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: EsafnyApp(),
  ));
}

class EsafnyApp extends StatefulWidget {
  const EsafnyApp({super.key});

  @override
  State<EsafnyApp> createState() => _EsafnyAppState();
}

class _EsafnyAppState extends State<EsafnyApp> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    // إعدادات الـ WebView لتشغيل ملفات الـ Assets
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted) // تشغيل الـ JS (مهم للشات)
      ..setBackgroundColor(const Color(0x00000000))
      ..loadFlutterAsset('assets/index.html'); // هنا بنادي على ملفك الأساسي
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // SafeArea عشان المحتوى ميتداخلش مع الكاميرا أو الساعة في الموبايل
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}