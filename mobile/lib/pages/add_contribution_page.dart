import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/local_storage.dart';
import '../services/sync_service.dart';
import '../models/member.dart';
import '../models/contribution.dart';

class AddContributionPage extends StatefulWidget {
  final Contribution? contribution;

  const AddContributionPage({super.key, this.contribution});

  @override
  State<AddContributionPage> createState() => _AddContributionPageState();
}

class _AddContributionPageState extends State<AddContributionPage> {
  final _formKey = GlobalKey<FormState>();
  final _montantController = TextEditingController();
  final _observationController = TextEditingController();
  final _celebrantController = TextEditingController();
  
  List<Member> _members = [];
  Member? _selectedMember;
  String _selectedType = 'mensuelle';
  String _selectedStatut = 'non_paye';
  String _celebrant = '';
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _checkOnlineStatus();
    _loadMembers().then((_) {
      if (widget.contribution != null) {
        _loadContributionData();
      }
    });
  }

  void _loadContributionData() {
    final contrib = widget.contribution!;
    setState(() {
      _selectedType = contrib.type;
      _montantController.text = contrib.montant.toStringAsFixed(0);
      _selectedStatut = contrib.statut;
      _observationController.text = contrib.observation ?? '';
      _celebrant = contrib.celebrant ?? '';
      _celebrantController.text = _celebrant;
      try {
        _selectedDate = DateTime.parse(contrib.date);
      } catch (e) {
        _selectedDate = DateTime.now();
      }
      // Find and set the member
      for (var member in _members) {
        if (member.id == contrib.membreId) {
          _selectedMember = member;
          break;
        }
      }
    });
  }

  Future<void> _loadMembers() async {
    try {
      final isOnline = await SyncService.isOnline();
      List<Member> members;

      if (isOnline) {
        members = await ApiService.getMembers();
        await LocalStorage.saveMembers(members);
      } else {
        members = await LocalStorage.getMembers();
      }

      setState(() {
        _members = members;
        _isOffline = !isOnline;
      });
    } catch (e) {
      // Fallback to local storage
      final members = await LocalStorage.getMembers();
      setState(() {
        _members = members;
        _isOffline = true;
      });
    }
  }

  Future<void> _checkOnlineStatus() async {
    final isOnline = await SyncService.isOnline();
    setState(() => _isOffline = !isOnline);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedMember == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner un membre')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Format date as ISO8601 (YYYY-MM-DD)
      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      
      // Build data object, only including non-null values
      final data = <String, dynamic>{
        'type': _selectedType,
        'montant': double.parse(_montantController.text),
        'date': dateStr,
        'membre_id': _selectedMember!.id,
        'statut': _selectedStatut,
      };
      
      // Add optional fields only if they have values
      final observation = _observationController.text.trim();
      if (observation.isNotEmpty) {
        data['observation'] = observation;
      }
      
      if (_selectedType == 'bapteme' || _selectedType == 'mariage') {
        if (_celebrant.isNotEmpty) {
          data['celebrant'] = _celebrant;
        }
      }

      // Submitting contribution data

      final isOnline = await SyncService.isOnline();

      if (isOnline) {
        if (widget.contribution != null) {
          // Update online
          await ApiService.updateContribution(widget.contribution!.id, data);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Cotisation modifiée avec succès')),
            );
            Navigator.of(context).pop(true);
          }
        } else {
          // Create online
          await ApiService.createContribution(data);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Cotisation ajoutée avec succès')),
            );
            Navigator.of(context).pop(true);
          }
        }
      } else {
        // Save offline
        await LocalStorage.addContributionOffline(data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Cotisation enregistrée localement. Synchronisation à la prochaine connexion.'),
            ),
          );
          Navigator.of(context).pop(true);
        }
      }
    } catch (e) {
      // Error submitting contribution handled below
      if (mounted) {
        String errorMsg = 'Erreur lors de la sauvegarde';
        if (e.toString().contains('Exception: ')) {
          errorMsg = e.toString().replaceFirst('Exception: ', '');
        } else {
          errorMsg = e.toString();
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (date != null) {
      setState(() => _selectedDate = date);
    }
  }

  @override
  void dispose() {
    _montantController.dispose();
    _observationController.dispose();
    _celebrantController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.contribution != null ? 'Modifier la cotisation' : 'Nouvelle cotisation'),
        actions: [
          if (_isOffline)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Icon(
                Icons.cloud_off,
                color: Colors.orange,
                size: 20,
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Member selection
            DropdownButtonFormField<Member>(
              initialValue: _selectedMember,
              decoration: const InputDecoration(
                labelText: 'Membre *',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
              ),
              items: _members.map((member) {
                return DropdownMenuItem(
                  value: member,
                  child: Text(member.nomComplet),
                );
              }).toList(),
              onChanged: (member) {
                setState(() => _selectedMember = member);
              },
              validator: (value) {
                if (value == null) {
                  return 'Veuillez sélectionner un membre';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Type
            DropdownButtonFormField<String>(
              initialValue: _selectedType,
              decoration: const InputDecoration(
                labelText: 'Type *',
                prefixIcon: Icon(Icons.category),
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'mensuelle', child: Text('Mensuelle')),
                DropdownMenuItem(value: 'bapteme', child: Text('Baptême')),
                DropdownMenuItem(value: 'mariage', child: Text('Mariage')),
                DropdownMenuItem(value: 'cas_particulier', child: Text('Cas particulier')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedType = value!;
                  // Clear celebrant if type changes to non-bapteme/mariage
                  if (value != 'bapteme' && value != 'mariage') {
                    _celebrant = '';
                    _celebrantController.clear();
                  }
                });
              },
            ),
            const SizedBox(height: 16),

            // Celebrant (always visible, required for bapteme and mariage)
            TextFormField(
              controller: _celebrantController,
              decoration: InputDecoration(
                labelText: 'Célébrant${(_selectedType == 'bapteme' || _selectedType == 'mariage') ? ' *' : ''}',
                prefixIcon: const Icon(Icons.person_outline),
                border: const OutlineInputBorder(),
                hintText: (_selectedType == 'bapteme' || _selectedType == 'mariage')
                    ? 'Nom du prêtre ou célébrant'
                    : 'Non applicable pour ce type',
              ),
              enabled: _selectedType == 'bapteme' || _selectedType == 'mariage',
              onChanged: (value) {
                setState(() => _celebrant = value);
              },
              validator: (value) {
                if ((_selectedType == 'bapteme' || _selectedType == 'mariage') &&
                    (value == null || value.isEmpty)) {
                  return 'Veuillez entrer le nom du célébrant';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Amount
            TextFormField(
              controller: _montantController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Montant (GNF) *',
                prefixIcon: Icon(Icons.attach_money),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer un montant';
                }
                if (double.tryParse(value) == null) {
                  return 'Montant invalide';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Date
            InkWell(
              onTap: _selectDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date *',
                  prefixIcon: Icon(Icons.calendar_today),
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  DateFormat('dd/MM/yyyy', 'fr_FR').format(_selectedDate),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Status
            DropdownButtonFormField<String>(
              initialValue: _selectedStatut,
              decoration: const InputDecoration(
                labelText: 'Statut *',
                prefixIcon: Icon(Icons.info),
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'non_paye', child: Text('Non payé')),
                DropdownMenuItem(value: 'paye', child: Text('Payé')),
                DropdownMenuItem(value: 'partiel', child: Text('Partiel')),
              ],
              onChanged: (value) {
                setState(() => _selectedStatut = value!);
              },
            ),
            const SizedBox(height: 16),

            // Observation
            TextFormField(
              controller: _observationController,
              decoration: const InputDecoration(
                labelText: 'Observation',
                prefixIcon: Icon(Icons.note),
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 24),

            // Submit button
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(widget.contribution != null ? 'Modifier' : 'Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }
}

