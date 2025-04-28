// client/src/components/Marketplace/MarketplacePage.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import styles from './MarketPage.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MarketPage({ telegramId, onPurchase }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchaseStatus, setPurchaseStatus] = useState(null);

    console.log('telegramId in MarketplacePage:', telegramId);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/marketplace/items`)
            .then((res) => res.json())
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching marketplace items:", err);
                setLoading(false);
            });
    }, []);

    function handlePurchase(itemId) {
        // Reset any previous status
        setPurchaseStatus(null);
        fetch(`${API_BASE_URL}/api/marketplace/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId: telegramId,
                itemId: itemId,
                quantity: 1,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setPurchaseStatus(`Error: ${data.error}`);
                } else {
                    setPurchaseStatus("Purchase successful!");
                    toast.success("Purchase successful!");
                    if (onPurchase) onPurchase();
                }
            })
            .catch((err) => {
                console.error("Error purchasing item:", err);
                setPurchaseStatus("Error processing purchase.");
                toast.error("Error processing purchase.");
            });
    }

    return (
        <div className={styles.marketplacePage}>
            <h2 className={styles.title}>Marketplace</h2>
            <div className={styles.itemFilterContainer}>
                <div className={styles.itemFilter}>All Items</div>
                <div className={styles.itemFilter}>Mystery Boxes</div>
                <div className={styles.itemFilter}>Consumables</div>
            </div>
            {loading ? (
                <p>Loading items...</p>
            ) : items.length === 0 ? (
                <p>No items available in the marketplace.</p>
            ) : (
                <div className={styles.itemList}>
                    {items.map((item) => (
                        <div className={styles.itemContainer} key={item.id}>
                            <div className={styles.itemTopContainer}>
                                <h3>{item.type}</h3>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <mask id="mask0_408_634" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                                        <path d="M31.0148 0H0V31.1037H31.0148V0Z" fill="white" />
                                    </mask>
                                    <g mask="url(#mask0_408_634)">
                                        <mask id="mask1_408_634" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                                            <path d="M31.0148 0H0V31.1037H31.0148V0Z" fill="white" />
                                        </mask>
                                        <g mask="url(#mask1_408_634)">
                                            <g opacity="0.3">
                                                <mask id="mask2_408_634" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="-6" y="-5" width="43" height="37">
                                                    <path d="M36.5074 -4.28418H-5.49258V31.7158H36.5074V-4.28418Z" fill="white" />
                                                </mask>
                                                <g mask="url(#mask2_408_634)">
                                                    <path d="M17.9669 22.4923C16.1238 22.5597 14.3845 22.7188 12.755 22.982C13.1639 22.5413 13.5057 21.5682 13.7803 20.0626C14.0061 18.8385 14.1221 17.7797 14.1221 16.8983C14.1221 15.509 13.9451 14.5175 13.585 13.93C13.5057 13.9973 13.1761 14.3829 12.6085 15.0806C12.3461 14.9643 12.0227 14.6889 11.6321 14.2482C12.1874 13.477 12.7733 13.0241 13.3958 12.8773C13.4263 12.8773 13.4568 12.8467 13.4813 12.7793C13.5057 12.712 13.5667 12.6814 13.6643 12.6814C16.2214 12.6814 17.3871 12.6875 17.1613 12.7059C16.8684 14.1625 16.7219 15.8395 16.7219 17.7307C16.7219 19.1017 16.8378 20.4971 17.0636 21.8987C17.5397 21.9721 17.8387 22.168 17.9669 22.4923ZM16.2825 8.46447C16.3496 8.54403 16.4534 8.58075 16.5998 8.56239C16.5022 8.85617 16.2764 9.2846 15.9163 9.83543C15.5562 10.3924 15.3304 10.833 15.2328 11.1574C14.9398 11.0779 14.5859 10.7718 14.1831 10.2516C13.7742 9.73138 13.5728 9.32132 13.5728 9.02754C13.5728 8.66644 13.8657 8.27474 14.4516 7.85243C14.8727 7.54029 15.306 7.22203 15.7454 6.89765H16.2581C16.2581 7.01394 16.2764 7.19143 16.3191 7.43625C16.3618 7.68106 16.3801 7.87079 16.3801 7.99932C16.3801 8.19517 16.3496 8.34818 16.2825 8.46447ZM31.0148 15.5519C31.0148 6.96498 24.0697 0 15.5074 0C6.94507 0 0 6.96498 0 15.5519C0 24.1387 6.94507 31.1037 15.5074 31.1037C24.0697 31.1037 31.0148 24.1387 31.0148 15.5519Z" fill="white" />
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            {item.metadata?.description && <p>{item.metadata.description}</p>}
                            <img className={styles.itemImage} src={item.metadata?.imageUrl} alt={`item` + item.metadata?.imageUrl} />
                            <button onClick={() => handlePurchase(item.id)}>Buy for {item.metadata?.price ?? 'N/A'}</button>
                        </div>
                    ))}
                </div>
            )}
            {purchaseStatus && <p>{purchaseStatus}</p>}
        </div>
    );
}

export default MarketPage;
