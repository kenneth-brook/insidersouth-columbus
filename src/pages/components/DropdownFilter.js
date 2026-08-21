import React from 'react';
import { useDataContext } from '../hooks/DataContext';

const DropdownFilter = ({ typeKey, typeLabel }) => {
  const { typeNames, selectedTypes, setSelectedTypes } = useDataContext();

  const handleChange = (event) => {
    const { options } = event.target;
    const selectedValues = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value, 10));
      }
    }
    setSelectedTypes((prev) => ({
      ...prev,
      [typeKey]: selectedValues,
    }));
  };

  return (
    <div>
      <label htmlFor={typeKey}>{typeLabel}:</label>
      <select id={typeKey} multiple onChange={handleChange}>
        {Object.keys(typeNames[typeKey] || {}).map((id) => (
          <option key={id} value={id}>
            {typeNames[typeKey][id].name} ({typeNames[typeKey][id].count})
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownFilter;
