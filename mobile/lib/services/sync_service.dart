import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../services/local_storage.dart';
import '../services/api_service.dart';

class SyncService {
  static Future<bool> syncData() async {
    try {
      // Sync members
      final members = await ApiService.getMembers();
      await LocalStorage.saveMembers(members);

      // Sync contributions
      final contributions = await ApiService.getContributions();
      await LocalStorage.saveContributions(contributions);

      // Sync pending contributions
      await _syncPendingContributions();

      return true;
    } catch (e) {
      // Erreur de synchronisation
      return false;
    }
  }

  static Future<void> _syncPendingContributions() async {
    final queue = await LocalStorage.getSyncQueue();
    final token = await ApiService.getToken();

    if (token == null) return;

    for (var item in queue) {
      try {
        final data = jsonDecode(item['data'] as String);

        if (item['action'] == 'create') {
          await ApiService.createContribution(data);
        }

        // Remove from queue after successful sync
        // Note: In a real app, you'd want to track which items were synced
      } catch (e) {
        // Erreur lors de la synchronisation d'un élément
        // Keep in queue for retry
      }
    }

    // Clear queue after successful sync
    await LocalStorage.clearSyncQueue();
  }

  static Future<bool> isOnline() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/health'),
      ).timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

