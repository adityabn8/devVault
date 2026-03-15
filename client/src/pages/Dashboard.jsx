import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, BookOpen, CheckCircle, Code, TrendingUp, Clock } from 'lucide-react';
import { getStats, getHeatmap, getActivity, getContinueLearning } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getGreeting, formatRelativeTime, formatDate } from '../utils/formatters';

const ACTION_LABELS = {
  resource_saved: 'Saved a resource',
  resource_completed: 'Completed a resource',
  resource_deleted: 'Deleted a resource',
  snippet_added: 'Added a snippet',
  notes_updated: 'Updated notes',
  vault_created: 'Created a vault',
  vault_shared: 'Shared a vault',
  status_changed: 'Changed status',
};

const heatmapColor = (count, isDark) => {
  if (count === 0) return isDark ? '#1f2937' : '#E5E7EB';
  if (count === 1) return isDark ? '#14532d' : '#BBF7D0';
  if (count <= 3) return isDark ? '#16a34a' : '#4ADE80';
  return '#16A34A';
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [activities, setActivities] = useState([]);
  const [continueLearning, setContinueLearning] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    Promise.all([
      getStats(),
      getHeatmap(90),
      getActivity(15),
      getContinueLearning(),
    ]).then(([s, h, a, c]) => {
      setStats(s.data.stats);
      setHeatmap(h.data.heatmap);
      setActivities(a.data.activities);
      setContinueLearning(c.data.resources);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{getGreeting()}, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{today}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} label="Resources Saved" value={stats?.totalResources} sub={`${stats?.resourcesThisWeek} this week`} color="blue" />
            <StatCard icon={CheckCircle} label="Completed" value={stats?.completedResources} sub={`${stats?.completedThisWeek} this week`} color="green" />
            <StatCard icon={Code} label="Snippets" value={stats?.totalSnippets} color="purple" />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${stats?.currentStreak} days`}
              sub={`Longest: ${stats?.longestStreak} days`}
              color={stats?.currentStreak >= 7 ? 'orange' : 'blue'}
            />
          </div>

          {/* Heatmap */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Learning Activity</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-max pb-2">
                {heatmap.map((day) => (
                  <div
                    key={day.date}
                    className="w-3 h-3 rounded-sm cursor-pointer"
                    style={{ backgroundColor: heatmapColor(day.count, isDark) }}
                    title={`${day.count} activities on ${day.date}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Less</span>
              {[0, 1, 2, 4].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatmapColor(c, isDark) }} />
              ))}
              <span>More</span>
              <span className="ml-auto">Longest streak: {stats?.longestStreak} days</span>
            </div>
          </div>

          {/* Activity + Continue Learning */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Recent Activity */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet. Start saving resources!</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act._id} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{act.details || ACTION_LABELS[act.action]}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Continue Learning */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h2>
              {continueLearning.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Nothing in progress. Start learning!</p>
                  <Link to="/vaults" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Browse vaults</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {continueLearning.map((r) => (
                    <Link key={r._id} to={`/resources/${r._id}`} className="block p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{r.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        {r.vaultData && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{r.vaultData.name}</span>
                        )}
                        {r.lastOpenedAt && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(r.lastOpenedAt)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
