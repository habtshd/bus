import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timed out. Please check your internet connection.',
          statusCode: 408,
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        String message = 'Server error occurred.';
        if (data is Map && data['message'] != null) {
          message = data['message'] is List
              ? (data['message'] as List).join(', ')
              : data['message'].toString();
        } else if (statusCode == 404) {
          message = 'The requested resource was not found.';
        } else if (statusCode == 400) {
          message = 'Invalid request parameters.';
        } else if (statusCode == 401) {
          message = 'Session expired. Please log in again.';
        } else if (statusCode == 409) {
          message = 'Seat or resource is no longer available.';
        }
        return ApiException(
          message: message,
          statusCode: statusCode,
          details: data,
        );
      case DioExceptionType.cancel:
        return ApiException(message: 'Request was cancelled.');
      case DioExceptionType.unknown:
      default:
        return ApiException(
          message: 'Unable to connect to Abyssinia Bus server.',
        );
    }
  }

  @override
  String toString() => message;
}
