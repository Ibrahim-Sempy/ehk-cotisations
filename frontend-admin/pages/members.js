import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { membersAPI, reportsAPI } from '../lib/api';
import { getAuth } from '../lib/auth';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiDownload } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import styles from '../styles/Members.module.css';
import MemberModal from '../components/MemberModal';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const { user } = getAuth();

  useEffect(() => {
    loadMembers();
  }, [search, filter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filter !== 'all') params.statut = filter;

      const response = await membersAPI.getAll(params);
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce membre ?')) return;

    try {
      await membersAPI.delete(id);
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingMember(null);
    loadMembers();
  };

  const handleDownloadPDF = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.statut = filter;

      const response = await reportsAPI.members(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `liste_membres_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'secretaire';

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Membres</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className={styles.downloadBtn} onClick={handleDownloadPDF}>
              <FiDownload /> Télécharger PDF
            </button>
            {canEdit && (
              <button className={styles.addBtn} onClick={handleCreate}>
                <FiPlus /> Ajouter un membre
              </button>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tous</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : members.length === 0 ? (
          <div className={styles.empty}>
            <FiUser size={48} />
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Téléphone</th>
                  <th>Fonction</th>
                  <th>Date d'adhésion</th>
                  <th>Statut</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.nom_complet}</td>
                    <td>{member.telephone || '-'}</td>
                    <td>{member.fonction || '-'}</td>
                    <td>
                      {member.date_adhesion
                        ? format(parseISO(member.date_adhesion), 'dd/MM/yyyy')
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          member.statut === 'actif'
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {member.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(member)}
                            title="Modifier"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(member.id)}
                            title="Désactiver"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <MemberModal
            member={editingMember}
            onClose={handleModalClose}
          />
        )}
      </div>
    </Layout>
  );
}

