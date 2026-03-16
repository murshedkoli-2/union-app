const fs = require('fs');
let content = fs.readFileSync('app/admin/certificates/issue/page.tsx', 'utf8');

const isFamilyCheck = "selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995'";

// 1. handleSubmit: add isFamilyCert variable
content = content.replace(
  "const isWarish = selectedType.name === 'Warish Certificate' || selectedType.name === 'Succession Certificate' || selectedType.name === 'Warish' || selectedType.nameBn === '\u0993\u09af\u09bc\u09be\u09b0\u09bf\u09b6 \u09b8\u09a8\u09a6' || selectedType.name === 'Heirship' || selectedType.name === 'Heirship Certificate' || selectedType.nameBn === '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0 \u09b8\u09a8\u09a6';\n            const isDisability",
  "const isWarish = selectedType.name === 'Warish Certificate' || selectedType.name === 'Succession Certificate' || selectedType.name === 'Warish' || selectedType.nameBn === '\u0993\u09af\u09bc\u09be\u09b0\u09bf\u09b6 \u09b8\u09a8\u09a6' || selectedType.name === 'Heirship' || selectedType.name === 'Heirship Certificate' || selectedType.nameBn === '\u0989\u09a4\u09cd\u09a4\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0 \u09b8\u09a8\u09a6';\n            const isFamilyCert = selectedType.name === 'Family' || selectedType.name === 'Family Certificate' || selectedType.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995';\n            const isDisability"
);

// 2. handleSubmit payload: add isFamilyCert to warish spread
content = content.replace(
  "...(isWarish ? {",
  "...(isWarish || isFamilyCert ? {"
);

// 3-7. Replace all isWarishStep definitions to include Family
let fixedCount = 0;
content = content.replace(
  /const isWarishStep = selectedType\?\.name\?\.includes\('Warish'\) \|\| selectedType\?\.name\?\.includes\('Succession'\) \|\| selectedType\?\.name\?\.includes\('Heirship'\);/g,
  () => {
    fixedCount++;
    return "const isWarishStep = selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995';";
  }
);

// 4. Step 3 warish section conditional
content = content.replace(
  "{(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship')) && (",
  "{(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995') && ("
);

// 5. Step 4 review warish section conditional
content = content.replace(
  "{(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship')) && (\n                                <div className=\"space-y-4\">",
  "{(selectedType?.name?.includes('Warish') || selectedType?.name?.includes('Succession') || selectedType?.name?.includes('Heirship') || selectedType?.name === 'Family' || selectedType?.name === 'Family Certificate' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995 \u09b8\u09a8\u09a6' || selectedType?.nameBn === '\u09aa\u09be\u09b0\u09bf\u09ac\u09be\u09b0\u09bf\u0995') && (\n                                <div className=\"space-y-4\">"
);

fs.writeFileSync('app/admin/certificates/issue/page.tsx', content, 'utf8');
console.log('Done. isWarishStep occurrences updated:', fixedCount);
