class ApiConfig {
  // Backend API URL - PRODUCTION DEPLOYED
  // 
  // The backend is deployed with PM2 on port 3000
  // 
  // For Android emulator:
  //   Use: http://10.0.2.2:3000/api
  //   (10.0.2.2 is a special IP that points to your computer from the emulator)
  // 
  // For physical device on same network:
  //   Use: http://10.5.9.77:3000/api (current server IP)
  //   Both device and server must be on the same Wi-Fi network
  //
  // For production with domain:
  //   Use: https://api.votre-domaine.com/api
  //   (Replace with your actual production domain)
  //
  // CURRENT CONFIGURATION (PRODUCTION):
  // - Server IP: 10.5.9.77
  // - Port: 3000
  // - Status: Deployed with PM2
  //
  static const String baseUrl = 'http://10.5.9.77:3000/api'; // Production API (deployed)
  
  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String members = '/members';
  static const String contributions = '/contributions';
  static const String celebrants = '/contributions/celebrants';
  static const String reports = '/reports';
}

