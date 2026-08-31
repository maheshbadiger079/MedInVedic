import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  double progress = 0;
  final String initialUrl = "https://medinvedic.web.app/?is_app=true";

  @override
  void initState() {
    super.initState();
    _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    await [
      Permission.camera,
      Permission.storage,
      Permission.photos,
    ].request();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (didPop) return;
        if (await webViewController?.canGoBack() ?? false) {
          webViewController?.goBack();
        } else {
          // If at start, show exit dialog or just pop
          final shouldExit = await _showExitDialog(context);
          if (shouldExit) {
            SystemNavigator.pop();
          }
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                key: webViewKey,
                initialUrlRequest: URLRequest(url: WebUri(initialUrl)),
                initialSettings: InAppWebViewSettings(
                  userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7; MV_APP_V3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                  useOnDownloadStart: true,
                  useOnLoadResource: true,
                  javaScriptEnabled: true,
                  transparentBackground: true,
                  supportZoom: false,
                  displayZoomControls: false,
                  builtInZoomControls: false,
                  allowsInlineMediaPlayback: true,
                  isPagingEnabled: true,
                  verticalScrollBarEnabled: false,
                  horizontalScrollBarEnabled: false,
                  cacheEnabled: true,
                  clearCache: false,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  hardwareAcceleration: true,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  javaScriptCanOpenWindowsAutomatically: true,
                  supportMultipleWindows: true,
                  useWideViewPort: true,
                  loadWithOverviewMode: true,
                  mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                  // Clear cache to ensure the latest website logic is loaded
                  controller.clearCache();
                },
                onCreateWindow: (controller, createWindowAction) async {
                  // If a popup wants to open, just load it in the same webview
                  // This helps with Google/Social login popups
                  webViewController?.loadUrl(urlRequest: createWindowAction.request);
                  return true;
                },
                onLoadStart: (controller, url) async {
                  setState(() {
                    progress = 0;
                  });
                  // Force app mode via JS injection as early as possible
                  await controller.evaluateJavascript(source: """
                    localStorage.setItem('mv_is_app', 'true');
                    document.documentElement.classList.add('app-mode');
                    if(document.body) document.body.classList.remove('auth-locked');
                    window.IS_APP_MODE = true;
                    console.log('App Mode Forced via Native Injection');
                  """);
                },
                onLoadStop: (controller, url) async {
                  setState(() {
                    progress = 1.0;
                  });

                  // --- NATIVE AUTH SYNC V3 ---
                  // This is the most reliable way to sync sessions
                  final user = FirebaseAuth.instance.currentUser;
                  if (user != null) {
                    final name = user.displayName ?? "User";
                    final email = user.email ?? "";
                    
                    // Use a loop to wait for window.API to be ready
                    await controller.evaluateJavascript(source: """
                      (function() {
                        let retryCount = 0;
                        function attemptSync() {
                          if (window.API && window.API.auth) {
                            // Check if already logged in with this user to prevent "too many requests"
                            const current = localStorage.getItem('mv_auth_user');
                            if (current) {
                               try {
                                 const parsed = JSON.parse(current);
                                 if (parsed.email === '$email' || parsed.phoneNumber === '$email') {
                                    console.log('App V3: Already synced for $email');
                                    if (window.location.href.includes('login.html')) {
                                      window.location.href = '../index.html';
                                    }
                                    return;
                                 }
                               } catch(e) {}
                            }
                            
                            console.log('App V3: Syncing session for $email...');
                            window.API.auth.socialLogin('$name', '$email', 'google').then(() => {
                              console.log('App V3: Session synced.');
                              if (window.location.href.includes('login.html')) {
                                window.location.href = '../index.html';
                              } else if (document.getElementById('authGate')) {
                                // Manual trigger if auth gate is visible
                                if (window.closeGate) window.closeGate(document.getElementById('authGate'));
                              }
                            }).catch(e => console.error('App V3: Sync error', e));
                          } else if (retryCount < 20) {
                            retryCount++;
                            setTimeout(attemptSync, 500);
                          }
                        }
                        attemptSync();
                      })();
                    """);
                  }
                },
                onProgressChanged: (controller, progressValue) {
                  setState(() {
                    progress = progressValue / 100;
                  });
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  var uri = navigationAction.request.url!;

                  if (![
                    "http",
                    "https",
                    "file",
                    "chrome",
                    "data",
                    "javascript",
                    "about"
                  ].contains(uri.scheme)) {
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                      return NavigationActionPolicy.CANCEL;
                    }
                  }

                  // Restrict navigation to MedInVedic domain for security
                  if (!uri.toString().contains("medinvedic.web.app") && 
                      !uri.toString().contains("firebasestorage.googleapis.com")) {
                    // Open external links in external browser
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                    return NavigationActionPolicy.CANCEL;
                  }

                  return NavigationActionPolicy.ALLOW;
                },
                onPermissionRequest: (controller, request) async {
                  return PermissionResponse(
                    resources: request.resources,
                    action: PermissionResponseAction.GRANT,
                  );
                },
              ),
              if (progress < 1.0)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    value: progress,
                    color: Colors.teal,
                    backgroundColor: Colors.white,
                    minHeight: 3,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<bool> _showExitDialog(BuildContext context) async {
    return await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Exit App'),
            content: const Text('Do you want to exit MedInVedic?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('No'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Yes'),
              ),
            ],
          ),
        ) ??
        false;
  }
}

