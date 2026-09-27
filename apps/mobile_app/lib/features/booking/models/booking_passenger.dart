class BookingPassenger {
  final String seatId;
  final String firstName;
  final String lastName;
  final String phone;
  final String? email;
  final String? passportNumber;

  const BookingPassenger({
    required this.seatId,
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.email,
    this.passportNumber,
  });

  Map<String, dynamic> toJson() => {
    'seatId': seatId,
    'firstName': firstName,
    'lastName': lastName,
    'phone': phone,
    if (email != null) 'email': email,
    if (passportNumber != null) 'passportNumber': passportNumber,
  };

  factory BookingPassenger.fromJson(Map<String, dynamic> json) {
    return BookingPassenger(
      seatId: json['seatId'] ?? json['seatNumber'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      passportNumber: json['passportNumber'] ?? json['passengerIdNumber'],
    );
  }
}
