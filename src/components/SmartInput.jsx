import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAutoComplete, useVoiceInput } from '../hooks/useInteractions';
import { fetchData } from '../helpers';

const SmartInput = ({ 
  type = 'text', 
  name, 
  placeholder, 
  value, 
  onChange, 
  enableVoice = false,
  enableAutoComplete = false,
  showQuickAmounts = false,
  ...props 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();
  
  const expenses = fetchData('expenses') || [];
  const { suggestions, getSuggestions } = useAutoComplete(expenses);
  const { isListening, transcript, startListening, setTranscript } = useVoiceInput();
  
  const quickAmounts = [50, 100, 200, 500, 1000, 2000];
  
  useEffect(() => {
    if (transcript && enableVoice) {
      onChange({ target: { name, value: transcript } });
      setTranscript('');
    }
  }, [transcript, enableVoice, onChange, name, setTranscript]);
  
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e);
    
    if (enableAutoComplete && inputValue) {
      const newSuggestions = getSuggestions(inputValue);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const selectSuggestion = (suggestion) => {
    onChange({ target: { name, value: suggestion.name } });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const selectQuickAmount = (amount) => {
    const event = {
      target: {
        name: name,
        value: amount.toString()
      }
    };
    onChange(event);
    if (inputRef.current) {
      inputRef.current.value = amount.toString();
      inputRef.current.focus();
    }
  };
  
  const formatCurrency = (value) => {
    if (type === 'number' && value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
      }
    }
    return value;
  };
  
  return (
    <div className="smart-input">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => enableAutoComplete && setShowSuggestions(getSuggestions(value).length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          {...props}
        />
        
        {enableVoice && (
          <button
            type="button"
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={startListening}
            title="Voice input"
          >
            <MicrophoneIcon width={16} />
          </button>
        )}
        
        {type === 'number' && value && (
          <div className="currency-display">
            {formatCurrency(value)}
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
      
      {showQuickAmounts && type === 'number' && (
        <div className="quick-amounts">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              type="button"
              className="quick-amount"
              onClick={() => selectQuickAmount(amount)}
            >
              ₹
              {amount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartInput;