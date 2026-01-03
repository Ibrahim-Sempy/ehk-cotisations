class Contribution {
  final int id;
  final String type;
  final double montant;
  final String date;
  final int membreId;
  final String? membreNom;
  final String? membreTelephone;
  final String statut;
  final String? observation;
  final String? celebrant;
  final String createdAt;

  Contribution({
    required this.id,
    required this.type,
    required this.montant,
    required this.date,
    required this.membreId,
    this.membreNom,
    this.membreTelephone,
    required this.statut,
    this.observation,
    this.celebrant,
    required this.createdAt,
  });

  factory Contribution.fromJson(Map<String, dynamic> json) {
    return Contribution(
      id: json['id'],
      type: json['type'],
      montant: (json['montant'] as num).toDouble(),
      date: json['date'],
      membreId: json['membre_id'],
      membreNom: json['membre_nom'],
      membreTelephone: json['membre_telephone'],
      statut: json['statut'],
      observation: json['observation'],
      celebrant: json['celebrant'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'montant': montant,
      'date': date,
      'membre_id': membreId,
      'membre_nom': membreNom,
      'membre_telephone': membreTelephone,
      'statut': statut,
      'observation': observation,
      'celebrant': celebrant,
      'created_at': createdAt,
    };
  }

  String get typeLabel {
    switch (type) {
      case 'mensuelle':
        return 'Mensuelle';
      case 'bapteme':
        return 'Baptême';
      case 'mariage':
        return 'Mariage';
      case 'cas_particulier':
        return 'Cas particulier';
      default:
        return type;
    }
  }

  String get statutLabel {
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
}

