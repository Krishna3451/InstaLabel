import 'package:permission_handler/permission_handler.dart';

class PermissionsHandler {
  static Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  static Future<bool> checkCameraPermission() async {
    return await Permission.camera.status.isGranted;
  }
}