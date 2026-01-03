import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { reportsAPI, membersAPI } from '../lib/api';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import styles from '../styles/Reports.module.css';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [dates, setDates] = useState({
    date_debut: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    date_fin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [memberId, setMemberId] = useState('');
  const [eventType, setEventType] = useState('mensuelle');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await membersAPI.getAll({ statut: 'actif' });
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      let blob;
      let filename;

      switch (reportType) {
        case 'monthly':
          blob = await reportsAPI.monthly(dates.date_debut, dates.date_fin);
          filename = `rapport_mensuel_${dates.date_debut}_${dates.date_fin}.pdf`;
          break;
        case 'member':
          if (!memberId) {
            alert('Veuillez sélectionner un membre');
            setLoading(false);
            return;
          }
          blob = await reportsAPI.member(memberId, {
            date_debut: dates.date_debut || undefined,
            date_fin: dates.date_fin || undefined,
          });
          filename = `rapport_membre_${memberId}.pdf`;
          break;
        case 'event':
          blob = await reportsAPI.event(eventType, {
            date_debut: dates.date_debut || undefined,
            date_fin: dates.date_fin || undefined,
          });
          filename = `rapport_${eventType}.pdf`;
          break;
        default:
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Erreur lors du téléchargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Génération de Rapports</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Type de rapport</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="monthly"
                  checked={reportType === 'monthly'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className={styles.radioContent}>
                  <FiFileText className={styles.radioIcon} />
                  <div>
                    <strong>Rapport mensuel</strong>
                    <p>Rapport global des cotisations sur une période</p>
                  </div>
                </div>
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="member"
                  checked={reportType === 'member'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className={styles.radioContent}>
                  <FiFileText className={styles.radioIcon} />
                  <div>
                    <strong>Rapport individuel</strong>
                    <p>Rapport des cotisations d'un membre spécifique</p>
                  </div>
                </div>
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="event"
                  checked={reportType === 'event'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className={styles.radioContent}>
                  <FiFileText className={styles.radioIcon} />
                  <div>
                    <strong>Rapport par événement</strong>
                    <p>Rapport des cotisations par type d'événement</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Paramètres</h2>
            <div className={styles.form}>
              {reportType === 'member' && (
                <div className={styles.formGroup}>
                  <label htmlFor="memberId">Membre *</label>
                  <select
                    id="memberId"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    required={reportType === 'member'}
                  >
                    <option value="">Sélectionner un membre</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.nom_complet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {reportType === 'event' && (
                <div className={styles.formGroup}>
                  <label htmlFor="eventType">Type d'événement *</label>
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="mensuelle">Mensuelle</option>
                    <option value="bapteme">Baptême</option>
                    <option value="mariage">Mariage</option>
                    <option value="cas_particulier">Cas particulier</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="date_debut">
                  <FiCalendar /> Date de début {reportType === 'monthly' && '*'}
                </label>
                <input
                  type="date"
                  id="date_debut"
                  value={dates.date_debut}
                  onChange={(e) =>
                    setDates({ ...dates, date_debut: e.target.value })
                  }
                  required={reportType === 'monthly'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="date_fin">
                  <FiCalendar /> Date de fin {reportType === 'monthly' && '*'}
                </label>
                <input
                  type="date"
                  id="date_fin"
                  value={dates.date_fin}
                  onChange={(e) =>
                    setDates({ ...dates, date_fin: e.target.value })
                  }
                  required={reportType === 'monthly'}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.downloadBtn}
              onClick={handleDownload}
              disabled={loading}
            >
              <FiDownload />
              {loading ? 'Génération...' : 'Télécharger le rapport PDF'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

