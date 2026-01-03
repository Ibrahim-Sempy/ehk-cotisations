import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import '../models/member.dart';

class AddMemberPage extends StatefulWidget {
  final Member? member;

  const AddMemberPage({super.key, this.member});

  @override
  State<AddMemberPage> createState() => _AddMemberPageState();
}

class _AddMemberPageState extends State<AddMemberPage> {
  final _formKey = GlobalKey<FormState>();
  final _nomCompletController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _fonctionController = TextEditingController();
  
  String _selectedStatut = 'actif';
  DateTime? _selectedDate;
  bool _isLoading = false;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _checkOnlineStatus();
    if (widget.member != null) {
      _nomCompletController.text = widget.member!.nomComplet;
      _telephoneController.text = widget.member!.telephone ?? '';
      _fonctionController.text = widget.member!.fonction ?? '';
      _selectedStatut = widget.member!.statut;
      if (widget.member!.dateAdhesion != null && widget.member!.dateAdhesion!.isNotEmpty) {
        try {
          _selectedDate = DateTime.parse(widget.member!.dateAdhesion!);
        } catch (e) {
          // Ignore parse error
        }
      }
    }
  }

  @override
  void dispose() {
    _nomCompletController.dispose();
    _telephoneController.dispose();
    _fonctionController.dispose();
    super.dispose();
  }

  Future<void> _checkOnlineStatus() async {
    final isOnline = await SyncService.isOnline();
    setState(() => _isOffline = !isOnline);
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (date != null) {
      setState(() => _selectedDate = date);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final data = {
        'nom_complet': _nomCompletController.text.trim(),
        'telephone': _telephoneController.text.trim().isEmpty ? null : _telephoneController.text.trim(),
        'fonction': _fonctionController.text.trim().isEmpty ? null : _fonctionController.text.trim(),
        'date_adhesion': _selectedDate != null
            ? DateFormat('yyyy-MM-dd').format(_selectedDate!)
            : null,
        'statut': _selectedStatut,
      };

      final isOnline = await SyncService.isOnline();

      if (isOnline) {
        if (widget.member != null) {
          // Update
          await ApiService.updateMember(widget.member!.id, data);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Membre modifié avec succès')),
            );
          }
        } else {
          // Create
          await ApiService.createMember(data);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Membre ajouté avec succès')),
            );
          }
        }
        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Action non disponible hors ligne'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.member != null ? 'Modifier le membre' : 'Nouveau membre'),
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
            // Nom complet
            TextFormField(
              controller: _nomCompletController,
              decoration: const InputDecoration(
                labelText: 'Nom complet *',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Veuillez entrer le nom complet';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Téléphone
            TextFormField(
              controller: _telephoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Téléphone',
                prefixIcon: Icon(Icons.phone),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Fonction
            TextFormField(
              controller: _fonctionController,
              decoration: const InputDecoration(
                labelText: 'Fonction',
                prefixIcon: Icon(Icons.work),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Date d'adhésion
            InkWell(
              onTap: _selectDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date d\'adhésion',
                  prefixIcon: Icon(Icons.calendar_today),
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _selectedDate != null
                      ? DateFormat('dd/MM/yyyy', 'fr_FR').format(_selectedDate!)
                      : 'Sélectionner une date',
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Statut
            DropdownButtonFormField<String>(
              initialValue: _selectedStatut,
              decoration: const InputDecoration(
                labelText: 'Statut *',
                prefixIcon: Icon(Icons.info),
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'actif', child: Text('Actif')),
                DropdownMenuItem(value: 'inactif', child: Text('Inactif')),
              ],
              onChanged: (value) {
                setState(() => _selectedStatut = value!);
              },
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
                  : Text(widget.member != null ? 'Modifier' : 'Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }
}

