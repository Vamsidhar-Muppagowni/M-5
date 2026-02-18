import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelection = () => {
  const { switchLanguage } = useLanguage();

  return (
    <div className="p-4 border rounded shadow-sm inline-block">
      <h3 className="font-semibold mb-2">Select Language</h3>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => switchLanguage('en')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">English</button>
        <button onClick={() => switchLanguage('te')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Telugu</button>
        <button onClick={() => switchLanguage('hi')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Hindi</button>
        <button onClick={() => switchLanguage('ta')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Tamil</button>
        <button onClick={() => switchLanguage('kn')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Kannada</button>
        <button onClick={() => switchLanguage('ml')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Malayalam</button>
        <button onClick={() => switchLanguage('mr')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Marathi</button>
      </div>
    </div>
  );
};

export default LanguageSelection;
