import React, { useState } from 'react';
import CardsTab from '../CardsTab/CardsTab';
import ItemsTab from '../ItemsTab/ItemsTab';
import styles from './InventoryPage.module.css';

function InventoryPage({ telegramId }) {
    const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'items'

    return (
        <div className={styles.inventoryPage}>
            <h2 className={styles.title}>Your Inventory</h2>

            <div className={styles.tabs}>
                <button
                    className={`${styles.inventoryButton} ${activeTab === 'cards' ? styles.activeTab : ''
                        }`}
                    onClick={() => setActiveTab('cards')}
                >
                    Cards
                </button>
                <button
                    className={`${styles.inventoryButton} ${activeTab === 'items' ? styles.activeTab : ''
                        }`}
                    onClick={() => setActiveTab('items')}
                >
                    Items
                </button>
            </div>

            <hr />

            {activeTab === 'cards' ? (
                <CardsTab telegramId={telegramId} />
            ) : (
                <ItemsTab telegramId={telegramId} />
            )}
        </div>
    );
}

export default InventoryPage;
