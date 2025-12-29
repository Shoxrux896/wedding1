import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (blocked) {
      setError('🚫 Слишком много попыток. Подождите 5 минут.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAttempts(0);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setBlocked(true);
        setError('🚫 Превышен лимит попыток входа. Подождите 5 минут.');

        setTimeout(() => {
          setBlocked(false);
          setAttempts(0);
        }, 5 * 60 * 1000);
      } else {
        setError(`❌ Неверный email или пароль (попытка ${newAttempts}/5)`);
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-white)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--color-white)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--color-black)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            margin: '0',
            fontSize: '32px',
            fontWeight: '400',
            fontFamily: "'Cormorant', serif",
            color: 'var(--color-black)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Admin Panel
          </h2>
          <p style={{
            margin: '10px 0 0 0',
            fontSize: '12px',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Wedding Gallery Management
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--color-black)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={blocked}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '14px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: '0',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
            />
          </div>

          <div style={{ marginBottom: '35px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--color-black)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={blocked}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '14px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: '0',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--color-gray-50)',
              color: 'var(--color-black)',
              padding: '12px',
              border: '1px solid var(--color-black)',
              marginBottom: '20px',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || blocked}
            className="admin-btn primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Вход...' : blocked ? 'Заблокировано' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}