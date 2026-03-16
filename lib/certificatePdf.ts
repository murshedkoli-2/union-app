import jsPDF from 'jspdf';
import { SettingsData } from '@/types';

type PdfLang = 'bn' | 'en';

interface CertificatePdfData {
    _id?: string;
    certificateNumber: string;
    type: string;
    issueDate: string;
    details?: Record<string, unknown>;
    citizenId: {
        name?: string;
        nameBn?: string;
        nid?: string;
        fatherName?: string;
        fatherNameBn?: string;
        motherName?: string;
        motherNameBn?: string;
        address?: {
            village?: string;
            postOffice?: string;
            union?: string;
            upazila?: string;
            district?: string;
        } | string;
    };
}

let banglaFontLoaded = false;

function toBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

async function loadBanglaFont(doc: jsPDF) {
    if (banglaFontLoaded) {
        doc.setFont('NotoSansBengali', 'normal');
        return;
    }

    const res = await fetch('/fonts/bengali/NotoSansBengali-Regular.ttf');
    if (!res.ok) throw new Error('Font load failed');

    const base64 = toBase64(await res.arrayBuffer());
    doc.addFileToVFS('NotoSansBengali-Regular.ttf', base64);
    doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
    doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'bold');
    doc.setFont('NotoSansBengali', 'normal');
    banglaFontLoaded = true;
}

function certTitle(type: string, lang: PdfLang) {
    if (lang === 'en') {
        if (type === 'Citizenship' || type === 'নাগরিকত্ব সনদ') return 'Citizenship Certificate';
        if (type === 'Character' || type === 'চারিত্রিক সনদ') return 'Character Certificate';
        if (type === 'Trade License' || type === 'ট্রেড লাইসেন্স') return 'Trade License Certificate';
        if (type === 'Warish' || type === 'ওয়ারিশ সনদ') return 'Warish Certificate';
        if (type === 'Heirship' || type === 'উত্তরাধিকার সনদ') return 'Heirship Certificate';
        if (type === 'Landless' || type === 'ভূমিহীন সনদ' || type === 'ভূমিহীন') return 'Landless Certificate';
        if (type === 'Disability' || type === 'প্রতিবন্ধী সনদ' || type === 'প্রতিবন্ধী' || type.includes('Disability') || type.includes('প্রতিবন্ধী')) return 'Disability Certificate';
        return `${type} Certificate`;
    }
    if (type === 'Citizenship' || type === 'নাগরিকত্ব সনদ') return 'নাগরিকত্ব সনদ';
    if (type === 'Character' || type === 'চারিত্রিক সনদ') return 'চারিত্রিক সনদ';
    if (type === 'Trade License' || type === 'ট্রেড লাইসেন্স') return 'ট্রেড লাইসেন্স সনদ';
    if (type === 'Warish' || type === 'ওয়ারিশ সনদ') return 'ওয়ারিশ সনদ';
    if (type === 'Heirship' || type === 'উত্তরাধিকার সনদ') return 'উত্তরাধিকার সনদ';
    if (type === 'Landless' || type === 'ভূমিহীন সনদ') return 'ভূমিহীন সনদ';
    if (type === 'Disability' || type === 'প্রতিবন্ধী সনদ' || type === 'প্রতিবন্ধী' || type.includes('Disability') || type.includes('প্রতিবন্ধী')) return 'প্রতিবন্ধী সনদ';
    return `${type} সনদ`;
}

