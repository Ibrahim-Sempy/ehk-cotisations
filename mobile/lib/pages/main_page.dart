import 'package:flutter/material.dart';
import 'dashboard_page.dart';
import 'contributions_page.dart';
import 'members_page.dart';
import 'profile_page.dart';
import 'login_page.dart';
import 'add_contribution_page.dart';
import 'add_member_page.dart';
import 'celebrant_members_page.dart';
import '../services/api_service.dart';
import '../services/local_storage.dart';
import '../services/sync_service.dart';

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _menuItems = [
    {
      'title': 'Accueil',
      'icon': Icons.dashboard,
      'page': 0,
    },
    {
      'title': 'Cotisations',
      'icon': Icons.receipt_long,
      'page': 1,
    },
    {
      'title': 'Membres',
      'icon': Icons.people,
      'page': 2,
    },
    {
      'title': 'Par Célébrant',
      'icon': Icons.person_search,
      'page': 3,
    },
    {
      'title': 'Profil',
      'icon': Icons.person,
      'page': 4,
    },
  ];

  final List<Widget> _pages = [
    const DashboardPage(),
    const ContributionsPage(),
    const MembersPage(),
    const CelebrantMembersPage(),
    const ProfilePage(),
  ];

  void _navigateToPage(int index) {
    setState(() {
      _currentIndex = index;
    });
    _scaffoldKey.currentState?.closeDrawer();
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ApiService.clearToken();
      await LocalStorage.clearAll();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginPage()),
          (route) => false,
        );
      }
    }
  }

  Future<void> _syncData() async {
    _scaffoldKey.currentState?.closeDrawer();
    final isOnline = await SyncService.isOnline();
    if (isOnline) {
      try {
        await SyncService.syncData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Synchronisation réussie')),
          );
          // Refresh current page
          setState(() {});
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur de synchronisation: $e')),
          );
        }
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pas de connexion internet')),
        );
      }
    }
  }

  String _getAppBarTitle() {
    switch (_currentIndex) {
      case 0:
        return 'Tableau de bord';
      case 1:
        return 'Cotisations';
      case 2:
        return 'Membres';
      case 3:
        return 'Par Célébrant';
      case 4:
        return 'Profil';
      default:
        return 'EHK Cotisations';
    }
  }

  List<Widget>? _getAppBarActions() {
    switch (_currentIndex) {
      case 0:
        return [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              // Refresh will be handled by the page itself
              setState(() {});
            },
            tooltip: 'Actualiser',
          ),
        ];
      case 1:
        return [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _syncData,
            tooltip: 'Synchroniser',
          ),
        ];
      case 2:
        return [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {});
            },
            tooltip: 'Actualiser',
          ),
        ];
      case 3:
        return [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {});
            },
            tooltip: 'Actualiser',
          ),
        ];
      case 4:
        return null;
      default:
        return null;
    }
  }

  Widget? _getFloatingActionButton() {
    switch (_currentIndex) {
      case 1: // Contributions
        return FloatingActionButton.extended(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const AddContributionPage(),
              ),
            );
            if (result == true) {
              setState(() {});
            }
          },
          icon: const Icon(Icons.add),
          label: const Text('Ajouter'),
        );
      case 2: // Members
        return FloatingActionButton.extended(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const AddMemberPage(),
              ),
            );
            if (result == true) {
              setState(() {});
            }
          },
          icon: const Icon(Icons.add),
          label: const Text('Ajouter'),
        );
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        actions: _getAppBarActions(),
      ),
      body: _pages[_currentIndex],
      floatingActionButton: _getFloatingActionButton(),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Image.asset(
                    'assets/logo_corrigé.png',
                    width: 70,
                    height: 70,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.star,
                        size: 40,
                        color: Colors.white,
                      );
                    },
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Étoiles Manager',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Les Étoiles de Horè-Koubi',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontSize: 11,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  Text(
                    'Guinée Conakry',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 9,
                    ),
                  ),
                ],
              ),
            ),
            ..._menuItems.map((item) {
              final isSelected = _currentIndex == item['page'] as int;
              return ListTile(
                leading: Icon(
                  item['icon'] as IconData,
                  color: isSelected
                      ? Theme.of(context).colorScheme.primary
                      : null,
                ),
                title: Text(
                  item['title'] as String,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : null,
                    decoration: TextDecoration.none,
                  ),
                ),
                selected: false,
                selectedTileColor: Colors.transparent,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                onTap: () => _navigateToPage(item['page'] as int),
              );
            }),
            ListTile(
              leading: const Icon(Icons.sync),
              title: const Text(
                'Synchroniser',
                style: TextStyle(decoration: TextDecoration.none),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              onTap: _syncData,
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Déconnexion',
                style: TextStyle(
                  color: Colors.red,
                  decoration: TextDecoration.none,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              onTap: _logout,
            ),
          ],
        ),
      ),
    );
  }
}

