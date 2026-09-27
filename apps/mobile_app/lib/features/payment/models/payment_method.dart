enum PaymentType {
  telebirr,
  cbeBirr,
  chapa,
  card,
  bank,
}

class PaymentMethodOption {
  final PaymentType type;
  final String code;
  final String title;
  final String subtitle;
  final String iconName;

  const PaymentMethodOption({
    required this.type,
    required this.code,
    required this.title,
    required this.subtitle,
    required this.iconName,
  });

  static const List<PaymentMethodOption> supportedMethods = [
    PaymentMethodOption(
      type: PaymentType.telebirr,
      code: 'TELEBIRR',
      title: 'telebirr',
      subtitle: 'Ethio Telecom SuperApp / USSD (*127#)',
      iconName: 'phone_android',
    ),
    PaymentMethodOption(
      type: PaymentType.cbeBirr,
      code: 'CBE_BIRR',
      title: 'CBE Birr',
      subtitle: 'Commercial Bank of Ethiopia Mobile Banking',
      iconName: 'account_balance',
    ),
    PaymentMethodOption(
      type: PaymentType.chapa,
      code: 'CHAPA',
      title: 'Chapa Gateway',
      subtitle: 'Debit Cards (Visa/Mastercard) & Local Banks',
      iconName: 'credit_card',
    ),
  ];
}
