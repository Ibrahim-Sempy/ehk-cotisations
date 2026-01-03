import { useState, useEffect } from 'react';
import { contributionsAPI } from '../lib/api';
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import styles from '../styles/Modal.module.css';

export default function ContributionModal({ contribution, members, onClose }) {
  const [formData, setFormData] = useState({
    type: 'mensuelle',
    montant: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    membre_id: '',
    statut: 'non_paye',
    observation: '',
    celebrant: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contribution) {
      setFormData({
        type: contribution.type || 'mensuelle',
        montant: contribution.montant || '',
        date: contribution.date || format(new Date(), 'yyyy-MM-dd'),
        membre_id: contribution.membre_id || '',
        statut: contribution.statut || 'non_paye',
        observation: contribution.observation || '',
        celebrant: contribution.celebrant || '',
      });
    }
  }, [contribution]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        membre_id: parseInt(formData.membre_id),
        montant: parseFloat(formData.montant),
      };

      if (contribution) {
        await contributionsAPI.update(contribution.id, data);
      } else {
        await contributionsAPI.create(data);
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
          <h2>{contribution ? 'Modifier la cotisation' : 'Nouvelle cotisation'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="membre_id">Membre *</label>
            <select
              id="membre_id"
              name="membre_id"
              value={formData.membre_id}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un membre</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nom_complet}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="mensuelle">Mensuelle</option>
              <option value="bapteme">Baptême</option>
              <option value="mariage">Mariage</option>
              <option value="cas_particulier">Cas particulier</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="montant">Montant (GNF) *</label>
            <input
              type="number"
              id="montant"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="statut">Statut *</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              required
            >
              <option value="non_paye">Non payé</option>
              <option value="paye">Payé</option>
              <option value="partiel">Partiel</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="celebrant">
              Célébrant {(formData.type === 'bapteme' || formData.type === 'mariage') && '*'}
            </label>
            <input
              type="text"
              id="celebrant"
              name="celebrant"
              value={formData.celebrant}
              onChange={handleChange}
              required={formData.type === 'bapteme' || formData.type === 'mariage'}
              placeholder={
                formData.type === 'bapteme' || formData.type === 'mariage'
                  ? 'Nom du prêtre ou célébrant *'
                  : 'Nom du prêtre ou célébrant (optionnel)'
              }
              disabled={formData.type === 'mensuelle' || formData.type === 'cas_particulier'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="observation">Observation</label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              rows="3"
              className={styles.textarea}
            />
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
              {loading ? 'Enregistrement...' : contribution ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

