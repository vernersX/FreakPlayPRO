// client/src/App.js
import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import MatchesPage from './components/MatchesPage/MatchesPage.jsx';
import InventoryPage from './components/Inventory/InventoryPage';
import CardDetailPage from './components/CardDetail/CardDetailPage';
import ProfileInfo from './components/ProfileInfo/ProfileInfo';
import BetsPage from './components/BetsPage/BetsPage';
import NavMenu from './components/NavMenu/NavMenu';
import SportsDetailPage from './components/SportsDetailPage/SportsDetailPage';
import MarketPage from './components/MarketPage/MarketPage';
import GamesPage from './components/GamesPage/GamesPage';
import './App.css';

function App() {
  const profileRef = useRef(null);
  const TEST_TELEGRAM_ID = '926460821';

  function refetchUserCoins() {
    if (profileRef.current) {
      profileRef.current.refetchUser();
    }
  }

  return (
    <Router>
      <div className='app-container'>
        <div className='app-main'>
          <ProfileInfo ref={profileRef} telegramId={TEST_TELEGRAM_ID} />
          <Routes>
            <Route
              path="/"
              element={<HomePage onBetSuccess={refetchUserCoins} telegramId={TEST_TELEGRAM_ID} />}
            />
            <Route path="/matches" element={<MatchesPage onBetSuccess={refetchUserCoins} telegramId={TEST_TELEGRAM_ID} />} />
            <Route path="/sports/:group" element={<SportsDetailPage telegramId={TEST_TELEGRAM_ID} />} />
            <Route path="/inventory" element={<InventoryPage telegramId={TEST_TELEGRAM_ID} />} />
            <Route path='/games' element={<GamesPage telegramId={TEST_TELEGRAM_ID} />} />
            <Route path="/mybets" element={<BetsPage telegramId={TEST_TELEGRAM_ID} />} />
            <Route path="/card/:cardId" element={<CardDetailPage />} />
            <Route path="/market" element={<MarketPage onPurchase={refetchUserCoins} telegramId={TEST_TELEGRAM_ID} />} />
          </Routes>
          <NavMenu />
        </div>
      </div>
    </Router>
  );
}

export default App;
