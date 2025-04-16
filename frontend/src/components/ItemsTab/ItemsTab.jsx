// client/src/components/Inventory/ItemsTab.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import styles from './ItemsTab.module.css';

function ItemsTab({ telegramId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [telegramId]);

    if (loading) return <p>Loading items...</p>;
    if (items.length === 0) return <p>You have no items.</p>;

    return (
        <div className={styles.itemsGrid}>
            {items.map((inventoryItem) => (
                <div className={styles.itemContainer} key={inventoryItem.id}>
                    {inventoryItem.Item.metadata?.imageUrl && (
                        <img
                            src={inventoryItem.Item.metadata.imageUrl}
                            alt={inventoryItem.Item.type}
                            className={styles.itemImage}
                        />
                    )}
                    <p className={styles.itemQuantity}>X {inventoryItem.quantity}</p>
                </div>
            ))}
        </div>
    );
}

export default ItemsTab;
