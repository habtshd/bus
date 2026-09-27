class AuthUser {
  final String id;
  final String email;
  final String fullName;
  final String phone;
  final String role;
  final String? nationalId;

  const AuthUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.role,
    this.nationalId,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'PASSENGER',
      nationalId: json['nationalId'] ?? json['passengerIdNumber'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'fullName': fullName,
    'phone': phone,
    'role': role,
    'nationalId': nationalId,
  };
}
