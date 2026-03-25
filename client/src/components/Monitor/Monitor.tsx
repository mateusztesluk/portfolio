import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

import './Monitor.scss';

import MonitorService from 'shared/services/monitor.service';
import { Monitor as MonitorItem } from 'shared/interfaces/monitor';

const service = new MonitorService();

const initialForm = {
  name: '',
  url: '',
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not checked yet';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'up':
      return 'UP';
    case 'down':
      return 'DOWN';
    default:
      return 'PENDING';
  }
};

export const Monitor = () => {
  const [monitors, setMonitors] = useState<MonitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingIds, setCheckingIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  const fetchMonitors = () => {
    setLoading(true);
    service.getMonitors().then((response) => {
      setMonitors(response);
      setError('');
    }).catch(() => {
      setError('Monitor API is not available yet. Start the Go service to load real checks.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const stats = useMemo(() => {
    const upCount = monitors.filter((monitor) => monitor.status === 'up').length;
    const downCount = monitors.filter((monitor) => monitor.status === 'down').length;
    const measured = monitors.filter((monitor) => monitor.response_time_ms !== null);
    const average = measured.length
      ? Math.round(measured.reduce((sum, monitor) => sum + (monitor.response_time_ms || 0), 0) / measured.length)
      : 0;

    return {
      total: monitors.length,
      upCount,
      downCount,
      average,
    };
  }, [monitors]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    service.createMonitor(form).then((response) => {
      setMonitors((previous) => [response, ...previous]);
      setForm(initialForm);
      setError('');
    }).catch(() => {
      setError('Could not create a monitor. Check whether the Go API is running and the URL is valid.');
    }).finally(() => setSubmitting(false));
  };

  const onCheckNow = (id: number) => {
    setCheckingIds((previous) => [...previous, id]);
    service.checkMonitor(id).then((response) => {
      setMonitors((previous) => previous.map((monitor) => monitor.id === id ? response : monitor));
      setError('');
    }).catch(() => {
      setError('Manual check failed. The target URL may be unavailable or the API is offline.');
    }).finally(() => {
      setCheckingIds((previous) => previous.filter((currentId) => currentId !== id));
    });
  };

  return (
    <div className="monitor">
      <nav className="monitor__top section-shell" aria-label="Page navigation">
        <Link to="/" className="monitor__back-link">
          <ArrowBackIosNewRoundedIcon className="monitor__back-icon" fontSize="inherit" />
          Back to home
        </Link>
      </nav>

      <section className="monitor__hero section-shell">
        <div className="monitor__hero-card surface-card">
          <div className="monitor__intro">
            <div className="eyebrow">Go monitoring tool</div>
            <h1 className="monitor__title">Website monitor for health checks and response time</h1>
            <p className="monitor__lead">
              A simple full-stack tool: React on the front, Go on the backend, PostgreSQL underneath and Docker around it.
            </p>
          </div>

          <div className="monitor__stats">
            <div className="monitor__stat surface-card">
              <span className="monitor__stat-label">Total</span>
              <span className="monitor__stat-value">{stats.total}</span>
            </div>
            <div className="monitor__stat surface-card">
              <span className="monitor__stat-label">Up</span>
              <span className="monitor__stat-value">{stats.upCount}</span>
            </div>
            <div className="monitor__stat surface-card">
              <span className="monitor__stat-label">Avg response</span>
              <span className="monitor__stat-value">{stats.average ? `${stats.average} ms` : 'n/a'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="monitor__workspace section-shell">
        <div className="monitor__panel surface-card">
          <div className="monitor__panel-heading">
            <div>
              <div className="eyebrow">Create monitor</div>
              <h2 className="monitor__panel-title">Track a URL</h2>
            </div>
          </div>

          <form className="monitor__form" onSubmit={onSubmit}>
            <label className="monitor__field">
              <span className="monitor__field-label">Name</span>
              <input
                className="monitor__input"
                name="name"
                value={form.name}
                onChange={onInputChange}
                placeholder="Production API"
                required
              />
            </label>

            <label className="monitor__field">
              <span className="monitor__field-label">URL</span>
              <input
                className="monitor__input"
                name="url"
                value={form.url}
                onChange={onInputChange}
                placeholder="https://example.com/health"
                required
              />
            </label>

            <div className="monitor__form-actions">
              <button className="monitor__button monitor__button--primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add monitor'}
              </button>
              <button className="monitor__button" type="button" onClick={fetchMonitors}>
                Refresh list
              </button>
            </div>
          </form>
        </div>

        <div className="monitor__panel surface-card">
          <div className="monitor__panel-heading">
            <div>
              <div className="eyebrow">Current checks</div>
              <h2 className="monitor__panel-title">Endpoints overview</h2>
            </div>
          </div>

          {error && <div className="monitor__notice">{error}</div>}
          {loading && <div className="monitor__empty">Loading monitors...</div>}
          {!loading && !monitors.length && !error && (
            <div className="monitor__empty">
              No monitors yet. Add your first endpoint and start checking it from the Go service.
            </div>
          )}

          {!loading && !!monitors.length && (
            <div className="monitor__list">
              {monitors.map((monitor) => {
                const checking = checkingIds.includes(monitor.id);

                return (
                  <article className="monitor__item" key={monitor.id}>
                    <div className="monitor__item-top">
                      <div>
                        <h3 className="monitor__item-title">{monitor.name}</h3>
                        <a className="monitor__item-url" href={monitor.url} target="_blank" rel="noreferrer">
                          {monitor.url}
                        </a>
                      </div>
                      <span className={`monitor__status monitor__status--${monitor.status}`}>
                        {formatStatus(monitor.status)}
                      </span>
                    </div>

                    <div className="monitor__item-meta">
                      <span>Status code: {monitor.last_status_code ?? 'n/a'}</span>
                      <span>Response: {monitor.response_time_ms !== null ? `${monitor.response_time_ms} ms` : 'n/a'}</span>
                      <span>Checked: {formatDate(monitor.last_checked_at)}</span>
                    </div>

                    {monitor.error_message && (
                      <div className="monitor__item-error">{monitor.error_message}</div>
                    )}

                    <div className="monitor__item-actions">
                      <button
                        className="monitor__button"
                        type="button"
                        disabled={checking}
                        onClick={() => onCheckNow(monitor.id)}
                      >
                        {checking ? 'Checking...' : 'Check now'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
