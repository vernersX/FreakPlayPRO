// client/src/components/Inventory/ItemsTab.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import styles from './ItemsTab.module.css';
import UseItemModal from '../UseItemModal/UseItemModal';   // NEW

function ItemsTab({ telegramId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeInventoryItem, setActiveInventoryItem] = useState(null); // NEW

    /** re‑fetch user items (used after a successful “use item”) */
    const loadItems = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/inventory/items?telegramId=${telegramId}`)
            .then(res => res.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user items:', err);
                setLoading(false);
            });
    };

    useEffect(loadItems, [telegramId]);

    if (loading) return <p>Loading items...</p>;
    if (items.length === 0) return <p>You have no items.</p>;

    return (
        <>
            <div className={styles.itemsGrid}>
                {items.map(inv => (
                    <div
                        className={styles.itemContainer}
                        key={inv.id}
                        onClick={() => setActiveInventoryItem(inv)}     // NEW
                    >
                        {inv.Item.metadata?.imageUrl && (
                            <img
                                src={inv.Item.metadata.imageUrl}
                                alt={inv.Item.type}
                                className={styles.itemImage}
                            />
                        )}
                        <p className={styles.itemQuantity}>x {inv.quantity}</p>
                    </div>
                ))}
            </div>

            {activeInventoryItem && (
                <UseItemModal
                    telegramId={telegramId}
                    inventoryItem={activeInventoryItem}
                    onClose={() => setActiveInventoryItem(null)}
                    onUsed={() => {
                        setActiveInventoryItem(null);
                        loadItems();           // refresh quantities
                    }}
                />
            )}
        </>
    );
}

export default ItemsTab;
