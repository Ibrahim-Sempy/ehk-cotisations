import { useState, useEffect } from 'react';
import { membersAPI } from '../lib/api';
import { FiX } from 'react-icons/fi';
import styles from '../styles/Modal.module.css';

export default function MemberModal({ member, onClose }) {
  const [formData, setFormData] = useState({
    nom_complet: '',
    telephone: '',
    fonction: '',
    date_adhesion: '',
    statut: 'actif',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        nom_complet: member.nom_complet || '',
        telephone: member.telephone || '',
        fonction: member.fonction || '',
        date_adhesion: member.date_adhesion || '',
        statut: member.statut || 'actif',
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (member) {
        await membersAPI.update(member.id, formData);
      } else {
        await membersAPI.create(formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{member ? 'Modifier le membre' : 'Nouveau membre'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="nom_complet">Nom complet *</label>
            <input
              type="text"
              id="nom_complet"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fonction">Fonction</label>
            <input
              type="text"
              id="fonction"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date_adhesion">Date d'adhésion</label>
            <input
              type="date"
              id="date_adhesion"
              name="date_adhesion"
              value={formData.date_adhesion}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="statut">Statut</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : member ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