export async function downloadCertificatePdf(certificate: CertificatePdfData, settings: SettingsData | null, lang: PdfLang) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    if (lang === 'bn') {
        try {
            await loadBanglaFont(doc);
        } catch {
            doc.setFont('helvetica', 'normal');
        }
    } else {
        doc.setFont('times', 'normal');
    }

    const unionName = lang === 'en' ? (settings?.unionNameEn || 'Union Parishad') : (settings?.unionNameBn || 'ইউনিয়ন পরিষদ');
    const unionAddress = lang === 'en' ? (settings?.unionAddressEn || '') : (settings?.unionAddressBn || '');

    let y = 22;
    doc.setFontSize(19);
    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'bold');
    doc.text(unionName, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'normal');
    doc.setFontSize(11);
    doc.text(unionAddress, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-GB');
    const memoLabel = lang === 'en' ? 'Memo No' : 'স্মারক নং';
    const dateLabel = lang === 'en' ? 'Date' : 'তারিখ';

    doc.setFontSize(11);
    doc.text(`${memoLabel}: ${certificate.certificateNumber}`, margin, y);
    doc.text(`${dateLabel}: ${issueDate}`, pageWidth - margin, y, { align: 'right' });
    y += 10;

    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'bold');
    doc.setFontSize(16);
    // Title should be type and name
    const citizen = certificate.citizenId || {};
    const name = lang === 'en' ? (citizen.name || '') : (citizen.nameBn || citizen.name || '');
    doc.text(`${certTitle(certificate.type, lang)} - ${name}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    const father = lang === 'en' ? (citizen.fatherName || '') : (citizen.fatherNameBn || citizen.fatherName || '');
    const mother = lang === 'en' ? (citizen.motherName || '') : (citizen.motherNameBn || citizen.motherName || '');

    let addressText = '';
    if (typeof citizen.address === 'string') {
        addressText = citizen.address;
    } else if (citizen.address) {
        addressText = [citizen.address.village, citizen.address.postOffice, citizen.address.union, citizen.address.upazila, citizen.address.district]
            .filter(Boolean)
            .join(', ');
    }

    const isLandless = certificate.type === 'Landless' || certificate.type === 'Landless Certificate' || certificate.type === 'ভূমিহীন সনদ' || certificate.type.includes('Landless') || certificate.type.includes('ভূমিহীন');

    let defaultBodyEn = 'He/She is a permanent resident of this union parishad.';
    let defaultBodyBn = 'তিনি অত্র ইউনিয়ন পরিষদের স্থায়ী বাসিন্দা।';

    const isDisability = certificate.type === 'Disability' || certificate.type === 'Disability Certificate' || certificate.type.includes('Disability') || certificate.type.includes('প্রতিবন্ধী');

    const customBodyEn = String(certificate.details?.bodyTextEn || '').trim();
    const customBodyBn = String(certificate.details?.bodyTextBn || '').trim();

    if (isDisability) {
        const rawDisabilityType = String(certificate.details?.disabilityType || '');
        const rawDisabilityTypeBn = String(certificate.details?.disabilityTypeBn || rawDisabilityType);
        const extractEnglish = (val: string) => val.includes('(') ? val.replace(/.*\((.+)\)/, '$1') : val;
        const extractBangla = (val: string) => val.includes('(') ? val.replace(/\s*\(.+\)/, '') : val;
        const disabilityType = extractEnglish(rawDisabilityType);
        const disabilityTypeBn = rawDisabilityTypeBn ? extractBangla(rawDisabilityTypeBn) : extractBangla(rawDisabilityType);
        defaultBodyEn = 'Type of Disability: ' + disabilityType + '. ' + (customBodyEn || 'After due inquiry it has been ascertained that the above-named person is a person with disability. This certificate is issued upon request for lawful purposes.');
        defaultBodyBn = 'প্রতিবন্ধিতার ধরন: ' + disabilityTypeBn + '। ' + (customBodyBn || 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি একজন প্রতিবন্ধী ব্যক্তি। আবেদনক্রমে তাঁহার প্রতিবন্ধী সনদ প্রদান করা হইল।');
    } else if (isLandless) {
        defaultBodyEn = customBodyEn || 'After due inquiry it has been ascertained that the above-named person does not own any agricultural or non-agricultural land within this Union or elsewhere. The person is genuinely landless and earns a livelihood through daily labor/small trade. This certificate is issued upon request for lawful purposes.';
        defaultBodyBn = customBodyBn || 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন বা অন্য কোথাও কোনো কৃষি বা অকৃষি জমির মালিক নহেন। তিনি একজন প্রকৃত ভূমিহীন ব্যক্তি এবং দিনমজুরি/ক্ষুদ্র ব্যবসার মাধ্যমে জীবিকা নির্বাহ করেন। আবেদনক্রমে তাহার ভূমিহীন সনদ প্রদান করা হইল।';
    }

    const body = lang === 'en'
        ? `This is to certify that ${name}, Father/Husband: ${father}, Mother: ${mother}, NID: ${citizen.nid || ''}, Address: ${addressText}. ${(isDisability || isLandless) ? defaultBodyEn : (customBodyEn || defaultBodyEn)}`
        : `এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, ${name}, পিতা/স্বামী: ${father}, মাতা: ${mother}, এনআইডি: ${citizen.nid || ''}, ঠিকানা: ${addressText}। ${(isDisability || isLandless) ? defaultBodyBn : (customBodyBn || defaultBodyBn)}`;

    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'normal');
    doc.setFontSize(12);
    const wrapped = doc.splitTextToSize(body, contentWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 6 + 16;

    doc.setFontSize(10);
    const verifyLabel = lang === 'en' ? 'Verify' : 'যাচাই';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    doc.text(`${verifyLabel}: ${origin}/verify/${certificate.certificateNumber}`, margin, 278);

    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'bold');
    doc.setFontSize(11);
    const chairmanLine1 = lang === 'en' ? 'Chairman' : 'চেয়ারম্যান';
    const chairmanLine2 = lang === 'en' ? (settings?.chairmanNameEn || '') : (settings?.chairmanNameBn || '');
    doc.text(chairmanLine1, pageWidth - margin, 265, { align: 'right' });
    doc.setFont(lang === 'bn' ? 'NotoSansBengali' : 'times', 'normal');
    doc.text(chairmanLine2, pageWidth - margin, 271, { align: 'right' });

    const safeCertNum = (certificate.certificateNumber || 'certificate').replace(/[^a-zA-Z0-9-_]/g, '_');
    const suffix = lang === 'en' ? 'English' : 'Bangla';
    doc.save(`Certificate_${safeCertNum}_${suffix}.pdf`);
}
