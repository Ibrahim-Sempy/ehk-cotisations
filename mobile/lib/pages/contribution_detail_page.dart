import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/contribution.dart';
import 'add_contribution_page.dart';

class ContributionDetailPage extends StatelessWidget {
  final Contribution contribution;

  const ContributionDetailPage({super.key, required this.contribution});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    IconData statusIcon;
    switch (contribution.statut) {
      case 'paye':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'non_paye':
        statusColor = Colors.red;
        statusIcon = Icons.pending_outlined;
        break;
      case 'partiel':
        statusColor = Colors.orange;
        statusIcon = Icons.pending;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.info;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails de la cotisation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => AddContributionPage(contribution: contribution),
                ),
              );
              if (result == true && context.mounted) {
                Navigator.pop(context, true);
              }
            },
            tooltip: 'Modifier',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status card
          Card(
            color: statusColor.withValues(alpha: 0.1),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(statusIcon, color: statusColor, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          contribution.statutLabel,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: statusColor,
                          ),
                        ),
                        Text(
                          contribution.typeLabel,
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Details
          _buildDetailRow('Membre', contribution.membreNom ?? 'N/A'),
          _buildDetailRow('Téléphone', contribution.membreTelephone ?? 'N/A'),
          _buildDetailRow('Montant', '${contribution.montant.toStringAsFixed(0)} GNF'),
          _buildDetailRow('Date', _formatDate(contribution.date)),
          if ((contribution.type == 'bapteme' || contribution.type == 'mariage') &&
              contribution.celebrant != null && contribution.celebrant!.isNotEmpty)
            _buildDetailRow('Célébrant', contribution.celebrant!),
          if (contribution.observation != null && contribution.observation!.isNotEmpty)
            _buildDetailRow('Observation', contribution.observation!),
        ],
      ),
    );
  }

  String _formatDate(String date) {
    try {
      final parsed = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy', 'fr_FR').format(parsed);
    } catch (e) {
      return date.split('T')[0];
    }
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}

