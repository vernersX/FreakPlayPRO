// client/src/components/CustomSelect/CustomSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

function CustomSelect({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const selectRef = useRef(null);

    // Close dropdown when clicking outside.
    useEffect(() => {
        function handleClickOutside(event) {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                if (isOpen) {
                    handleClose();
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Open the dropdown.
    const handleOpen = () => {
        setIsOpen(true);
        setIsClosing(false);
    };

    // Trigger the closing animation and then close the dropdown.
    const handleClose = () => {
        setIsClosing(true);
        // This timeout should match the fade-out animation duration (here: 300ms).
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const toggleDropdown = () => {
        if (isOpen) {
            handleClose();
        } else {
            handleOpen();
        }
    };

    function handleOptionClick(optionValue) {
        onChange(optionValue);
        handleClose();
    }

    return (
        <div className={styles.customSelect} ref={selectRef}>
            <div
                className={styles.selected}
                tabIndex="0"  // Make it focusable.
                onClick={toggleDropdown}
            >
                {options.find(opt => opt.value === value)?.label || "All Leagues"}
                <span className={styles.arrow}>&#9660;</span>
            </div>
            {(isOpen || isClosing) && (
                <ul
                    className={`${styles.options} ${isClosing ? styles.optionsClose : styles.optionsOpen}`}
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={styles.option}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CustomSelect;
