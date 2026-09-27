import 'package:flutter/material.dart';
import 'screens/auth_screens.dart';
import 'screens/home_search_screen.dart';
import 'screens/ticket_profile_screens.dart';
import 'models/models.dart';

void main() {
  runApp(const AbyssiniaBusApp());
}

class AbyssiniaBusApp extends StatelessWidget {
  const AbyssiniaBusApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Abyssinia Bus',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFFF59E0B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
        ),
      ),
      home: const MainNavigationHolder(),
    );
  }
}

class MainNavigationHolder extends StatefulWidget {
  const MainNavigationHolder({Key? key}) : super(key: key);

  @override
  _MainNavigationHolderState createState() => _MainNavigationHolderState();
}

class _MainNavigationHolderState extends State<MainNavigationHolder> {
  int _currentIndex = 0;
  bool _isLoggedIn = true;

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return LoginScreen(onLoginSuccess: () {
        setState(() => _isLoggedIn = true);
      });
    }

    final screens = [
      const HomeSearchScreen(),
      QrTicketScreen(
        ticket: Ticket(
          id: 'demo-tkt-1',
          ticketNumber: 'TKT-500486',
          bookingReference: 'BK-WEB-040801',
          tripCode: 'ETB-AA-HW-01',
          route: 'Addis Ababa ➔ Hawassa',
          seatNumber: '7B',
          passengerName: 'Selamawit Desta',
          passengerPhone: '+251911889900',
          passengerIdNumber: 'KB-08-33491',
          fareETB: 650.0,
          status: 'ISSUED',
          departureTime: DateTime.now().add(const Duration(hours: 3)),
        ),
      ),
      const BookingHistoryScreen(),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF1E293B),
        selectedItemColor: const Color(0xFFF59E0B),
        unselectedItemColor: Colors.white54,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_2), label: 'My Ticket'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications_none), label: 'Alerts'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
