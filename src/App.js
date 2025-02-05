import React, { useState } from 'react';

const SchemaGenerator = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const parseSheetData = (data) => {
    const defaultData = {
      name: {
        en: 'Cool&Simple Atwater Market',
        fr: 'Magasin Cool&simple Atwater'
      },
      description: {
        en: 'Your frozen gourmet grocery store at Atwater Market in Montreal, offering high-quality, ready-to-use, frozen products and dishes.',
        fr: 'Votre épicerie de produits surgelés gourmets au Marché Atwater à Montréal.'
      },
      url: {
        en: 'https://cool-simple.com/en/pages/store-marche-atwater',
        fr: 'https://cool-simple.com/pages/store-marche-atwater'
      },
      telephone: {
        en: '+1-514-419-3739',
        fr: '+1-514-419-3740'
      },
      streetAddress: {
        en: '131 avenue Atwater (corner St-Ambroise)',
        fr: '131 avenue Atwater (coin St-Ambroise)'
      },
      addressLocality: {
        en: 'Montreal',
        fr: 'Montreal'
      },
      addressRegion: {
        en: 'QC',
        fr: 'QC'
      },
      postalCode: {
        en: 'H3J 2Z8',
        fr: 'H3J 2Z8'
      },
      addressCountry: {
        en: 'CA',
        fr: 'CA'
      },
      latitude: {
        en: '45.484781',
        fr: '45.484781'
      },
      longitude: {
        en: '-73.582882',
        fr: '-73.582882'
      },
      'openingHours_Mo-Fr': {
        en: '10:00-19:00',
        fr: '10:00-19:00'
      },
      'openingHours_Sa': {
        en: '09:30-18:00',
        fr: '09:30-18:00'
      },
      'openingHours_Su': {
        en: '09:30-18:00',
        fr: '09:30-18:00'
      }
    };

    if (!data.trim()) {
      return defaultData;
    }

    try {
      const parsed = { ...defaultData };
      
      // Extract name
      const nameMatch = data.match(/name(.*?)description/s);
      if (nameMatch) {
        const [enName, frName] = nameMatch[1].split(/(?=Magasin)/);
        parsed.name = {
          en: enName.trim(),
          fr: frName ? frName.trim() : ''
        };
      }

      // Extract description
      const descMatch = data.match(/description(.*?)url/s);
      if (descMatch) {
        const [enDesc, frDesc] = descMatch[1].split(/(?=Votre)/);
        parsed.description = {
          en: enDesc.trim(),
          fr: frDesc ? frDesc.trim() : ''
        };
      }

      // Extract URL
      const urlMatch = data.match(/url(.*?)image/s);
      if (urlMatch) {
        const urls = urlMatch[1].match(/https:\/\/[^\s]+/g) || [];
        parsed.url = {
          en: urls[0] || '',
          fr: urls[1] || ''
        };
      }

      return parsed;

    } catch (err) {
      console.error('Parsing error:', err);
      return defaultData;
    }
  };

  const createStoreObject = (fields, isEnglish) => {
    const lang = isEnglish ? 'en' : 'fr';
    
    return {
      "@context": "http://schema.org",
      "@type": "Store",
      "name": fields.name[lang],
      "description": fields.description[lang],
      "url": fields.url[lang],
      "image": "https://cool-simple.com/cdn/shop/files/C_S_logo.png?v=1723622101&width=380",
      "telephone": fields.telephone[lang],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": fields.streetAddress[lang],
        "addressLocality": fields.addressLocality[lang],
        "addressRegion": fields.addressRegion[lang],
        "postalCode": fields.postalCode[lang],
        "addressCountry": fields.addressCountry[lang]
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": parseFloat(fields.latitude[lang]),
        "longitude": parseFloat(fields.longitude[lang])
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": fields['openingHours_Mo-Fr'][lang].split('-')[0],
          "closes": fields['openingHours_Mo-Fr'][lang].split('-')[1]
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday", "Saturday"],
          "opens": fields['openingHours_Sa'][lang].split('-')[0],
          "closes": fields['openingHours_Sa'][lang].split('-')[1]
        }
      ],
      "sameAs": [
        "https://www.facebook.com/cooletsimple/",
        "https://www.instagram.com/cooletsimple/",
        "https://www.tiktok.com/@cooletsimple"
      ]
    };
  };

  const generate = () => {
    try {
      const fields = parseSheetData(input);
      const enStore = createStoreObject(fields, true);
      const frStore = createStoreObject(fields, false);
      
      const template = `{% if request.locale.iso_code == 'en' %}
<script type="application/ld+json">
${JSON.stringify(enStore, null, 2)}
</script>
{% else %}
<script type="application/ld+json">
${JSON.stringify(frStore, null, 2)}
</script>
{% endif %}`;

      setOutput(template);
      setError('');
    } catch (err) {
      setError('Error generating schema: ' + err.message);
    }
  };

  const copyToClipboard = () => {
    if (output) {
      try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = output;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        // Execute copy command
        document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(textarea);
        alert('Copied to clipboard!');
      } catch (err) {
        setError('Failed to copy: ' + err.message);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Paste your sheet data (or leave empty for default values):
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-2 border rounded font-mono text-sm"
          placeholder="Paste your Google Sheets data here..."
        />
      </div>

      <div className="space-x-4 mb-4">
        <button
          onClick={generate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Schema
        </button>
        {output && (
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Copy to Clipboard
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {output && (
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap font-mono text-sm">
          {output}
        </pre>
      )}
    </div>
  );
};

export default SchemaGenerator;