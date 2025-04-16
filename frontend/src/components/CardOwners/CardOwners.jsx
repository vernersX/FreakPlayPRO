// client/src/components/CardDetail/CardOwners.jsx
import React from 'react';
import styles from './CardOwners.module.css';

function CardOwners({ ownershipHistory }) {
    if (!ownershipHistory || ownershipHistory.length === 0) {
        return <p>No ownership history available.</p>;
    }
    return (
        <div className={styles.owners}>
            {ownershipHistory.map((record, index) => (
                <div key={index} className={styles.ownerRecord}>
                    <p>
                        <strong>From:</strong>{' '}
                        {record.fromUser ? record.fromUser.username : 'N/A'}{' '}
                        <strong>To:</strong> {record.toUser.username}
                    </p>
                    <p>
                        <strong>Date:</strong> {new Date(record.transferredAt).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default CardOwners;
