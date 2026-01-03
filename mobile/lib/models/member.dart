class Member {
  final int id;
  final String nomComplet;
  final String? telephone;
  final String? fonction;
  final String? dateAdhesion;
  final String statut;
  final String createdAt;

  Member({
    required this.id,
    required this.nomComplet,
    this.telephone,
    this.fonction,
    this.dateAdhesion,
    required this.statut,
    required this.createdAt,
  });

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      nomComplet: json['nom_complet'] ?? json['nomComplet'] ?? '',
      telephone: json['telephone'],
      fonction: json['fonction'],
      dateAdhesion: json['date_adhesion'] ?? json['dateAdhesion'],
      statut: json['statut'] ?? 'actif',
      createdAt: json['created_at'] ?? json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom_complet': nomComplet,
      'telephone': telephone,
      'fonction': fonction,
      'date_adhesion': dateAdhesion,
      'statut': statut,
      'created_at': createdAt,
    };
  }
}

