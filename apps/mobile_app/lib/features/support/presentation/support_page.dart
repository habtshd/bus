import 'package:flutter/material.dart';

class SupportPage extends StatelessWidget {
  const SupportPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('24/7 Customer Support'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.support_agent, color: Color(0xFFF59E0B), size: 30),
              title: const Text('Operations Call Center', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: const Text('Toll Free: 9444 • Available 24/7 across Ethiopia', style: TextStyle(color: Colors.white54, fontSize: 12)),
              trailing: const Icon(Icons.call, color: Color(0xFF10B981)),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dialing 9444...')));
              },
            ),
          ),
          const SizedBox(height: 12),
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.telegram, color: Color(0xFF38BDF8), size: 30),
              title: const Text('Telegram Bot Support', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: const Text('@AbyssiniaBusSupportBot • Real-time queries', style: TextStyle(color: Colors.white54, fontSize: 12)),
              trailing: const Icon(Icons.open_in_new, color: Colors.white30),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening @AbyssiniaBusSupportBot...')));
              },
            ),
          ),
          const SizedBox(height: 12),
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 30),
              title: const Text('Passenger Safety Hotline', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: const Text('FDRE Federal Police Highway Highway Control: 991', style: TextStyle(color: Colors.white54, fontSize: 12)),
              trailing: const Icon(Icons.call, color: Colors.redAccent),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dialing Highway Police 991...')));
              },
            ),
          ),
        ],
      ),
    );
  }
}
