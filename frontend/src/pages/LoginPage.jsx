import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Если уже залогинен —  на главную (или на страницу, откуда пришёл)
  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось войти');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <h1>Система анализа ДТП</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>Логин</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button
          className="btn btn--primary btn--full"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
        <Link to="/">← Продолжить как гость</Link>
      </p>
    </div>
  );
}
