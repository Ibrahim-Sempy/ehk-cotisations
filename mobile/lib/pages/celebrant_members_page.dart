import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/contribution.dart';
import '../models/member.dart';
import 'contribution_detail_page.dart';

class CelebrantMembersPage extends StatefulWidget {
  const CelebrantMembersPage({super.key});

  @override
  State<CelebrantMembersPage> createState() => _CelebrantMembersPageState();
}

class _CelebrantMembersPageState extends State<CelebrantMembersPage> {
  List<String> _celebrants = [];
  String? _selectedCelebrant;
  List<Contribution> _contributions = [];
  List<Member> _members = [];
  bool _isLoadingCelebrants = true;
  bool _isLoadingData = false;

  @override
  void initState() {
    super.initState();
    _loadCelebrants();
  }

  Future<void> _loadCelebrants() async {
    setState(() => _isLoadingCelebrants = true);

    try {
      final celebrants = await ApiService.getCelebrants();
      setState(() {
        _celebrants = celebrants;
        _isLoadingCelebrants = false;
      });
    } catch (e) {
      setState(() => _isLoadingCelebrants = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _loadMembersByCelebrant(String celebrant) async {
    setState(() {
      _isLoadingData = true;
      _selectedCelebrant = celebrant;
      _contributions = [];
      _members = [];
    });

    try {
      // Récupérer les cotisations pour ce célébrant
      final contributions = await ApiService.getContributions(celebrant: celebrant);
      
      // Extraire les membres uniques
      final memberIds = <int>{};
      final membersMap = <int, Member>{};
      
      // Récupérer tous les membres une seule fois
      final allMembers = await ApiService.getMembers();
      final membersById = {for (var m in allMembers) m.id: m};
      
      for (var contribution in contributions) {
        if (!memberIds.contains(contribution.membreId)) {
          memberIds.add(contribution.membreId);
          // Utiliser le membre depuis la map ou créer un objet temporaire
          if (membersById.containsKey(contribution.membreId)) {
            membersMap[contribution.membreId] = membersById[contribution.membreId]!;
          } else {
            // Si le membre n'est pas trouvé, créer un objet temporaire avec les données de la contribution
            membersMap[contribution.membreId] = Member(
              id: contribution.membreId,
              nomComplet: contribution.membreNom ?? 'Membre inconnu',
              telephone: contribution.membreTelephone,
              statut: 'actif',
              createdAt: DateTime.now().toIso8601String(),
            );
          }
        }
      }

      setState(() {
        _contributions = contributions;
        _members = membersMap.values.toList();
        _isLoadingData = false;
      });
      
      // Debug: afficher le nombre de contributions et membres trouvés
      if (mounted && contributions.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${contributions.length} cotisation(s) trouvée(s) pour ${membersMap.length} membre(s)'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoadingData = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Sélecteur de célébrant
        Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Sélectionner un célébrant',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              _isLoadingCelebrants
                  ? const Center(child: CircularProgressIndicator())
                  : _celebrants.isEmpty
                      ? const Text('Aucun célébrant trouvé')
                      : DropdownButtonFormField<String>(
                          initialValue: _selectedCelebrant,
                          decoration: InputDecoration(
                            labelText: 'Célébrant',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            filled: true,
                            fillColor: Colors.grey[100],
                          ),
                          items: _celebrants.map((celebrant) {
                            return DropdownMenuItem<String>(
                              value: celebrant,
                              child: Text(celebrant),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              _loadMembersByCelebrant(value);
                            }
                          },
                        ),
            ],
          ),
        ),

        // Liste des membres
        Expanded(
          child: _selectedCelebrant == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.person_search,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Sélectionnez un célébrant',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                )
              : _isLoadingData
                  ? const Center(child: CircularProgressIndicator())
                  : _members.isEmpty
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
                                'Aucun membre trouvé',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: _members.length,
                          itemBuilder: (context, index) {
                            final member = _members[index];
                            final memberContributions = _contributions
                                .where((c) => c.membreId == member.id)
                                .toList();
                            
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              child: ExpansionTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.blue,
                                  child: Text(
                                    member.nomComplet[0].toUpperCase(),
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                                title: Text(
                                  member.nomComplet,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (member.telephone != null)
                                      Text('Tél: ${member.telephone}'),
                                    Text(
                                      '${memberContributions.length} cotisation(s)',
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                                children: memberContributions.map((contribution) {
                                  return ListTile(
                                    leading: Icon(
                                      _getTypeIcon(contribution.type),
                                      color: _getTypeColor(contribution.type),
                                    ),
                                    title: Text(
                                      _getTypeLabel(contribution.type),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Date: ${_formatDate(contribution.date)}',
                                        ),
                                        Text(
                                          'Montant: ${NumberFormat('#,##0', 'fr_FR').format(contribution.montant)} GNF',
                                        ),
                                        Text(
                                          'Statut: ${_getStatutLabel(contribution.statut)}',
                                          style: TextStyle(
                                            color: _getStatutColor(contribution.statut),
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    trailing: const Icon(Icons.chevron_right),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => ContributionDetailPage(
                                            contribution: contribution,
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                }).toList(),
                              ),
                            );
                          },
                        ),
        ),
      ],
    );
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'bapteme':
        return Icons.water_drop;
      case 'mariage':
        return Icons.favorite;
      case 'mensuelle':
        return Icons.calendar_today;
      case 'cas_particulier':
        return Icons.star;
      default:
        return Icons.receipt;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'bapteme':
        return Colors.blue;
      case 'mariage':
        return Colors.pink;
      case 'mensuelle':
        return Colors.green;
      case 'cas_particulier':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'bapteme':
        return 'Baptême';
      case 'mariage':
        return 'Mariage';
      case 'mensuelle':
        return 'Mensuelle';
      case 'cas_particulier':
        return 'Cas particulier';
      default:
        return type;
    }
  }

  String _getStatutLabel(String statut) {
    switch (statut) {
      case 'paye':
        return 'Payé';
      case 'non_paye':
        return 'Non payé';
      case 'partiel':
        return 'Partiel';
      default:
        return statut;
    }
  }

  Color _getStatutColor(String statut) {
    switch (statut) {
      case 'paye':
        return Colors.green;
      case 'non_paye':
        return Colors.red;
      case 'partiel':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String date) {
    try {
      final dateTime = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy', 'fr_FR').format(dateTime);
    } catch (e) {
      return date;
    }
  }
}

