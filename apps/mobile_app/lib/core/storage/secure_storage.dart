import 'dart:convert';

class SecureStorage {
  static final SecureStorage _instance = SecureStorage._internal();
  factory SecureStorage() => _instance;
  SecureStorage._internal();

  final Map<String, String> _memoryCache = {};

  Future<void> write({required String key, required String value}) async {
    _memoryCache[key] = value;
  }

  Future<String?> read({required String key}) async {
    return _memoryCache[key];
  }

  Future<void> delete({required String key}) async {
    _memoryCache.remove(key);
  }

  Future<void> deleteAll() async {
    _memoryCache.clear();
  }

  // Token Helpers
  Future<String?> getAccessToken() => read(key: 'access_token');
  Future<void> setAccessToken(String token) => write(key: 'access_token', value: token);

  Future<String?> getRefreshToken() => read(key: 'refresh_token');
  Future<void> setRefreshToken(String token) => write(key: 'refresh_token', value: token);

  Future<void> clearAuthTokens() async {
    await delete(key: 'access_token');
    await delete(key: 'refresh_token');
  }

  // Offline Ticket Cache
  Future<void> cacheTicket(String ticketId, Map<String, dynamic> ticketData) async {
    await write(key: 'cached_ticket_$ticketId', value: jsonEncode(ticketData));
  }

  Future<Map<String, dynamic>?> getCachedTicket(String ticketId) async {
    final raw = await read(key: 'cached_ticket_$ticketId');
    if (raw != null) {
      try {
        return jsonDecode(raw);
      } catch (_) {}
    }
    return null;
  }
}
