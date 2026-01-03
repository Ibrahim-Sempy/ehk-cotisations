import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import '../services/local_storage.dart';
import '../models/member.dart';
import 'add_member_page.dart';

class MembersPage extends StatefulWidget {
  const MembersPage({super.key});

  @override
  State<MembersPage> createState() => _MembersPageState();
}

class _MembersPageState extends State<MembersPage> {
  List<Member> _members = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMembers() async {
    setState(() => _isLoading = true);

    try {
      final isOnline = await SyncService.isOnline();
      List<Member> members;

      if (isOnline) {
        members = await ApiService.getMembers(search: _searchQuery.isEmpty ? null : _searchQuery);
        await LocalStorage.saveMembers(members);
      } else {
        members = await LocalStorage.getMembers(search: _searchQuery.isEmpty ? null : _searchQuery);
      }

      setState(() {
        _members = members;
        _isLoading = false;
      });
    } catch (e) {
      // Fallback to local storage
      final members = await LocalStorage.getMembers(search: _searchQuery.isEmpty ? null : _searchQuery);
      setState(() {
        _members = members;
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteMember(Member member) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le membre'),
        content: Text('Êtes-vous sûr de vouloir supprimer ${member.nomComplet} ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final isOnline = await SyncService.isOnline();
      if (isOnline) {
        await ApiService.deleteMember(member.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Membre supprimé avec succès')),
          );
          _loadMembers();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Action non disponible hors ligne')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  String _formatDate(String? date) {
    if (date == null || date.isEmpty) return 'N/A';
    try {
      final parsed = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy', 'fr_FR').format(parsed);
    } catch (e) {
      return date;
    }
  }

  String _getStatutLabel(String statut) {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'inactif':
        return 'Inactif';
      default:
        return statut;
    }
  }

  Color _getStatutColor(String statut) {
    switch (statut) {
      case 'actif':
        return Colors.green;
      case 'inactif':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher un membre...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                          _loadMembers();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value);
                _loadMembers();
              },
            ),
          ),

          // Members list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadMembers,
                    child: _members.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.people_outline,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Aucun membre',
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            itemCount: _members.length,
                            padding: const EdgeInsets.all(8),
                            itemBuilder: (context, index) {
                              final member = _members[index];
                              return Card(
                                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
                                    child: Icon(
                                      Icons.person,
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                                  ),
                                  title: Text(
                                    member.nomComplet,
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  subtitle: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (member.telephone != null && member.telephone!.isNotEmpty)
                                        Text('📞 ${member.telephone}'),
                                      if (member.fonction != null && member.fonction!.isNotEmpty)
                                        Text('💼 ${member.fonction}'),
                                      Text('📅 Adhésion: ${_formatDate(member.dateAdhesion)}'),
                                    ],
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Chip(
                                        label: Text(_getStatutLabel(member.statut)),
                                        backgroundColor: _getStatutColor(member.statut).withValues(alpha: 0.2),
                                        labelStyle: TextStyle(
                                          color: _getStatutColor(member.statut),
                                          fontSize: 12,
                                        ),
                                      ),
                                      PopupMenuButton(
                                        itemBuilder: (context) => [
                                          const PopupMenuItem(
                                            value: 'edit',
                                            child: Row(
                                              children: [
                                                Icon(Icons.edit, size: 20),
                                                SizedBox(width: 8),
                                                Text('Modifier'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'delete',
                                            child: Row(
                                              children: [
                                                Icon(Icons.delete, size: 20, color: Colors.red),
                                                SizedBox(width: 8),
                                                Text('Supprimer', style: TextStyle(color: Colors.red)),
                                              ],
                                            ),
                                          ),
                                        ],
                                        onSelected: (value) async {
                                          if (value == 'edit') {
                                            final result = await Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) => AddMemberPage(member: member),
                                              ),
                                            );
                                            if (result == true) {
                                              _loadMembers();
                                            }
                                          } else if (value == 'delete') {
                                            _deleteMember(member);
                                          }
                                        },
                                      ),
                                    ],
                                  ),
                                  isThreeLine: true,
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
    );
  }
}

