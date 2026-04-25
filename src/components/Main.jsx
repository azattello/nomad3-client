import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './styles/main2.css';
import Tab from './Tab';
import config from '../config';
import { useSelector } from 'react-redux';
import { getFilialContactsByName, getFilialSettingsByName } from '../action/settings';

// icons
import filialsIcon from '../assets/icons/newicons/filials.png';
import invoiceIcon from '../assets/icons/newicons/invoice.png';
import chinaIcon from '../assets/icons/newicons/chinaadress.png';
import qrIcon from '../assets/icons/newicons/qr.png';
import telegramIcon from '../assets/icons/telegram.svg';
import instagramIcon from '../assets/icons/logo-instagram.svg';
import phoneIcon from '../assets/icons/call-outline.svg';
import whatsappIcon from '../assets/icons/logo-whatsapp.svg';

const Main = () => {
    const [banners, setBanners] = useState([]);
    const [activeBanner, setActiveBanner] = useState(0);
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState(null);
    const [settings, setSettings] = useState(null);
    
    const selectedFilial = useSelector(state => state.user.currentUser?.selectedFilial);
    const userRole = useSelector(state => state.user.currentUser?.role);
    const userId = useSelector(state => state.user.currentUser?._id || state.user.currentUser?.id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Загружаем баннеры
                const bannerResponse = await axios.get(`${config.apiUrl}/api/upload/getBanners`);
                const rawBanners = bannerResponse.data.banners || [];
                setBanners(rawBanners);
                setActiveBanner(0);

                // Для филиалов сначала получаем их филиал
                let effectiveSelectedFilial = selectedFilial;
                if (userRole === 'filial' && userId) {
                    try {
                        const filialResponse = await axios.get(`${config.apiUrl}/api/filial/getFilialByUser/${userId}`);
                        if (filialResponse.data && filialResponse.data.filialText) {
                            effectiveSelectedFilial = filialResponse.data.filialText;
                        }
                    } catch (filialError) {
                        console.error('Ошибка при получении филиала пользователя:', filialError);
                    }
                }

                // Загружаем контакты
                let contactsData;
                if (userRole === 'filial' && userId) {
                    const contactsResponse = await axios.get(`${config.apiUrl}/api/filial/getFilialContacts/${userId}`);
                    contactsData = contactsResponse.data;
                } else if (effectiveSelectedFilial) {
                    // Для клиентов используем имя филиала
                    contactsData = await getFilialContactsByName(effectiveSelectedFilial);
                } else {
                    const contactsResponse = await axios.get(`${config.apiUrl}/api/settings/getContacts`);
                    contactsData = contactsResponse.data;
                }
                setContacts(contactsData);
                console.log('Contacts loaded:', contactsData);

                // Загружаем настройки (для Terms информации)
                let settingsData;
                if (userRole === 'filial' && userId) {
                    const settingsResponse = await axios.get(`${config.apiUrl}/api/filial/getFilialSettings/${userId}`);
                    settingsData = settingsResponse.data;
                } else if (effectiveSelectedFilial) {
                    // Для клиентов используем имя филиала
                    settingsData = await getFilialSettingsByName(effectiveSelectedFilial);
                } else {
                    const settingsResponse = await axios.get(`${config.apiUrl}/api/settings/getSettings`);
                    settingsData = settingsResponse.data;
                }
                setSettings(settingsData);
                console.log('Settings loaded:', settingsData);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedFilial, userRole, userId]);

    useEffect(() => {
        if (!banners || banners.length === 0) return;

        const interval = setInterval(() => {
            setActiveBanner(prev => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners]);

    return (
        <div className="main">
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <p>Загрузка данных...</p>
                </div>
            )}
            
            <header className='header-main'>
                <h1 className='text-header'>Главная</h1>
            </header>   


            <div className="section-main">

                <div className="banner-wrapper">
                    {banners.length === 0 ? (
                        <div className="banner-empty">Нет баннеров. Пожалуйста, обновите страницу.</div>
                    ) : (
                        <>
                            <div className="banner-slider">
                                {banners.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`banner-slide ${idx === activeBanner ? 'active' : 'inactive'}`}
                                        onClick={() => {}}
                                    >
                                        {item ? (
                                            <img
                                                src={`${config.apiUrl}${item}`}
                                                alt={`banner-${idx}`}
                                                className="banner-image"
                                            />
                                        ) : (
                                            <div className="banner-empty">Пустой слот баннера</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="banner-dots">
                                {banners.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`banner-dot ${idx === activeBanner ? 'active' : ''}`}
                                        onClick={() => setActiveBanner(idx)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="menu-section">
                    <Link className="menu-item-wrapper" to="/filials">
                        <img src={filialsIcon} alt="" />
                        <p>Филиалы</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/invoices">
                        <img src={invoiceIcon} alt="" />
                        <p>Счета</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/warehouse">
                        <img src={chinaIcon} alt="" />
                        <p>Адрес</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/qr">
                        <img src={qrIcon} alt="" />
                        <p>QR</p>
                    </Link>

                    
                </div>




            {/* О нас секция */}
            {settings && settings.aboutUsText && (
                <div className="info-section">
                    <h2 style={{textAlign: 'left', marginBottom: '20px'}}>О нас</h2>
                    <p style={{textAlign: 'left', lineHeight: '1.6', color: '#555'}}>{settings.aboutUsText.split('\n')[0]}</p>
                </div>
            )}

            {/* Запрещенные товары секция */}
            {settings && settings.prohibitedItemsText && (
                <div className="info-section">
                    <h2 style={{textAlign: 'left', marginBottom: '20px'}}>Запрещенные товары</h2>
                    {settings.prohibitedItemsText.split('\n').map((line, index) => (
                        <p key={index} style={{textAlign: 'left', lineHeight: '1.6', color: '#555', margin: index === 0 ? 0 : '8px 0 0 0'}}>
                            {line}
                        </p>
                    ))}
                </div>
            )}

            {/* Документы секция */}
            {settings && settings.contractFilePath && (
                <div className="info-section">
                    <h2 style={{textAlign: 'left', marginBottom: '20px'}}>Документы</h2>
                    <a
                        href={`${config.apiUrl}${settings.contractFilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{display: 'inline-block', padding: '10px 20px', backgroundColor: '#007b55', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: '500'}}
                    >
                        📄 Скачать договор и условия
                    </a>
                </div>
            )}


            {/* Контакты секция */}
            {contacts && (
                <div className="info-section">
                    <h2 style={{textAlign: 'left', marginBottom: '20px'}}>Контакты</h2>
                    <div className="contacts-list">
                        {contacts.phone && (
                            <a href={`tel:${contacts.phone}`} style={{display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#333'}}>
                                <img src={phoneIcon} alt="Phone" style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} />
                                {contacts.phone}
                            </a>
                        )}

                        {contacts.whatsappLink && (
                            <a href={contacts.whatsappLink} target="_blank" rel="noopener noreferrer" style={{display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#333'}}>
                                <img src={whatsappIcon} alt="WhatsApp" style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} />
                                Написать на WhatsApp
                            </a>
                        )}

                        {contacts.telegramLink && (
                            <a href={contacts.telegramLink} target="_blank" rel="noopener noreferrer" style={{display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#333'}}>
                                <img src={telegramIcon} alt="Telegram" style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} />
                                Telegram
                            </a>
                        )}

                        {contacts.instagram && (
                            <a href={`https://instagram.com/${contacts.instagram}`} target="_blank" rel="noopener noreferrer" style={{display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#333'}}>
                                <img src={instagramIcon} alt="Instagram" style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} />
                                Instagram
                            </a>
                        )}
                    </div>
                </div>
            )}

            </div>
            

            <div className="area"></div>
            <Tab className="TabMain" />
        </div>
    );
};

export default Main;
