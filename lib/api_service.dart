import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class ApiService {
  // تحديث الـ IP للعنوان الصحيح اللي ظهر في الـ Terminal عندك
  static const String baseUrl = "http://192.168.1.30:8000";

 // --- 1. دالة تسجيل المستخدم (تعديل بسيط للأمان واللغة) ---
  Future<Map<String, dynamic>> registerUser(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {"Content-Type": "application/json"}, // ضيفي ده
        body: jsonEncode({ // ونبعته كـ JSON
          'name': name, 
          'email': email, 
          'password': password
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {"status": "error", "message": "Connection Error: $e"};
    }
  }
  // --- 2. دالة الشات مع Gemini ---
  Future<String> chatWithAI(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/chat'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"message": message}),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body)['reply'];
      }
      return "Error: ${response.statusCode}";
    } catch (e) {
      return "تأكد من اتصالك بنفس شبكة السيرفر";
    }
  }

  // --- 3. دالة رفع صورة الجرح وتوقع الإسعافات ---
  Future<Map<String, dynamic>> predictInjury(int userId, File imageFile) async {
    try {
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/predict'));
      request.fields['user_id'] = userId.toString();
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      return jsonDecode(response.body);
    } catch (e) {
      return {"status": "error", "message": e.toString()};
    }
  }
}