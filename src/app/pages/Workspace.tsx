import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import {
  Activity, ArrowRight, BookOpen, CalendarDays, CheckCircle2, CloudOff,
  Database, HeartHandshake, Image, LayoutDashboard, LockKeyhole, MessageCircle,
  Settings2, ShieldCheck, UserRoundCog, UsersRound,
} from 'lucide-react';
import { APP_ROLES, ROLE_LABELS, roleFromMetadata, type AppRole } from '../auth/roles';
import { supabase, supabaseConfigured } from '../utils/supabase/client';
import { checkBackendHealth, localBackendHealth, type BackendHealth } from '../utils/supabase/health';

const ROLE_COPY: Record<AppRole, { eyebrow: string; title: string; description: string }> = {
  owner: {
    eyebrow: 'Platform control',
    title: 'Owner workspace',
    description: 'Technical configuration, publishing, access control, reliability, and business-wide visibility.',
  },
  admin: {
    eyebrow: 'Day-to-day operations',
    title: 'Admin workspace',
    description: 'Children, families, enrolment, calendars, billing visibility, and team coordination.',
  },
  teacher: {
    eyebrow: 'Classroom tools',
    title: 'Teacher workspace',
    description: 'Assigned children, attendance, observations, classroom updates, and parent communication.',
  },
  parent: {
    eyebrow: 'Your family',
    title: 'Parent workspace',
    description: 'Your child’s updates, messages, calendar, menus, files, and permissions in one private place.',
  },
};

const ROLE_ACTIONS: Record<AppRole, Array<{ label: string; detail: string; icon: typeof Activity; href?: string }>> = {
  owner: [
    { label: 'Owner console', detail: 'Website, system health, publishing, and technical controls', icon: Settings2, href: '/admin' },
    { label: 'People & access', detail: 'Invite users and control role assignments', icon: UserRoundCog },
    { label: 'Local image library', detail: 'Stable semantic image slots with offline fallbacks', icon: Image },
    { label: 'Reliability centre', detail: 'Cloud health, failures, notifications, and audit history', icon: Activity },
  ],
  admin: [
    { label: 'Children & families', detail: 'Records, guardians, enrolment, and room assignment', icon: UsersRound },
    { label: 'Operations calendar', detail: 'Events, closures, meetings, and reminders', icon: CalendarDays },
    { label: 'Communications', detail: 'Announcements and family message oversight', icon: MessageCircle },
    { label: 'Website content', detail: 'Editorial content without technical platform controls', icon: LayoutDashboard },
  ],
  teacher: [
    { label: 'My classroom', detail: 'Assigned children and today’s room overview', icon: UsersRound },
    { label: 'Attendance', detail: 'Fast arrival, absence, and pickup recording', icon: CheckCircle2 },
    { label: 'Learning updates', detail: 'Observations, photos, and developmental notes', icon: BookOpen },
    { label: 'Family messages', detail: 'Private conversations for assigned children', icon: MessageCircle },
  ],
  parent: [
    { label: 'My child', detail: 'Daily updates, learning moments, and attendance', icon: HeartHandshake },
    { label: 'Messages', detail: 'Private communication with your child’s team', icon: MessageCircle },
    { label: 'Calendar & menu', detail: 'Upcoming events, meals, and reminders', icon: CalendarDays },
    { label: 'Files & permissions', detail: 'Forms, policies, downloads, and consent settings', icon: ShieldCheck },
  ],
};

function RoleWorkspace({ role, health, localPreview, onChangeRole }: {
  role: AppRole;
  health: BackendHealth;
  localPreview: boolean;
  onChangeRole: () => void;
}) {
  const copy = ROLE_COPY[role];
  const online = health.state === 'online';

  return (
    <main className="platform-shell">
      <header className="platform-bar">
        <Link to="/" className="platform-brand" aria-label="Early Years home">
          <span className="platform-brand__mark">EY</span>
          <span>Early Years</span>
        </Link>
        <div className="platform-bar__actions">
          <span className={`platform-status platform-status--${health.state}`}>
            {online ? <Database aria-hidden="true" /> : <CloudOff aria-hidden="true" />}
            {online ? 'Cloud online' : 'Local safe mode'}
          </span>
          {localPreview && <button className="platform-button platform-button--quiet" onClick={onChangeRole}>Switch role</button>}
        </div>
      </header>

      <section className="platform-content">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
          <p className="platform-eyebrow">{copy.eyebrow}</p>
          <div className="platform-heading-row">
            <div>
              <h1>{copy.title}</h1>
              <p>{copy.description}</p>
            </div>
            <span className="platform-role-badge"><LockKeyhole aria-hidden="true" />{ROLE_LABELS[role]}</span>
          </div>
        </motion.div>

        <div className={`platform-notice platform-notice--${health.state}`} role="status">
          <div><strong>{localPreview ? 'Local preview is active.' : 'System status'}</strong><p>{health.message}</p></div>
        </div>

        <section aria-labelledby="workspace-actions">
          <div className="platform-section-heading">
            <div><p className="platform-eyebrow">Workspace</p><h2 id="workspace-actions">What you can manage</h2></div>
            <span>{ROLE_ACTIONS[role].length} areas</span>
          </div>
          <div className="platform-grid">
            {ROLE_ACTIONS[role].map(({ label, detail, icon: Icon, href }, index) => {
              const content = <><span className="platform-card__icon"><Icon aria-hidden="true" /></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight className="platform-card__arrow" aria-hidden="true" /></>;
              return href ? <Link key={label} to={href} className="platform-card">{content}</Link> : <button key={label} className="platform-card" onClick={() => undefined} aria-describedby={`future-${role}-${index}`}>{content}<span id={`future-${role}-${index}`} className="sr-only">Foundation module; workflow implementation is in progress.</span></button>;
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default function Workspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [health, setHealth] = useState<BackendHealth>(() => localBackendHealth());
  const [previewRole, setPreviewRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkBackendHealth().then(setHealth);
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const authenticatedRole = useMemo(() => roleFromMetadata(session?.user.app_metadata), [session]);
  const role = authenticatedRole ?? previewRole;
  if (role) return <RoleWorkspace role={role} health={health} localPreview={!authenticatedRole} onChangeRole={() => setPreviewRole(null)} />;

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
  };

  return (
    <main className="platform-gate">
      <section className="platform-gate__card">
        <Link to="/" className="platform-brand"><span className="platform-brand__mark">EY</span><span>Early Years</span></Link>
        <p className="platform-eyebrow">Private workspace</p>
        <h1>{supabaseConfigured ? 'Welcome back' : 'Local role preview'}</h1>
        <p>{supabaseConfigured ? 'Sign in to open the workspace assigned to your account.' : 'The site is running without cloud credentials. Preview each role shell while backend setup is completed.'}</p>

        {supabaseConfigured ? (
          <form onSubmit={signIn} className="platform-form">
            <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            {error && <p className="platform-error" role="alert">{error}</p>}
            <button className="platform-button" type="submit">Sign in <ArrowRight aria-hidden="true" /></button>
          </form>
        ) : (
          <div className="platform-role-grid">
            {APP_ROLES.map(item => <button key={item} onClick={() => setPreviewRole(item)}><strong>{ROLE_LABELS[item]}</strong><span>{ROLE_COPY[item].eyebrow}</span><ArrowRight aria-hidden="true" /></button>)}
          </div>
        )}
      </section>
    </main>
  );
}

