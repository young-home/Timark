import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MigrationBanner from '../components/MigrationBanner';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const hasLocalData = () => {
    const stored = localStorage.getItem('todos');
    return stored && JSON.parse(stored).length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('邮箱和密码不能为空');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      // 检查是否有 localStorage 旧数据需要迁移
      if (hasLocalData()) {
        setMigrating(true);
        return;
      }

      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 迁移完成后跳转
  const handleMigrationComplete = () => {
    setMigrating(false);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>待办事项</h1>
          <p>登录以同步你的任务</p>
        </div>

        {migrating ? (
          <MigrationBanner onComplete={handleMigrationComplete} />
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-email">邮箱</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">密码</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>

            <p className="auth-footer">
              还没有账号？ <Link to="/register">立即注册</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
