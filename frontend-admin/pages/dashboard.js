import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { contributionsAPI } from '../lib/api';
import { format } from 'date-fns';
import { FiTrendingUp, FiDollarSign, FiAlertCircle, FiUsers } from 'react-icons/fi';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    total_paye: 0,
    total_non_paye: 0,
    total_partiel: 0,
  });
  const [statsByType, setStatsByType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const date_debut = getDateStart(period);
      const date_fin = format(new Date(), 'yyyy-MM-dd');

      console.log('Loading stats - Period:', period, 'Date début:', date_debut, 'Date fin:', date_fin);

      const [statsResponse, statsByTypeResponse] = await Promise.all([
        contributionsAPI.getStats({
          date_debut: date_debut,
          date_fin: date_fin,
        }),
        contributionsAPI.getStatsByType({
          date_debut: date_debut,
          date_fin: date_fin,
        }),
      ]);

      console.log('Stats response:', statsResponse.data);
      console.log('Stats by type response:', statsByTypeResponse.data);

      // Handle null values and ensure numbers
      const statsData = statsResponse.data || {};
      setStats({
        total: Number(statsData.total) || 0,
        total_paye: Number(statsData.total_paye) || 0,
        total_non_paye: Number(statsData.total_non_paye) || 0,
        total_partiel: Number(statsData.total_partiel) || 0,
      });
      setStatsByType(statsByTypeResponse.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateStart = (period) => {
    const now = new Date();
    switch (period) {
      case 'month':
        return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
      case 'year':
        // Si on est en début d'année (janvier), inclure aussi l'année précédente
        // pour capturer les contributions de fin d'année
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (currentMonth === 0) {
          // Janvier : inclure depuis le 1er janvier de l'année précédente
          return format(new Date(currentYear - 1, 0, 1), 'yyyy-MM-dd');
        }
        return format(new Date(currentYear, 0, 1), 'yyyy-MM-dd');
      default:
        return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    }
  };

  const statCards = [
    {
      title: 'Total Cotisations',
      value: stats.total || 0,
      icon: FiDollarSign,
      color: '#3b82f6',
      suffix: '',
    },
    {
      title: 'Total Payé',
      value: stats.total_paye || 0,
      icon: FiTrendingUp,
      color: '#10b981',
      suffix: ' GNF',
    },
    {
      title: 'Total Non Payé',
      value: stats.total_non_paye || 0,
      icon: FiAlertCircle,
      color: '#ef4444',
      suffix: ' GNF',
    },
    {
      title: 'Total Partiel',
      value: stats.total_partiel || 0,
      icon: FiUsers,
      color: '#f59e0b',
      suffix: ' GNF',
    },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tableau de bord</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} className={styles.statCard}>
                    <div className={styles.statCardHeader}>
                      <div
                        className={styles.statIcon}
                        style={{ backgroundColor: `${card.color}20`, color: card.color }}
                      >
                        <Icon />
                      </div>
                    </div>
                    <div className={styles.statCardBody}>
                      <p className={styles.statValue}>
                        {card.value.toLocaleString()}
                        {card.suffix}
                      </p>
                      <p className={styles.statTitle}>{card.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h3>Résumé</h3>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryItem}>
                    <span>Taux de paiement:</span>
                    <strong>
                      {stats.total > 0
                        ? ((stats.total_paye / (stats.total_paye + stats.total_non_paye)) * 100).toFixed(1)
                        : 0}
                      %
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Montant restant:</span>
                    <strong>{(stats.total_non_paye + stats.total_partiel).toLocaleString()} GNF</strong>
                  </div>
                </div>
              </div>
            </div>

            {statsByType.length > 0 && (
              <div className={styles.summaryCard}>
                <h3>Total par type</h3>
                <div className={styles.typeStatsGrid}>
                  {statsByType.map((item, index) => {
                    const typeLabels = {
                      mensuelle: 'Mensuelle',
                      bapteme: 'Baptême',
                      mariage: 'Mariage',
                      cas_particulier: 'Cas part.',
                    };
                    return (
                      <div key={index} className={styles.typeStatCard}>
                        <div className={styles.typeStatHeader}>
                          <strong>{typeLabels[item.type] || item.type}</strong>
                          <span className={styles.typeStatCount}>{item.count}</span>
                        </div>
                        <div className={styles.typeStatBody}>
                          <div className={styles.typeStatRow}>
                            <span>Total:</span>
                            <strong>{item.total.toLocaleString()}</strong>
                          </div>
                          <div className={styles.typeStatRow}>
                            <span>Payé:</span>
                            <span style={{ color: '#10b981' }}>{item.total_paye.toLocaleString()}</span>
                          </div>
                          <div className={styles.typeStatRow}>
                            <span>Non payé:</span>
                            <span style={{ color: '#ef4444' }}>{item.total_non_paye.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

