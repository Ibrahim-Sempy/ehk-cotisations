import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/contribution.dart';
import '../models/member.dart';

class LocalStorage {
  static Database? _database;
  static const String _dbName = 'ehk_cotisations.db';
  static const int _dbVersion = 2;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _dbName);

    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }


  static Future<void> _onCreate(Database db, int version) async {
    // Members table
    await db.execute('''
      CREATE TABLE members (
        id INTEGER PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        telephone TEXT,
        fonction TEXT,
        date_adhesion TEXT,
        statut TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Contributions table
    await db.execute('''
      CREATE TABLE contributions (
        id INTEGER PRIMARY KEY,
        type TEXT NOT NULL,
        montant REAL NOT NULL,
        date TEXT NOT NULL,
        membre_id INTEGER NOT NULL,
        membre_nom TEXT,
        membre_telephone TEXT,
        statut TEXT NOT NULL,
        observation TEXT,
        celebrant TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (membre_id) REFERENCES members(id)
      )
    ''');

    // Sync queue table
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');
  }

  static Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Add celebrant column to contributions table
      try {
        await db.execute('ALTER TABLE contributions ADD COLUMN celebrant TEXT');
      } catch (e) {
        // Column might already exist, ignore error
        // Migration note: celebrant column may already exist
      }
    }
  }

  // Members
  static Future<void> saveMembers(List<Member> members) async {
    final db = await database;
    final batch = db.batch();

    for (var member in members) {
      batch.insert(
        'members',
        {
          'id': member.id,
          'nom_complet': member.nomComplet,
          'telephone': member.telephone,
          'fonction': member.fonction,
          'date_adhesion': member.dateAdhesion,
          'statut': member.statut,
          'created_at': member.createdAt,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
  }

  static Future<List<Member>> getMembers({String? search}) async {
    final db = await database;
    List<Map<String, dynamic>> maps;

    if (search != null && search.isNotEmpty) {
      maps = await db.query(
        'members',
        where: 'nom_complet LIKE ? OR telephone LIKE ?',
        whereArgs: ['%$search%', '%$search%'],
        orderBy: 'nom_complet ASC',
      );
    } else {
      maps = await db.query('members', orderBy: 'nom_complet ASC');
    }

    return maps.map((map) => Member.fromJson(map)).toList();
  }

  // Contributions
  static Future<void> saveContributions(List<Contribution> contributions) async {
    final db = await database;
    final batch = db.batch();

    for (var contrib in contributions) {
      batch.insert(
        'contributions',
        {
          'id': contrib.id,
          'type': contrib.type,
          'montant': contrib.montant,
          'date': contrib.date,
          'membre_id': contrib.membreId,
          'membre_nom': contrib.membreNom,
          'membre_telephone': contrib.membreTelephone,
          'statut': contrib.statut,
          'observation': contrib.observation,
          'celebrant': contrib.celebrant,
          'created_at': contrib.createdAt,
          'synced': 1,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
  }

  static Future<List<Contribution>> getContributions({
    int? membreId,
    String? type,
    String? statut,
  }) async {
    final db = await database;
    final where = <String>[];
    final whereArgs = <dynamic>[];

    if (membreId != null) {
      where.add('membre_id = ?');
      whereArgs.add(membreId);
    }
    if (type != null) {
      where.add('type = ?');
      whereArgs.add(type);
    }
    if (statut != null) {
      where.add('statut = ?');
      whereArgs.add(statut);
    }

    final maps = await db.query(
      'contributions',
      where: where.isEmpty ? null : where.join(' AND '),
      whereArgs: whereArgs.isEmpty ? null : whereArgs,
      orderBy: 'date DESC',
    );

    return maps.map((map) => Contribution.fromJson(map)).toList();
  }

  static Future<int> addContributionOffline(Map<String, dynamic> data) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();

    // Add to contributions table with temporary ID
    final id = await db.insert(
      'contributions',
      {
        'id': -1, // Temporary ID
        'type': data['type'],
        'montant': data['montant'],
        'date': data['date'],
        'membre_id': data['membre_id'],
        'statut': data['statut'] ?? 'non_paye',
        'observation': data['observation'],
        'celebrant': data['celebrant'],
        'created_at': now,
        'synced': 0,
      },
    );

    // Add to sync queue
    await db.insert(
      'sync_queue',
      {
        'action': 'create',
        'table_name': 'contributions',
        'data': jsonEncode(data),
      },
    );

    return id;
  }

  static Future<List<Map<String, dynamic>>> getSyncQueue() async {
    final db = await database;
    return await db.query('sync_queue', orderBy: 'created_at ASC');
  }

  static Future<void> clearSyncQueue() async {
    final db = await database;
    await db.delete('sync_queue');
  }

  static Future<void> clearAll() async {
    final db = await database;
    await db.delete('members');
    await db.delete('contributions');
    await db.delete('sync_queue');
  }
}

