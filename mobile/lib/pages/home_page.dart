import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import '../services/local_storage.dart';
import '../models/contribution.dart';
import 'login_page.dart';
import 'add_contribution_page.dart';
import 'contribution_detail_page.dart';

class ContributionsPage extends StatefulWidget {
  const ContributionsPage({super.key});

  @override
  State<ContributionsPage> createState() => _ContributionsPageState();
}

class _ContributionsPageState extends State<ContributionsPage> {
  List<Contribution> _contributions = [];
  bool _isLoading = true;
  bool _isSyncing = false;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadContributions();
    _checkAndSync();
  }

  Future<void> _loadContributions() async {
    setState(() => _isLoading = true);

    try {
      final isOnline = await SyncService.isOnline();
      
      if (isOnline) {
        // Try to sync first
        await SyncService.syncData();
        // Load from API
        final contributions = await ApiService.getContributions();
        await LocalStorage.saveContributions(contributions);
        setState(() => _contributions = contributions);
      } else {
        // Load from local storage
        final contributions = await LocalStorage.getContributions();
        setState(() => _contributions = contributions);
      }
    } catch (e) {
      // Fallback to local storage
      final contributions = await LocalStorage.getContributions();
      setState(() => _contributions = contributions);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _checkAndSync() async {
    final isOnline = await SyncService.isOnline();
    if (isOnline) {
      setState(() => _isSyncing = true);
      await SyncService.syncData();
      setState(() => _isSyncing = false);
      _loadContributions();
    }
  }

  Future<void> _logout() async {
    await ApiService.clearToken();
    await LocalStorage.clearAll();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  List<Contribution> get _filteredContributions {
    if (_filter == 'all') return _contributions;
    return _contributions.where((c) => c.statut == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('EHK Cotisations'),
        actions: [
          if (_isSyncing)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _checkAndSync,
            tooltip: 'Synchroniser',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Déconnexion',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildFilterChip('all', 'Toutes'),
                  const SizedBox(width: 8),
                  _buildFilterChip('paye', 'Payées'),
                  const SizedBox(width: 8),
                  _buildFilterChip('non_paye', 'Non payées'),
                  const SizedBox(width: 8),
                  _buildFilterChip('partiel', 'Partielles'),
                ],
              ),
            ),
          ),

          // Contributions list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredContributions.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.receipt_long,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucune cotisation',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadContributions,
                        child: ListView.builder(
                          itemCount: _filteredContributions.length,
                          padding: const EdgeInsets.all(8),
                          itemBuilder: (context, index) {
                            final contribution = _filteredContributions[index];
                            return _buildContributionCard(contribution);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const AddContributionPage(),
            ),
          );
          if (result == true) {
            _loadContributions();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _filter = value);
      },
    );
  }

  Widget _buildContributionCard(Contribution contribution) {
    Color statusColor;
    switch (contribution.statut) {
      case 'paye':
        statusColor = Colors.green;
        break;
      case 'non_paye':
        statusColor = Colors.red;
        break;
      case 'partiel':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withValues(alpha: 0.2),
          child: Icon(
            contribution.statut == 'paye'
                ? Icons.check_circle
                : contribution.statut == 'partiel'
                    ? Icons.pending
                    : Icons.pending_outlined,
            color: statusColor,
          ),
        ),
        title: Text(
          contribution.membreNom ?? 'Membre inconnu',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(contribution.typeLabel),
            Text(
              '${contribution.montant.toStringAsFixed(0)} GNF',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                contribution.statutLabel,
                style: TextStyle(
                  color: statusColor,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              contribution.date.split('T')[0],
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ContributionDetailPage(contribution: contribution),
            ),
          );
          if (result == true) {
            _loadContributions();
          }
        },
      ),
    );
  }
}

