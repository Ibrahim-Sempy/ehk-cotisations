import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import 'package:intl/intl.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _statsByType = [];
  bool _isLoading = true;
  String _period = 'month';

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);

    try {
      final isOnline = await SyncService.isOnline();
      if (!isOnline) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      final now = DateTime.now();
      String dateDebut;
      
      switch (_period) {
        case 'month':
          // Premier jour du mois en cours
          dateDebut = DateFormat('yyyy-MM-dd').format(DateTime(now.year, now.month, 1));
          break;
        case 'year':
          // Si on est en début d'année (janvier), inclure aussi l'année précédente
          // pour capturer les contributions de fin d'année
          if (now.month == 1) {
            dateDebut = DateFormat('yyyy-MM-dd').format(DateTime(now.year - 1, 1, 1));
          } else {
            dateDebut = DateFormat('yyyy-MM-dd').format(DateTime(now.year, 1, 1));
          }
          break;
        default:
          dateDebut = DateFormat('yyyy-MM-dd').format(DateTime(now.year, now.month, 1));
      }
      
      // Debug: afficher les dates utilisées
      // print('Période: $_period, Date début: $dateDebut, Date fin: $dateFin');

      final dateFin = DateFormat('yyyy-MM-dd').format(now);

      final stats = await ApiService.getStats(
        dateDebut: dateDebut,
        dateFin: dateFin,
      );

      // Get stats by type
      final statsByType = await ApiService.getStatsByType(
        dateDebut: dateDebut,
        dateFin: dateFin,
      );

      setState(() {
        _stats = stats;
        _statsByType = statsByType;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  String _formatNumber(double value) {
    return NumberFormat('#,##0', 'fr_FR').format(value);
  }

  @override
  Widget build(BuildContext context) {
    return _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStats,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Period selector
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'month', label: Text('Mois')),
                        ButtonSegment(value: 'year', label: Text('Année')),
                      ],
                      selected: {_period},
                      onSelectionChanged: (Set<String> newSelection) {
                        setState(() {
                          _period = newSelection.first;
                        });
                        _loadStats();
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // Summary card
                    if (_stats.isNotEmpty) ...[
                      Card(
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.blue.withValues(alpha: 0.1),
                                Colors.purple.withValues(alpha: 0.1),
                              ],
                            ),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Flexible(
                                child: _buildSummaryItem(
                                  'Taux de paiement',
                                  _stats['total'] != null && 
                                  (_stats['total_paye'] ?? 0) + (_stats['total_non_paye'] ?? 0) > 0
                                    ? '${(((_stats['total_paye'] ?? 0) / ((_stats['total_paye'] ?? 0) + (_stats['total_non_paye'] ?? 0))) * 100).toStringAsFixed(1)}%'
                                    : '0%',
                                  Colors.green,
                                ),
                              ),
                              Container(
                                width: 1,
                                height: 35,
                                color: Colors.grey[300],
                              ),
                              Flexible(
                                child: _buildSummaryItem(
                                  'Montant restant',
                                  '${_formatNumber(((_stats['total_non_paye'] ?? 0) + (_stats['total_partiel'] ?? 0)).toDouble())} GNF',
                                  Colors.orange,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    
                    // Message si aucune donnée
                    if (_stats.isEmpty || ((_stats['total'] ?? 0) == 0)) ...[
                      const SizedBox(height: 20),
                      Center(
                        child: Column(
                          children: [
                            Icon(Icons.info_outline, size: 48, color: Colors.grey[400]),
                            const SizedBox(height: 12),
                            Text(
                              _period == 'month' 
                                ? 'Aucune cotisation pour ce mois'
                                : 'Aucune cotisation pour cette année',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Stats cards
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.3,
                      children: [
                        _buildStatCard(
                          'Total Cotisations',
                          _formatNumber((_stats['total'] ?? 0).toDouble()),
                          Icons.receipt_long,
                          Colors.blue,
                        ),
                        _buildStatCard(
                          'Total Payé',
                          '${_formatNumber((_stats['total_paye'] ?? 0).toDouble())} GNF',
                          Icons.check_circle,
                          Colors.green,
                        ),
                        _buildStatCard(
                          'Total Non Payé',
                          '${_formatNumber((_stats['total_non_paye'] ?? 0).toDouble())} GNF',
                          Icons.warning,
                          Colors.red,
                        ),
                        _buildStatCard(
                          'Total Partiel',
                          '${_formatNumber((_stats['total_partiel'] ?? 0).toDouble())} GNF',
                          Icons.pending,
                          Colors.orange,
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Stats by type
                    if (_statsByType.isNotEmpty) ...[
                      const Text(
                        'Par type de cotisation',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ..._statsByType.map((stat) => _buildTypeStatCard(stat)),
                    ],
                  ],
                ),
              ),
            );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              color.withValues(alpha: 0.1),
              color.withValues(alpha: 0.05),
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey[700],
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Flexible(
                      child: Text(
                        value,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeStatCard(Map<String, dynamic> stat) {
    final typeLabels = {
      'mensuelle': 'Mensuelle',
      'bapteme': 'Baptême',
      'mariage': 'Mariage',
      'cas_particulier': 'Cas particulier',
    };

    final typeIcons = {
      'mensuelle': Icons.calendar_today,
      'bapteme': Icons.water_drop,
      'mariage': Icons.favorite,
      'cas_particulier': Icons.info,
    };

    final typeColors = {
      'mensuelle': Colors.blue,
      'bapteme': Colors.cyan,
      'mariage': Colors.pink,
      'cas_particulier': Colors.orange,
    };

    final type = stat['type'] ?? '';
    final total = (stat['total'] ?? 0).toDouble();
    final totalPaye = (stat['total_paye'] ?? 0).toDouble();
    final totalNonPaye = (stat['total_non_paye'] ?? 0).toDouble();
    final count = (stat['count'] ?? 0).toInt();
    final color = typeColors[type] ?? Colors.grey;
    final icon = typeIcons[type] ?? Icons.category;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        typeLabels[type] ?? type,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '$count cotisation${count > 1 ? 's' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_formatNumber(total)} GNF',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: color,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatRow(
                    'Payé',
                    '${_formatNumber(totalPaye)} GNF',
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatRow(
                    'Non payé',
                    '${_formatNumber(totalNonPaye)} GNF',
                    Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey[700],
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Flexible(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

