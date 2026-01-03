import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { contributionsAPI, membersAPI, reportsAPI } from '../lib/api';
import { getAuth } from '../lib/auth';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import styles from '../styles/Contributions.module.css';
import ContributionModal from '../components/ContributionModal';

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    statut: 'all',
    date_debut: '',
    date_fin: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const { user } = getAuth();

  useEffect(() => {
    loadMembers();
    loadContributions();
  }, [filters, search]);

  const loadMembers = async () => {
    try {
      const response = await membersAPI.getAll({ statut: 'actif' });
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadContributions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.statut !== 'all') params.statut = filters.statut;
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const response = await contributionsAPI.getAll(params);
      let filtered = response.data;

      if (search) {
        filtered = filtered.filter(
          (c) =>
            c.membre_nom?.toLowerCase().includes(search.toLowerCase()) ||
            c.membre_telephone?.includes(search)
        );
      }

      setContributions(filtered);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContribution(null);
    setModalOpen(true);
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette cotisation ?')) return;

    try {
      await contributionsAPI.delete(id);
      loadContributions();
    } catch (error) {
      console.error('Error deleting contribution:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingContribution(null);
    loadContributions();
  };

  const handleDownloadPDF = async () => {
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.statut !== 'all') params.statut = filters.statut;
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const response = await reportsAPI.contributions(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `liste_cotisations_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      mensuelle: 'Mensuelle',
      bapteme: 'Baptême',
      mariage: 'Mariage',
      cas_particulier: 'Cas particulier',
    };
    return labels[type] || type;
  };

  const getStatutLabel = (statut) => {
    const labels = {
      paye: 'Payé',
      non_paye: 'Non payé',
      partiel: 'Partiel',
    };
    return labels[statut] || statut;
  };

  const canEdit = user?.role === 'admin' || user?.role === 'secretaire';

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Cotisations</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className={styles.downloadBtn} onClick={handleDownloadPDF}>
              <FiDownload /> Télécharger PDF
            </button>
            {canEdit && (
              <button className={styles.addBtn} onClick={handleCreate}>
                <FiPlus /> Ajouter une cotisation
              </button>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher par membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="all">Tous les types</option>
            <option value="mensuelle">Mensuelle</option>
            <option value="bapteme">Baptême</option>
            <option value="mariage">Mariage</option>
            <option value="cas_particulier">Cas particulier</option>
          </select>
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="all">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="non_paye">Non payé</option>
            <option value="partiel">Partiel</option>
          </select>
          <input
            type="date"
            value={filters.date_debut}
            onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
            className={styles.dateInput}
            placeholder="Date début"
          />
          <input
            type="date"
            value={filters.date_fin}
            onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
            className={styles.dateInput}
            placeholder="Date fin"
          />
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : contributions.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={48} />
            <p>Aucune cotisation trouvée</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Membre</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Célébrant</th>
                  <th>Observation</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr key={contribution.id}>
                    <td>{format(new Date(contribution.date), 'dd/MM/yyyy')}</td>
                    <td>
                      <div>
                        <div className={styles.memberName}>{contribution.membre_nom}</div>
                        {contribution.membre_telephone && (
                          <div className={styles.memberPhone}>
                            {contribution.membre_telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>
                        {getTypeLabel(contribution.type)}
                      </span>
                    </td>
                    <td className={styles.amount}>
                      {contribution.montant.toLocaleString()} GNF
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          contribution.statut === 'paye'
                            ? styles.statusPaye
                            : contribution.statut === 'partiel'
                            ? styles.statusPartiel
                            : styles.statusNonPaye
                        }`}
                      >
                        {getStatutLabel(contribution.statut)}
                      </span>
                    </td>
                    <td>
                      {(contribution.type === 'bapteme' || contribution.type === 'mariage')
                        ? (contribution.celebrant || '-')
                        : '-'}
                    </td>
                    <td className={styles.observation}>
                      {contribution.observation || '-'}
                    </td>
                    {canEdit && (
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(contribution)}
                            title="Modifier"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(contribution.id)}
                            title="Supprimer"
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
          <ContributionModal
            contribution={editingContribution}
            members={members}
            onClose={handleModalClose}
          />
        )}
      </div>
    </Layout>
  );
}

