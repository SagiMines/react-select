import { useEffect, useRef, useState } from 'react';
import styles from './styles/select.module.css';

export type SelectOption = {
  label: string;
  value: string | number;
};

type MultipleSelectProps = {
  multiple: true;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
};

type SingleSelectProps = {
  multiple?: false;
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
};

type SelectProps = {
  options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

export function Select({ multiple, value, onChange, options }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const clearOptions = () => {
    multiple ? onChange([]) : onChange(undefined);
  };

  const selectOption = (option: SelectOption) => {
    if (multiple) {
      if (value.includes(option)) {
        onChange(value.filter(o => o !== option));
      } else {
        onChange([...value, option]);
      }
    } else if (option !== value) {
      onChange(option);
    }
  };

  const isOptionSelected = (option: SelectOption) => {
    return multiple ? value.includes(option) : option === value;
  };

  const isOptionHighlighted = (index: number) => {
    return highlightedIndex === index;
  };

  const keyboardHandler = (e: KeyboardEvent) => {
    if (e.target !== containerRef.current) return;

    switch (e.code) {
      case 'Enter':
      case 'Space':
        setIsOpen(prev => !prev);
        if (isOpen) selectOption(options[highlightedIndex]);
        break;
      case 'ArrowUp':
      case 'ArrowDown': {
        if (!isOpen) {
          setIsOpen(true);
          break;
        }
        const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1);
        if (newValue >= 0 && newValue < options.length) {
          setHighlightedIndex(newValue);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen) setHighlightedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    containerRef.current?.addEventListener('keydown', keyboardHandler);

    return () => {
      containerRef.current?.removeEventListener('keydown', keyboardHandler);
    };
  }, [isOpen, highlightedIndex, options]);

  return (
    <div
      ref={containerRef}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
      tabIndex={0}
      className={styles.container}
    >
      <span className={styles.value}>
        {multiple
          ? value.map((v, index) => (
              <button
                key={index}
                onClick={e => {
                  e.stopPropagation();
                  selectOption(v);
                }}
                className={styles['option-badge']}
              >
                {v.label} <span className={styles['remove-btn']}>&times;</span>
              </button>
            ))
          : value?.label}
      </span>
      <button
        className={styles['clear-btn']}
        onClick={e => {
          e.stopPropagation();
          clearOptions();
        }}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen && styles.show}`}>
        {options.map((option, index) => (
          <li
            key={index}
            className={`${styles.option} ${
              isOptionSelected(option) && styles.selected
            } ${isOptionHighlighted(index) && styles.highlighted}`}
            onClick={e => {
              e.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
