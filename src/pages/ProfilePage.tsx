import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { User as UserIcon, Mail, Camera, Loader2, Save, Settings, Moon, Sun, Monitor, Globe, PlayCircle, Shield, Wifi, Bell, EyeOff } from 'lucide-react';
import { storage } from '../lib/storage';
import { UserSettings } from '../types';

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setDisplayName(u.displayName || '');
        setPhotoURL(u.photoURL || '');
      } else {
        navigate('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL,
      });
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ!');
    } finally {
      setSaving(false);
    }
  };

    const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = storage.updateSettings(newSettings);
    setSettings(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-rose-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-hidden flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0) || user.email?.charAt(0) || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-zinc-800 mb-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'info' ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Thông tin cá nhân
              </div>
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'settings' ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Cài đặt ứng dụng
              </div>
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
              )}
            </button>
          </div>

          {activeTab === 'info' ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Hồ sơ cá nhân</h1>
                <p className="text-zinc-400">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email (đọc duy nhất)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-zinc-500" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user.email || ''}
                      className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-400 text-sm rounded-xl pl-10 pr-4 py-3 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Tên hiển thị</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="w-5 h-5 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">URL Ảnh đại diện</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Camera className="w-5 h-5 text-zinc-500" />
                    </div>
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Cài đặt</h1>
                <p className="text-zinc-400">Tùy chỉnh trải nghiệm xem phim của bạn.</p>
              </div>

              <div className="space-y-6">
                {/* Giao diện */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-4">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    Giao diện
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', name: 'Sáng', icon: Sun },
                      { id: 'dark', name: 'Tối', icon: Moon },
                      { id: 'system', name: 'Hệ thống', icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleUpdateSettings({ theme: t.id as any })}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                          settings.theme === t.id
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                            : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <t.icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Ngôn ngữ */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-4">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    Ngôn ngữ
                  </div>
                  <div className="flex bg-zinc-950/50 p-1 border border-zinc-800 rounded-xl max-w-xs">
                    {[
                      { id: 'vi', name: 'Tiếng Việt' },
                      { id: 'en', name: 'English' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleUpdateSettings({ language: l.id as any })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          settings.language === l.id
                            ? 'bg-zinc-800 text-white shadow-lg'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Trình phát video */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-4">
                    <PlayCircle className="w-5 h-5 text-indigo-500" />
                    Trình phát video
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                      <div>
                        <div className="text-white font-medium">Tự động phát</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Tự động phát tập tiếp theo khi kết thúc</div>
                      </div>
                      <button
                        onClick={() => handleUpdateSettings({ autoPlay: !settings.autoPlay })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          settings.autoPlay ? 'bg-rose-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.autoPlay ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                      <div>
                        <div className="flex items-center gap-2 text-white font-medium">
                           <Wifi className="w-4 h-4 text-zinc-400" />
                           Tiết kiệm dữ liệu
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">Giảm chất lượng video để tiết kiệm băng thông</div>
                      </div>
                      <button
                        onClick={() => handleUpdateSettings({ dataSaver: !settings.dataSaver })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          settings.dataSaver ? 'bg-rose-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.dataSaver ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Thông báo */}
                <section className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-4">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Thông báo
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                    <div>
                      <div className="text-white font-medium">Nhận thông báo</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Thông báo tập mới, phim hot, và cập nhật</div>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ notifications: !settings.notifications })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.notifications ? 'bg-rose-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </section>

                {/* Bảo mật */}
                <section className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-4">
                    <Shield className="w-5 h-5 text-rose-500" />
                    Bảo mật & Quyền riêng tư
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <EyeOff className="w-4 h-4 text-zinc-400" />
                        Tạm dừng lịch sử xem
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">Không lưu các phim bạn xem từ bây giờ</div>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ pauseHistory: !settings.pauseHistory })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.pauseHistory ? 'bg-rose-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.pauseHistory ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <button className="w-full text-left p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl hover:bg-rose-500/10 transition-colors">
                    <div className="text-rose-500 font-medium whitespace-nowrap">Xóa tài khoản</div>
                    <div className="text-xs text-rose-400 mt-0.5">Xóa vĩnh viễn tất cả thông tin và lịch sử xem của bạn</div>
                  </button>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
