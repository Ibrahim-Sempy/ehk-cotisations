import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../models/member.dart';
import '../models/contribution.dart';

class ApiService {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth
  static Future<Map<String, dynamic>> register(String email, String password, {String role = 'secretaire'}) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.register}');
      // Register attempt
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password, 'role': role}),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Timeout: Le serveur ne répond pas. Vérifiez que le backend est démarré sur ${ApiConfig.baseUrl}');
        },
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
          return data;
        } else {
          throw Exception('Token manquant dans la réponse');
        }
      } else if (response.statusCode == 400) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Erreur lors de la création du compte');
      } else {
        throw Exception('Erreur ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      if (e is SocketException || e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${ApiConfig.baseUrl}');
      }
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.login}');
      // Login attempt
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Timeout: Le serveur ne répond pas. Vérifiez que le backend est démarré sur ${ApiConfig.baseUrl}');
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
          return data;
        } else {
          throw Exception('Token manquant dans la réponse');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Email ou mot de passe incorrect');
      } else {
        throw Exception('Erreur ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      if (e is SocketException || e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${ApiConfig.baseUrl}');
      }
      rethrow;
    }
  }

  static Future<User> getCurrentUser() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.me}'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors de la récupération de l\'utilisateur');
    }
  }

  // Members
  static Future<List<Member>> getMembers({String? search, String? statut}) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (statut != null) queryParams['statut'] = statut;

    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.members}')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Member.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des membres');
    }
  }

  static Future<Member> createMember(Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.members}'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return Member.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erreur lors de la création du membre');
    }
  }

  static Future<Member> updateMember(int id, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.members}/$id'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return Member.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erreur lors de la mise à jour du membre');
    }
  }

  static Future<void> deleteMember(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.members}/$id'),
      headers: headers,
    );

    if (response.statusCode != 200 && response.statusCode != 204) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erreur lors de la suppression du membre');
    }
  }

  // Contributions
  static Future<List<Contribution>> getContributions({
    int? membreId,
    String? type,
    String? statut,
    String? celebrant,
    String? dateDebut,
    String? dateFin,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (membreId != null) queryParams['membre_id'] = membreId.toString();
    if (type != null) queryParams['type'] = type;
    if (statut != null) queryParams['statut'] = statut;
    if (celebrant != null && celebrant.isNotEmpty) queryParams['celebrant'] = celebrant;
    if (dateDebut != null) queryParams['date_debut'] = dateDebut;
    if (dateFin != null) queryParams['date_fin'] = dateFin;

    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.contributions}')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: headers).timeout(
      const Duration(seconds: 30),
      onTimeout: () {
        throw Exception('Timeout: Le serveur ne répond pas');
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Contribution.fromJson(json)).toList();
    } else {
      final errorBody = response.body;
      throw Exception('Erreur ${response.statusCode}: $errorBody');
    }
  }

  static Future<List<String>> getCelebrants() async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.celebrants}');
      
      // Debug: log the full URL
      // print('Fetching celebrants from: $uri');

      final response = await http.get(uri, headers: headers).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Timeout: Le serveur ne répond pas');
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((e) => e.toString()).toList();
      } else if (response.statusCode == 404) {
        throw Exception('Endpoint non trouvé. Vérifiez que le backend est démarré et que la route /api/contributions/celebrants existe.');
      } else {
        final errorBody = response.body;
        throw Exception('Erreur ${response.statusCode}: $errorBody');
      }
    } catch (e) {
      if (e is SocketException || e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Erreur de connexion: Vérifiez votre connexion internet');
      } else if (e is TimeoutException || e.toString().contains('Timeout')) {
        throw Exception('Timeout: Le serveur ne répond pas');
      } else {
        throw Exception('Erreur lors de la récupération des célébrants: ${e.toString()}');
      }
    }
  }

  static Future<Contribution> createContribution(Map<String, dynamic> data) async {
    try {
      final headers = await _getHeaders();
      
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.contributions}'),
        headers: headers,
        body: jsonEncode(data),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Timeout: Le serveur ne répond pas');
        },
      );

      if (response.statusCode == 201) {
        return Contribution.fromJson(jsonDecode(response.body));
      } else {
        try {
          final errorData = jsonDecode(response.body);
          final errorMessage = errorData['error'] ?? 
                              (errorData['errors'] != null 
                                ? errorData['errors'].toString() 
                                : 'Erreur lors de la création de la cotisation');
          throw Exception(errorMessage);
        } catch (e) {
          throw Exception('Erreur ${response.statusCode}: ${response.body}');
        }
      }
    } catch (e) {
      if (e is SocketException || e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      rethrow;
    }
  }

  static Future<Contribution> updateContribution(int id, Map<String, dynamic> data) async {
    try {
      final headers = await _getHeaders();
      
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.contributions}/$id'),
        headers: headers,
        body: jsonEncode(data),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Timeout: Le serveur ne répond pas');
        },
      );

      if (response.statusCode == 200) {
        return Contribution.fromJson(jsonDecode(response.body));
      } else {
        try {
          final errorData = jsonDecode(response.body);
          final errorMessage = errorData['error'] ?? 
                              (errorData['errors'] != null 
                                ? errorData['errors'].toString() 
                                : 'Erreur lors de la mise à jour de la cotisation');
          throw Exception(errorMessage);
        } catch (e) {
          throw Exception('Erreur ${response.statusCode}: ${response.body}');
        }
      }
    } catch (e) {
      if (e is SocketException || e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      rethrow;
    }
  }

  // Reports
  static Future<List<int>> downloadReport(String type, Map<String, String> params) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.reports}/$type')
        .replace(queryParameters: params);

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Erreur lors du téléchargement du rapport');
    }
  }

  static Future<Map<String, dynamic>> getStats({
    String? dateDebut,
    String? dateFin,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (dateDebut != null) queryParams['date_debut'] = dateDebut;
    if (dateFin != null) queryParams['date_fin'] = dateFin;

    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.contributions}/stats/summary')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur lors de la récupération des statistiques');
    }
  }

  static Future<List<dynamic>> getStatsByType({
    String? dateDebut,
    String? dateFin,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (dateDebut != null) queryParams['date_debut'] = dateDebut;
    if (dateFin != null) queryParams['date_fin'] = dateFin;

    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.contributions}/stats/by-type')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur lors de la récupération des statistiques par type');
    }
  }
}

