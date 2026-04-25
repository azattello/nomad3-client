import React, { useEffect, useState } from "react";
import './styles/profile.css';
import { useDispatch } from "react-redux";
import { logout } from "../reducers/userReducer";
import defaultProfileImage from '../assets/img/profile.png';
import { useNavigate, Link } from "react-router-dom";
import config from "../config";
import Tab from './Tab';
import SettingsModal from './SettingsModal';
import { showToast } from './Toast';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openSettingsModal = () => setIsModalOpen(true);
    const closeSettingsModal = () => setIsModalOpen(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);

                    if (data.user.profilePhoto) {
                        const imageUrl = new URL(data.user.profilePhoto, config.apiUrl).toString();
                        setProfileImage(imageUrl);
                    } else {
                        setProfileImage(defaultProfileImage);
                    }
                    setLoading(false);
                } else {
                    console.error('Failed to fetch user profile:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('phone', userData.phone);

            try {
                const response = await fetch(`${config.apiUrl}/api/upload/profile-image`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileImage(`${config.apiUrl}${data.imageUrl}`);
                } else {
                    console.error('Failed to upload image:', response.statusText);
                }
            } catch (error) {
                console.error('Error uploading image:', error.message);
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Скопировано в буфер обмена', 'success');
    };

    return (
        <div className="profile">
            <header className='header-main'>
                <h1 className='text-header'>Аккаунт</h1>
            </header>

            <div className="section__profile">
                <SettingsModal isOpen={isModalOpen} onClose={closeSettingsModal} />

                {loading ? (
                    <div className="loading-state">Загрузка профиля...</div>
                ) : (
                    userData && (
                        <>
                            {/* ID и кнопка копирования */}
                            <div className="profile-header">
                                <div className="profile-id-section">
                                    <span className="profile-id-label">Личный номер:</span>
                                    <span className="profile-id">{userData.personalId}</span>
                                    <button className="copy-id-btn" onClick={() => copyToClipboard(userData.personalId)}>
                                        Скопировать ID
                                    </button>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="profile-info-section">
                                <div className="info-row-c">
                                    <span className="info-label">Имя:</span>
                                    <span className="info-value">{userData.name} {userData.surname}</span>
                                </div>
                                <div className="info-row-c">
                                    <span className="info-label">Телефон:</span>
                                    <span className="info-value">{userData.phone}</span>
                                </div>
                                <div className="info-row-c">
                                    <span className="info-label">Филиал:</span>
                                    <span className="info-value">{userData.selectedFilial || 'Не выбран'}</span>
                                </div>
                            </div>

                            {/* Пароль */}
                            <div className="password-section">
                                <div className="password-card">
                                    <div className="password-header">
                                        <span className="password-label-text">🔐 Пароль</span>
                                        <button 
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? 'Скрыть' : 'Показать'}
                                        >
                                            {showPassword ? '👁️' : '🔒'}
                                        </button>
                                    </div>
                                    <p className="password-display">
                                        {showPassword ? userData.password : '•'.repeat(Math.min(userData.password?.length || 0, 12))}
                                    </p>
                                </div>
                            </div>

                            {/* Кнопки действия */}
                            <div className="profile-actions">
                                {userData && (userData.role === 'admin' || userData.role === 'filial') && (
                                    <Link to="/dashboard" className="action-btn dashboard-btn">
                                        📊 Панель управления
                                    </Link>
                                )}

                                <button className="action-btn settings-btn" onClick={openSettingsModal}>
                                    Изменить пароль
                                </button>

                                <button 
                                    className="action-btn logout-btn-client" 
                                    onClick={() => {
                                        dispatch(logout());
                                        navigate("/");
                                    }}
                                >
                                Выйти из аккаунта
                                </button>
                            </div>
                        </>
                    )
                )}
            </div>

            <div className="area3"></div>
            <Tab />
        </div>
    );
};

export default Profile;
