import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { contributionsAPI, membersAPI } from '../lib/api';
import styles from '../styles/Celebrants.module.css';

export default function Celebrants() {
  const [celebrants, setCelebrants] = useState([]);
  const [selectedCelebrant, setSelectedCelebrant] = useState('');
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingCelebrants, setIsLoadingCelebrants] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCelebrants();
  }, []);

  const loadCelebrants = async () => {
    try {
      setIsLoadingCelebrants(true);
      const response = await contributionsAPI.getCelebrants();
      setCelebrants(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des célébrants');
      console.error(err);
    } finally {
      setIsLoadingCelebrants(false);
    }
  };

  const loadMembersByCelebrant = async (celebrant) => {
    try {
      setIsLoadingData(true);
      setSelectedCelebrant(celebrant);
      setContributions([]);
      setMembers([]);
      setError(null);

      // Récupérer les cotisations pour ce célébrant
      const contributionsResponse = await contributionsAPI.getAll({ celebrant });
      const contributionsData = contributionsResponse.data;

      // Récupérer tous les membres
      const membersResponse = await membersAPI.getAll();
      const allMembers = membersResponse.data;
      const membersById = {};
      allMembers.forEach(m => {
        membersById[m.id] = m;
      });

      // Extraire les membres uniques
      const memberIds = new Set();
      const membersMap = {};

      contributionsData.forEach(contribution => {
        if (!memberIds.has(contribution.membre_id)) {
          memberIds.add(contribution.membre_id);
          if (membersById[contribution.membre_id]) {
            membersMap[contribution.membre_id] = membersById[contribution.membre_id];
          } else {
            // Créer un objet temporaire si le membre n'est pas trouvé
            membersMap[contribution.membre_id] = {
              id: contribution.membre_id,
              nom_complet: contribution.membre_nom || 'Membre inconnu',
              telephone: contribution.membre_telephone,
              statut: 'actif',
            };
          }
        }
      });

      setContributions(contributionsData);
      setMembers(Object.values(membersMap));

      if (contributionsData.length > 0) {
        // Afficher un toast de succès
        setToast({
          message: `${contributionsData.length} cotisation(s) trouvée(s) pour ${Object.keys(membersMap).length} membre(s)`,
          type: 'success'
        });
      }
    } catch (err) {
      setError('Erreur lors de la récupération des données');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getTypeLabel = (type) => {
    const types = {
      'mensuelle': 'Mensuelle',
      'bapteme': 'Baptême',
      'mariage': 'Mariage',
      'cas_particulier': 'Cas particulier',
    };
    return types[type] || type;
  };

  const getStatutLabel = (statut) => {
    const statuts = {
      'paye': 'Payé',
      'non_paye': 'Non payé',
      'partiel': 'Partiel',
    };
    return statuts[statut] || statut;
  };

  const getStatutColor = (statut) => {
    const colors = {
      'paye': '#22c55e',
      'non_paye': '#ef4444',
      'partiel': '#f59e0b',
    };
    return colors[statut] || '#6b7280';
  };

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>Membres par Célébrant</h1>
        <p>Sélectionnez un célébrant pour voir les membres ayant cotisé avec lui</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.selector}>
        <label htmlFor="celebrant-select">Sélectionner un célébrant :</label>
        {isLoadingCelebrants ? (
          <div className={styles.loading}>Chargement des célébrants...</div>
        ) : celebrants.length === 0 ? (
          <div className={styles.empty}>Aucun célébrant trouvé</div>
        ) : (
          <select
            id="celebrant-select"
            value={selectedCelebrant}
            onChange={(e) => {
              if (e.target.value) {
                loadMembersByCelebrant(e.target.value);
              } else {
                setSelectedCelebrant('');
                setContributions([]);
                setMembers([]);
              }
            }}
            className={styles.select}
          >
            <option value="">-- Sélectionner un célébrant --</option>
            {celebrants.map((celebrant, index) => (
              <option key={index} value={celebrant}>
                {celebrant}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedCelebrant && (
        <div className={styles.content}>
          {isLoadingData ? (
            <div className={styles.loading}>Chargement des données...</div>
          ) : members.length === 0 ? (
            <div className={styles.empty}>Aucun membre trouvé pour ce célébrant</div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Téléphone</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution) => {
                    const member = members.find(m => m.id === contribution.membre_id);
                    return (
                      <tr key={contribution.id}>
                        <td className={styles.memberCell}>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberAvatar}>
                              {member?.nom_complet?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className={styles.memberName}>
                              {member?.nom_complet || contribution.membre_nom || 'Membre inconnu'}
                            </span>
                          </div>
                        </td>
                        <td>{member?.telephone || contribution.membre_telephone || '-'}</td>
                        <td>
                          <span className={styles.typeBadge}>
                            {getTypeLabel(contribution.type)}
                          </span>
                        </td>
                        <td>{formatDate(contribution.date)}</td>
                        <td className={styles.amountCell}>
                          {formatAmount(contribution.montant)} GNF
                        </td>
                        <td>
                          <span
                            className={styles.statutBadge}
                            style={{ 
                              backgroundColor: getStatutColor(contribution.statut) + '20',
                              color: getStatutColor(contribution.statut)
                            }}
                          >
                            {getStatutLabel(contribution.statut)}
                          </span>
                        </td>
                        <td className={styles.observationCell}>
                          {contribution.observation || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedCelebrant && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>👤</div>
          <p>Sélectionnez un célébrant pour voir les membres</p>
        </div>
      )}
      </div>
    </Layout>
  );
}

