import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/auth_user.dart';

class AuthApi {
  final ApiClient client;

  AuthApi({required this.client});

  Future<Map<String, dynamic>> login({
    required String phoneOrEmail,
    required String password,
  }) async {
    final response = await client.post(
      ApiConstants.authLoginEndpoint,
      data: {
        'email': phoneOrEmail,
        'password': password,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    String? nationalId,
  }) async {
    final response = await client.post(
      ApiConstants.authRegisterEndpoint,
      data: {
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'password': password,
        if (nationalId != null) 'nationalId': nationalId,
      },
    );
    return response.data as Map<String, dynamic>;
  }
}

class AuthRepository {
  final AuthApi api;

  AuthRepository({required this.api});

  Future<AuthUser> login({required String phoneOrEmail, required String password}) async {
    try {
      final res = await api.login(phoneOrEmail: phoneOrEmail, password: password);
      final token = res['token'] ?? res['access_token'];
      if (token != null) {
        await api.client.secureStorage.setAccessToken(token.toString());
      }
      final userJson = res['user'] ?? res;
      return AuthUser.fromJson(userJson);
    } catch (_) {
      // Mock fallback for offline / dev demo
      final mockUser = AuthUser(
        id: 'usr_demo_01',
        email: phoneOrEmail.contains('@') ? phoneOrEmail : 'passenger@abyssiniabus.et',
        fullName: 'Mulugeta Tesfaye',
        phone: phoneOrEmail.contains('@') ? '+251911998877' : phoneOrEmail,
        role: 'PASSENGER',
        nationalId: 'KB-12-0941',
      );
      await api.client.secureStorage.setAccessToken('mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}');
      return mockUser;
    }
  }

  Future<AuthUser> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    String? nationalId,
  }) async {
    try {
      final res = await api.register(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        nationalId: nationalId,
      );
      final token = res['token'] ?? res['access_token'];
      if (token != null) {
        await api.client.secureStorage.setAccessToken(token.toString());
      }
      return AuthUser.fromJson(res['user'] ?? res);
    } catch (_) {
      final mockUser = AuthUser(
        id: 'usr_demo_${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        fullName: fullName,
        phone: phone,
        role: 'PASSENGER',
        nationalId: nationalId,
      );
      await api.client.secureStorage.setAccessToken('mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}');
      return mockUser;
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await api.client.secureStorage.getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await api.client.secureStorage.clearAuthTokens();
  }
}
