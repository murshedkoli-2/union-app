const fs = require('fs');
let content = fs.readFileSync('app/admin/certificates/issue/page.tsx', 'utf8');

const isFamilyInline = "selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995'";

// Step 3 section header label
content = content.replace(
  "{language === 'en' ? 'Deceased Person Information' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09a5\u09cd\u09af'}",
  "{language === 'en' ? ((" + isFamilyInline + ") ? 'Head of Family Information' : 'Deceased Person Information') : ((" + isFamilyInline + ") ? '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0 \u09aa\u09cd\u09b0\u09a7\u09be\u09a8\u09c7\u09b0 \u09a4\u09a5\u09cd\u09af' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09a5\u09cd\u09af')}"
);

// Step 3 name label
content = content.replace(
  "{language === 'en' ? 'Deceased Name (English)' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a8\u09be\u09ae (\u0987\u0982\u09b0\u09c7\u099c\u09bf)'}",
  "{language === 'en' ? ((" + isFamilyInline + ") ? 'Head of Family Name (English)' : 'Deceased Name (English)') : ((" + isFamilyInline + ") ? '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0 \u09aa\u09cd\u09b0\u09a7\u09be\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae (\u0987\u0982\u09b0\u09c7\u099c\u09bf)' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a8\u09be\u09ae (\u0987\u0982\u09b0\u09c7\u099c\u09bf)')}"
);

// Step 3 list header label
content = content.replace(
  "{language === 'en' ? (selectedType?.name?.includes('Heirship') ? 'Heir List' : 'Warish List') : (selectedType?.name?.includes('Heirship') ? '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0\u09c0\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be' : '\u0993\u09af\u09bc\u09be\u09b0\u09bf\u09b6 \u09a4\u09be\u09b2\u09bf\u0995\u09be')}",
  "{language === 'en' ? ((" + isFamilyInline + ") ? 'Family Members List' : (selectedType?.name?.includes('Heirship') ? 'Heir List' : 'Warish List')) : ((" + isFamilyInline + ") ? '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0\u09c7\u09b0 \u09b8\u09a6\u09b8\u09cd\u09af\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be' : (selectedType?.name?.includes('Heirship') ? '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0\u09c0\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be' : '\u0993\u09af\u09bc\u09be\u09b0\u09bf\u09b6 \u09a4\u09be\u09b2\u09bf\u0995\u09be'))}"
);

// Step 4 review: "Deceased Information" header
content = content.replace(
  "{language === 'en' ? 'Deceased Information' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09a5\u09cd\u09af'}",
  "{language === 'en' ? ((" + isFamilyInline + ") ? 'Head of Family Information' : 'Deceased Information') : ((" + isFamilyInline + ") ? '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0 \u09aa\u09cd\u09b0\u09a7\u09be\u09a8\u09c7\u09b0 \u09a4\u09a5\u09cd\u09af' : '\u09ae\u09c3\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09a5\u09cd\u09af')}"
);

// Step 4 review: "Heir List" header
content = content.replace(
  "{language === 'en' ? 'Heir List' : '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0\u09c0\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be'}",
  "{language === 'en' ? ((" + isFamilyInline + ") ? 'Family Members List' : 'Heir List') : ((" + isFamilyInline + ") ? '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0\u09c7\u09b0 \u09b8\u09a6\u09b8\u09cd\u09af\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be' : '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0\u09c0\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be')}"
);

fs.writeFileSync('app/admin/certificates/issue/page.tsx', content, 'utf8');
console.log('Labels updated.');
