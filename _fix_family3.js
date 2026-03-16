const fs = require('fs');
let content = fs.readFileSync('components/CertificateDesign.tsx', 'utf8');

// 1. Reduce tc font size and padding for A4 fit (ASCII-only, safe to replace directly)
content = content.replace(
  "const tc: React.CSSProperties = { border: '1px solid #222', padding: '5px 8px', fontSize: '17px' };",
  "const tc: React.CSSProperties = { border: '1px solid #222', padding: '4px 6px', fontSize: '14px' };"
);

// Helper: find the last occurrence of a string before a given index
function lastIndexBefore(haystack, needle, pos) {
  const idx = haystack.lastIndexOf(needle, pos);
  return idx;
}

// 2. Replace EN head-of-family section:
//    Remove the opening <p> + the 2-col info table + "The family members are as follows:" <p>
//    Replace with a single sentence <p>
const enAnchor = 'This is to certify that the under-mentioned person is a permanent resident of this Union Parishad';
const enAnchorIdx = content.indexOf(enAnchor);
if (enAnchorIdx === -1) {
  console.log('WARNING: EN family cert opening sentence not found');
} else {
  const pStart = lastIndexBefore(content, '<p style={{ lineHeight:', enAnchorIdx);
  const endMarker = 'The family members are as follows:';
  const endMarkerIdx = content.indexOf(endMarker, enAnchorIdx);
  if (endMarkerIdx === -1) {
    console.log('WARNING: EN end marker not found');
  } else {
    const closingP = content.indexOf('</p>', endMarkerIdx);
    const blockEnd = closingP + 4;

    const newEnBlock = `<p style={{ lineHeight: '1.7', marginBottom: '12px' }}>\r\n                            This is to certify that <strong style={{ textTransform: 'uppercase' }}>{headNameEn}</strong>, Father/Husband: <strong style={{ textTransform: 'uppercase' }}>{headFatherEn}</strong>, Mother: <strong style={{ textTransform: 'uppercase' }}>{headMotherEn}</strong>, Address: {headAddressEn}, is a permanent resident of this Union Parishad. The members of his/her family are listed below:\r\n                        </p>`;

    content = content.slice(0, pStart) + newEnBlock + content.slice(blockEnd);
    console.log('EN block replaced. New length:', content.length);
  }
}

// 3. Replace BN head-of-family section
// The BN opening paragraph uses: "নিম্নবর্ণিত ব্যক্তি অত্র ইউনিয়ন পরিষদের একজন স্থায়ী বাসিন্দা এবং নিম্নবর্ণিত ব্যক্তিগণ তাঁহার পরিবারের সদস্য"
// Followed by the head-of-family table with comment "পরিবার প্রধানের তথ্য"
// The section ends with the closing </table> of the head-of-family table

// Find anchor using partial ASCII+BN mix - use the JSX comment text
const bnTableComment = '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0 \u09aa\u09cd\u09b0\u09a7\u09be\u09a8\u09c7\u09b0 \u09a4\u09a5\u09cd\u09af';
const bnTableCommentIdx = content.indexOf(bnTableComment);

if (bnTableCommentIdx === -1) {
  console.log('WARNING: BN head-of-family table comment not found');
} else {
  // Find the opening <p> that starts the BN section (before the comment)
  // It contains the text about the Union Parishad resident
  const bnOpeningAnchor = '\u09a8\u09bf\u09ae\u09cd\u09a8\u09ac\u09b0\u09cd\u09a3\u09bf\u09a4 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u0985\u09a4\u09cd\u09b0 \u0987\u0989\u09a8\u09bf\u09af\u09bc\u09a8 \u09aa\u09b0\u09bf\u09b7\u09a6\u09c7\u09b0 \u098f\u0995\u099c\u09a8 \u09b8\u09cd\u09a5\u09be\u09af\u09bc\u09c0 \u09ac\u09be\u09b8\u09bf\u09a8\u09cd\u09a6\u09be \u098f\u09ac\u0982';
  const bnOpeningIdx = content.lastIndexOf(bnOpeningAnchor, bnTableCommentIdx);
  if (bnOpeningIdx === -1) {
    console.log('WARNING: BN opening anchor not found');
  } else {
    const pStart = lastIndexBefore(content, '<p style={{ textAlign:', bnOpeningIdx);

    // The head-of-family table ends after the bnTableCommentIdx
    const tableEnd = content.indexOf('</table>', bnTableCommentIdx);
    const blockEnd = tableEnd + 8;

    const newBnBlock = `<p style={{ textAlign: 'justify', lineHeight: '1.7', marginBottom: '12px' }}>\r\n                        \u098f\u0987 \u09ae\u09b0\u09cd\u09ae\u09c7 \u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09af\u09a8 \u0995\u09b0\u09be \u09af\u09be\u0987\u09a4\u09c7\u099b\u09c7 \u09af\u09c7, <strong>{headNameBn}</strong>, \u09aa\u09bf\u09a4\u09be/\u09b8\u09cd\u09ac\u09be\u09ae\u09c0: <strong>{headFatherBn}</strong>, \u09ae\u09be\u09a4\u09be: <strong>{headMotherBn}</strong>, \u09a0\u09bf\u0995\u09be\u09a8\u09be: {headAddressBn}, \u0985\u09a4\u09cd\u09b0 \u0987\u0989\u09a8\u09bf\u09af\u09bc\u09a8 \u09aa\u09b0\u09bf\u09b7\u09a6\u09c7\u09b0 \u098f\u0995\u099c\u09a8 \u09b8\u09cd\u09a5\u09be\u09af\u09bc\u09c0 \u09ac\u09be\u09b8\u09bf\u09a8\u09cd\u09a6\u09be\u0964 \u09a4\u09be\u0981\u09b9\u09be\u09b0 \u09aa\u09b0\u09bf\u09ac\u09be\u09b0\u09c7\u09b0 \u09b8\u09a6\u09b8\u09cd\u09af\u0997\u09a3\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be \u09a8\u09bf\u09ae\u09cd\u09a8\u09b0\u09c2\u09aa:\r\n                    </p>`;

    content = content.slice(0, pStart) + newBnBlock + content.slice(blockEnd);
    console.log('BN block replaced. New length:', content.length);
  }
}

fs.writeFileSync('components/CertificateDesign.tsx', content, 'utf8');
console.log('Done.');
