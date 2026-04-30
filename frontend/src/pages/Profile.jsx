import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Save, Moon, Sun } from 'lucide-react';

const Profile = ({ isDark, setIsDark }) => {
    const { user } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = (e) => {
        e.preventDefault();
        // Placeholder for API call
        alert('Profile updated! (Simulation)');
    };

    return (
        <div className={`min-h-screen pt-20 px-4 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-6 mb-8">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-600'}`}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{user?.name}</h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
