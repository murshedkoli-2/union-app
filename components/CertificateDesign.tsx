import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { VILLAGES, POST_OFFICES } from '@/lib/constants';
import { SettingsData } from '@/types';

interface WarishHeir {
    nameEn?: string;
    nameBn?: string;
    relation?: string;
    nid?: string;
}

interface CertificateProps {
    certificate: {
        certificateNumber: string;
        type: string;
        issueDate: string;
        details?: Record<string, unknown>;
        citizenId: {
            name: string;
            nameBn: string;
            nid: string;
            fatherName: string;
            fatherNameBn: string;
            motherName: string;
            motherNameBn: string;
            address: {
                village: string;
                postOffice: string;
                union: string;
                upazila: string;
                district: string;
            } | string;
            presentAddress?: {
                village?: string;
                villageBn?: string;
                postOffice?: string;
                postOfficeBn?: string;
                ward?: string;
                union?: string;
                unionBn?: string;
                upazila?: string;
                upazilaBn?: string;
                district?: string;
                districtBn?: string;
            };
            permanentAddress?: {
                village?: string;
                villageBn?: string;
                postOffice?: string;
                postOfficeBn?: string;
                ward?: string;
                union?: string;
                unionBn?: string;
                upazila?: string;
                upazilaBn?: string;
                district?: string;
                districtBn?: string;
            };
            dateOfBirth?: string;
        };
    };
    settings?: SettingsData;
    language?: 'bn' | 'en';
}

export default function CertificateDesign({ certificate, settings, language = 'bn' }: CertificateProps) {
        // Set page title to citizen name and certificate type
        // Helper to get English type
        const getTypeEn = (type: string) => {
            const toEn: Record<string, string> = {
                'নাগরিকত্ব': 'Citizenship',
                'নাগরিকত্ব সনদ': 'Citizenship Certificate',
                'চারিত্রিক': 'Character',
                'চারিত্রিক সনদ': 'Character Certificate',
                'ট্রেড লাইসেন্স': 'Trade License',
                'ওয়ারিশ': 'Warish',
                'ওয়ারিশ সনদ': 'Warish Certificate',
                'উত্তরাধিকার': 'Heirship',
                'উত্তরাধিকার সনদ': 'Heirship Certificate',
                'পারিবারিক': 'Family',
                'পারিবারিক সনদ': 'Family Certificate',
                'ভূমিহীন': 'Landless',
                'ভূমিহীন সনদ': 'Landless Certificate',
                'বিবিধ': 'Miscellaneous',
                'প্রতিবন্ধী': 'Disability',
                'প্রতিবন্ধী সনদ': 'Disability Certificate',
            };
            return toEn[type] || type;
        };

        React.useEffect(() => {
            const citizenName = language === 'en' ? (certificate.citizenId.name || '') : (certificate.citizenId.nameBn || certificate.citizenId.name || '');
            const typeEn = getTypeEn(certificate.type);
            document.title = `${citizenName} - ${typeEn}`;
        }, [certificate.citizenId.name, certificate.citizenId.nameBn, certificate.type, language]);
    const { citizenId: citizen } = certificate;
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;

    const getDetailString = (key: string) => {
        const value = certificate.details?.[key];
        return typeof value === 'string' ? value : '';
    };

    const getDetailArray = (key: string): WarishHeir[] => {
        const value = certificate.details?.[key];
        if (!Array.isArray(value)) return [];
        return value as WarishHeir[];
    };

    const toEnglishPlace = (value: string, list: Array<{ en: string; bn: string }>) => {
        const match = list.find((item) => item.bn === value || item.en === value);
        return match?.en || value;
    };

    const toBanglaPlace = (value: string, list: Array<{ en: string; bn: string }>) => {
        const match = list.find((item) => item.en === value || item.bn === value);
        return match?.bn || value;
    };

    // Convert text to title case (e.g. "MOHAMMED ALI" → "Mohammed Ali")
    const toTitleCase = (text: string) =>
        text.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    // Convert text to sentence case (e.g. "Grocery Shop" → "Grocery shop")
    const toSentenceCase = (text: string) =>
        text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    // Default values if settings are missing
    const unionName = language === 'en'
        ? (settings?.unionNameEn || '1 No. Noagaon Union Parishad')
        : (settings?.unionNameBn || '১নং নোয়াগাঁও ইউনিয়ন পরিষদ');

    const unionAddress = language === 'en'
        ? (settings?.unionAddressEn || 'Upazila: Sarail, District: Brahmanbaria.')
        : (settings?.unionAddressBn || 'উপজেলা: সরাইল, জেলা: ব্রাহ্মণবাড়িয়া।');

    const upazila = language === 'en' ? 'Sarail' : 'সরাইল';
    const district = language === 'en' ? 'Brahmanbaria' : 'ব্রাহ্মণবাড়িয়া';

    // Helper to format date
    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getTitle = () => {
        if (language === 'en') {
            switch (certificate.type) {
                // English Inputs
                case 'Citizenship': return 'Citizenship Certificate';
                case 'Character': return 'Character Certificate';
                case 'Trade License': return 'Trade License';
                case 'Warish': return 'Warish Certificate';
                case 'উত্তরাধিকার': return 'Heirship Certificate';
                case 'উত্তরাধিকার সনদ': return 'Heirship Certificate';
                case 'Heirship': return 'Heirship Certificate';
                case 'Family': return 'Family Certificate';
                case 'Family Certificate': return 'Family Certificate';
                case 'Landless': return 'Landless Certificate';
                case 'Disability': return 'Disability Certificate';
                case 'প্রতিবন্ধী': return 'Disability Certificate';
                case 'প্রতিবন্ধী সনদ': return 'Disability Certificate';

                // Bangla Inputs (Mapping to English)
                case 'নাগরিকত্ব': return 'Citizenship Certificate';
                case 'নাগরিকত্ব সনদ': return 'Citizenship Certificate';
                case 'চারিত্রিক': return 'Character Certificate';
                case 'চারিত্রিক সনদ': return 'Character Certificate';
                case 'ট্রেড লাইসেন্স': return 'Trade License';
                case 'ওয়ারিশ': return 'Warish Certificate';
                case 'ওয়ারিশ সনদ': return 'Warish Certificate';
                case 'পারিবারিক': return 'Family Certificate';
                case 'পারিবারিক সনদ': return 'Family Certificate';
                case 'ভূমিহীন': return 'Landless Certificate';
                case 'ভূমিহীন সনদ': return 'Landless Certificate';
                case 'বিবিধ': return 'Miscellaneous Certificate';

                default: return certificate.type;
            }
        }
        // Bangla Mapping
        switch (certificate.type) {
            case 'Citizenship': return 'নাগরিকত্ব সনদ';
            case 'Character': return 'চারিত্রিক সনদ';
            case 'Trade License': return 'ট্রেড লাইসেন্স';
            case 'Warish': return 'ওয়ারিশ সনদ';
            case 'Heirship': return 'উত্তরাধিকার সনদ';
            case 'Family': return 'পারিবারিক সনদ';
            case 'Family Certificate': return 'পারিবারিক সনদ';
            case 'পারিবারিক': return 'পারিবারিক সনদ';
            case 'পারিবারিক সনদ': return 'পারিবারিক সনদ';
            case 'Landless': return 'ভূমিহীন সনদ';
            case 'Disability': return 'প্রতিবন্ধী সনদ';
            // Need a way to get Bangla name for dynamic types. 
            // Since we don't have the type mapping here easily without fetching, 
            // we might have to pass it or rely on what's in the certificate if we stored it?
            // For now, returning the type name (likely English) is the safe fallback if no Bangla mapping found.
            // Ideally, we'd store the Bangla type name in the certificate or fetch it.
            default: return certificate.type;
        }
    };

    const getNarrative = () => {
        // Safe access to citizen data with fallback to manual details
        const citizenData = citizen || {};

        // Name
        const name = language === 'en'
            ? toTitleCase(citizenData.name || getDetailString('applicantName') || '')
            : (citizenData.nameBn || getDetailString('applicantNameBn') || citizenData.name || getDetailString('applicantName') || '');

        // Father/Husband Name
        const father = language === 'en'
            ? toTitleCase(citizenData.fatherName || getDetailString('fatherName') || '')
            : (citizenData.fatherNameBn || citizenData.fatherName || getDetailString('fatherName') || '');

        // Mother Name
        const mother = language === 'en'
            ? toTitleCase(citizenData.motherName || getDetailString('motherName') || '')
            : (citizenData.motherNameBn || citizenData.motherName || getDetailString('motherName') || '');

        // Address Handling - prefer presentAddress over legacy address
        let village = '';
        let post = '';

        // Resolve address: presentAddress > address > manual details
        const resolvedAddr = (citizenData.presentAddress && typeof citizenData.presentAddress === 'object')
            ? citizenData.presentAddress
            : (citizenData.address && typeof citizenData.address === 'object')
                ? citizenData.address
                : null;

        if (resolvedAddr) {
            const addr = resolvedAddr as {
                village?: string;
                villageBn?: string;
                postOffice?: string;
                postOfficeBn?: string;
                upazila?: string;
                upazilaBn?: string;
                district?: string;
                districtBn?: string;
            };

            if (language === 'en') {
                village = toTitleCase(addr.village || toEnglishPlace(addr.villageBn || '', VILLAGES));
                post = toTitleCase(addr.postOffice || toEnglishPlace(addr.postOfficeBn || '', POST_OFFICES));
            } else {
                village = addr.villageBn || toBanglaPlace(addr.village || '', VILLAGES);
                post = addr.postOfficeBn || toBanglaPlace(addr.postOffice || '', POST_OFFICES);
            }
        } else {
            // Fallback to manual address details from certificate.details
            if (language === 'bn') {
                village = getDetailString('villageBn') || getDetailString('village') || '';
                post = getDetailString('postOfficeBn') || getDetailString('postOffice') || '';
            } else {
                village = toTitleCase(getDetailString('village') || toEnglishPlace(getDetailString('villageBn'), VILLAGES));
                post = toTitleCase(getDetailString('postOffice') || toEnglishPlace(getDetailString('postOfficeBn'), POST_OFFICES));
            }
        }

        if (certificate.type === 'Trade License' || certificate.type === 'Trade' || certificate.type === 'ট্রেড লাইসেন্স') {
            const businessName = language === 'en'
                ? toTitleCase(getDetailString('businessName') || '')
                : (getDetailString('businessNameBn') || getDetailString('businessName') || '');

            const businessType = language === 'en'
                ? toSentenceCase(getDetailString('businessType') || '')
                : (getDetailString('businessTypeBn') || getDetailString('businessType') || '');

            const businessAddress = language === 'en'
                ? toTitleCase(getDetailString('businessAddress') || '')
                : (getDetailString('businessAddressBn') || getDetailString('businessAddress') || '');
            const businessCapital = certificate.details?.businessCapital;

            if (language === 'en') {
                return (
                    <div className="w-full">
                        <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                            This is to certify that <strong>{businessName}</strong>
                            <br />
                            Proprietor: <strong>{name}</strong>
                            <br />
                            Business Address: {businessAddress}
                            <br />
                            Business Type: {businessType}
                            {businessCapital !== undefined && businessCapital !== null && <><br />Authorized Capital: {String(businessCapital)} BDT</>}
                        </div>
                        <p style={{ marginTop: '1.5rem', textAlign: 'left', lineHeight: '1.6' }}>
                            This establishment is a regular taxpayer under this Union Parishad. This trade license is valid for the financial year {new Date().getFullYear()}-{new Date().getFullYear() + 1}.
                            To the best of our knowledge, the establishment does not cause environmental harm.
                        </p>
                        <p style={{ marginTop: '1.5rem', textAlign: 'left', lineHeight: '1.6' }}>
                            This certificate is issued upon request for lawful purposes.
                        </p>
                    </div>
                );
            }

            return (
                <div className="w-full">
                    <div className="text-justify leading-relaxed">
                        এতদ্বারা প্রত্যয়ন করা যাইতেছে যে, মেসার্স <strong>{businessName}</strong>
                        <br />
                        প্রোঃ <strong>{name}</strong>
                        <br />
                        ব্যবসা প্রতিষ্ঠানের ঠিকানা: {businessAddress}
                        <br />
                        ব্যবসার ধরণ: {businessType}
                        {businessCapital !== undefined && businessCapital !== null && <><br />ব্যবসা মূলধন: {String(businessCapital)} টাকা</>}
                    </div>
                    <p className="mt-4 text-justify leading-relaxed">
                        প্রতিষ্ঠানটি অত্র ইউনিয়নের একজন নিয়মিত করদাতা। উক্ত লাইসেন্স {new Date().getFullYear()}-{new Date().getFullYear() + 1} অর্থবছরের জন্য প্রযোজ্য।
                        উক্ত প্রতিষ্ঠানের দ্বারা কোন প্রকার পরিবেশের ক্ষতি সাধন হয়না।
                    </p>
                    <p className="mt-4">
                        আমি উক্ত প্রতিষ্ঠানের ব্যবসায়িক সাফল্য কামনা করি।
                    </p>
                </div>
            );
        }

        if (certificate.type === 'Warish' || certificate.type === 'Warish Certificate' || certificate.type === 'Succession Certificate' || certificate.type === 'ওয়ারিশ সনদ' || certificate.type === 'Heirship' || certificate.type === 'Heirship Certificate' || certificate.type === 'উত্তরাধিকার সনদ') {
            const isHeirship = certificate.type === 'Heirship' || certificate.type === 'Heirship Certificate' || certificate.type === 'উত্তরাধিকার সনদ';

            const deceasedNameEn = toTitleCase(getDetailString('deceasedNameEn') || getDetailString('deceasedName') || '');
            const deceasedNameBn = getDetailString('deceasedNameBn') || getDetailString('deceasedName') || '';
            const deceasedFatherEn = toTitleCase(getDetailString('deceasedFatherNameEn') || getDetailString('deceasedFatherName') || '');
            const deceasedFatherBn = getDetailString('deceasedFatherNameBn') || getDetailString('deceasedFatherName') || '';
            const deceasedMotherEn = toTitleCase(getDetailString('deceasedMotherNameEn') || getDetailString('deceasedMotherName') || '');
            const deceasedMotherBn = getDetailString('deceasedMotherNameBn') || getDetailString('deceasedMotherName') || '';
            const deceasedAddressEn = toTitleCase(getDetailString('deceasedAddressEn') || `Village: ${village}, Post: ${post}, Upazila: ${upazila}, District: ${district}`);
            const deceasedAddressBn = getDetailString('deceasedAddressBn') || `সাং- ${village}, ডাকঘর: ${post}, থানা/উপজেলা: ${upazila}, জেলা: ${district}`;

            const heirs = getDetailArray('warishList').length > 0 ? getDetailArray('warishList') : getDetailArray('heirs');

            // shared table cell style
            const tc: React.CSSProperties = { border: '1px solid #222', padding: '4px 6px', fontSize: '14px' };

            if (language === 'en') {
                return (
                    <div className="w-full">
                        <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                            This is to certify that the under-mentioned deceased person was a permanent resident of this Union Parishad. Upon his/her death, the following legal {isHeirship ? 'successors/heirs' : 'heirs (Warish)'} have been identified:
                        </p>

                        {/* Deceased Info — 2-col grid */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ ...tc, width: '18%', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Name of Deceased</td>
                                    <td style={{ ...tc, width: '32%', fontWeight: 'bold' }}>{deceasedNameEn}</td>
                                    <td style={{ ...tc, width: '18%', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Father / Husband</td>
                                    <td style={{ ...tc, width: '32%' }}>{deceasedFatherEn}</td>
                                </tr>
                                <tr>
                                    <td style={{ ...tc, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Mother</td>
                                    <td style={{ ...tc }}>{deceasedMotherEn}</td>
                                    <td style={{ ...tc, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Address</td>
                                    <td style={{ ...tc }}>{deceasedAddressEn}</td>
                                </tr>
                            </tbody>
                        </table>

                        <p style={{ lineHeight: '1.7', marginBottom: '10px' }}>
                            The deceased left behind the following {isHeirship ? 'legal successors/heirs' : 'legal heirs (Warish)'}:
                        </p>

                        {/* Warish Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e8e8e8' }}>
                                    <th style={{ ...tc, width: '46px', textAlign: 'center' }}>Sl.</th>
                                    <th style={{ ...tc, textAlign: 'left' }}>{isHeirship ? 'Name of Successor' : 'Name of Heir'}</th>
                                    <th style={{ ...tc, width: '140px', textAlign: 'center' }}>Relation</th>
                                    <th style={{ ...tc, width: '175px', textAlign: 'center' }}>NID / Birth Reg. No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {heirs.map((heir, i) => (
                                    <tr key={i}>
                                        <td style={{ ...tc, textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ ...tc }}>{toTitleCase(heir.nameEn || '')}</td>
                                        <td style={{ ...tc, textAlign: 'center' }}>{toSentenceCase(heir.relation || '')}</td>
                                        <td style={{ ...tc, textAlign: 'center' }}>{heir.nid}</td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <td colSpan={4} style={{ ...tc, fontWeight: 'bold', textAlign: 'right' }}>
                                        Total Heirs: {heirs.length} person{heirs.length !== 1 ? 's' : ''}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <p style={{ lineHeight: '1.7' }}>
                            {isHeirship
                                ? 'Based on inquiry and supporting evidence, the above-mentioned persons are recognized as the legal successors/heirs of the deceased. This certificate is issued upon request for lawful purposes.'
                                : 'Based on inquiry and supporting evidence, the above-mentioned persons are recognized as the legal heirs of the deceased. This certificate is issued upon request for lawful purposes.'}
                        </p>
                    </div>
                );
            }

            return (
                <div className="w-full">
                    <p style={{ textAlign: 'justify', lineHeight: '1.7', marginBottom: '12px' }}>
                        এই মর্মে সনদ প্রদান করা যাইতেছে যে, নিম্নবর্ণিত মৃত ব্যক্তি অত্র ইউনিয়ন পরিষদের একজন স্থায়ী বাসিন্দা ছিলেন। মৃত্যুকালে তিনি নিম্নবর্ণিত {isHeirship ? 'উত্তরাধিকারীগণ' : 'ওয়ারিশগণ'} রাখিয়া মৃত্যুবরণ করেন:
                    </p>

                    {/* মৃত ব্যক্তির তথ্য — 2-col grid */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                        <tbody>
                            <tr>
                                <td style={{ ...tc, width: '18%', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>মৃতের নাম</td>
                                <td style={{ ...tc, width: '32%', fontWeight: 'bold' }}>{deceasedNameBn}</td>
                                <td style={{ ...tc, width: '18%', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>পিতা / স্বামী</td>
                                <td style={{ ...tc, width: '32%' }}>{deceasedFatherBn}</td>
                            </tr>
                            <tr>
                                <td style={{ ...tc, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>মাতার নাম</td>
                                <td style={{ ...tc }}>{deceasedMotherBn}</td>
                                <td style={{ ...tc, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>ঠিকানা</td>
                                <td style={{ ...tc }}>{deceasedAddressBn}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ওয়ারিশ তালিকা */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e8e8e8' }}>
                                <th style={{ ...tc, width: '46px', textAlign: 'center' }}>ক্রঃ নং</th>
                                <th style={{ ...tc, textAlign: 'center' }}>{isHeirship ? 'উত্তরাধিকারীর নাম' : 'ওয়ারিশের নাম'}</th>
                                <th style={{ ...tc, width: '140px', textAlign: 'center' }}>মৃতের সাথে সম্পর্ক</th>
                                <th style={{ ...tc, width: '175px', textAlign: 'center' }}>জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নং</th>
                            </tr>
                        </thead>
                        <tbody>
                            {heirs.map((heir, i) => (
                                <tr key={i}>
                                    <td style={{ ...tc, textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{heir.nameBn}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{heir.relation}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{heir.nid}</td>
                                </tr>
                            ))}
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <td colSpan={4} style={{ ...tc, fontWeight: 'bold', textAlign: 'right' }}>
                                    মোট ওয়ারিশ সংখ্যা: {heirs.length} জন
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p style={{ textAlign: 'justify', lineHeight: '1.7' }}>
                        {isHeirship
                            ? 'সরেজমিনে তদন্ত ও স্থানীয় গণ্যমান্য ব্যক্তিবর্গের সুপারিশক্রমে উল্লেখিত উত্তরাধিকারীগণ সঠিক বলিয়া প্রতীয়মান হইয়াছে। আমি তাদের সার্বিক মঙ্গল কামনা করি।'
                            : 'সরেজমিনে তদন্ত ও স্থানীয় গণ্যমান্য ব্যক্তিবর্গের সুপারিশক্রমে উল্লেখিত ওয়ারিশগণ সঠিক বলিয়া প্রতীয়মান হইয়াছে। আমি তাদের সার্বিক মঙ্গল কামনা করি।'}
                    </p>
                </div>
            );
        }

        // Family Certificate Narrative
        if (certificate.type === 'Family' || certificate.type === 'Family Certificate' || certificate.type === 'পারিবারিক সনদ' || certificate.type === 'পারিবারিক') {
            const headNameEn = toTitleCase(getDetailString('deceasedNameEn') || getDetailString('deceasedName') || '');
            const headNameBn = getDetailString('deceasedNameBn') || getDetailString('deceasedName') || '';
            const headFatherEn = toTitleCase(getDetailString('deceasedFatherNameEn') || getDetailString('deceasedFatherName') || '');
            const headFatherBn = getDetailString('deceasedFatherNameBn') || getDetailString('deceasedFatherName') || '';
            const headMotherEn = toTitleCase(getDetailString('deceasedMotherNameEn') || getDetailString('deceasedMotherName') || '');
            const headMotherBn = getDetailString('deceasedMotherNameBn') || getDetailString('deceasedMotherName') || '';
            const headAddressEn = toTitleCase(getDetailString('deceasedAddressEn') || `Village: ${village}, Post: ${post}, Upazila: ${upazila}, District: ${district}`);
            const headAddressBn = getDetailString('deceasedAddressBn') || `সাং- ${village}, ডাকঘর: ${post}, থানা/উপজেলা: ${upazila}, জেলা: ${district}`;

            const members = getDetailArray('warishList').length > 0 ? getDetailArray('warishList') : getDetailArray('heirs');

            const tc: React.CSSProperties = { border: '1px solid #222', padding: '4px 6px', fontSize: '14px' };

            if (language === 'en') {
                return (
                    <div className="w-full">
                        <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                            This is to certify that <strong>{headNameEn}</strong>, Father/Husband: <strong>{headFatherEn}</strong>, Mother: <strong>{headMotherEn}</strong>, Address: {headAddressEn}, is a permanent resident of this Union Parishad. The members of his/her family are listed below:
                        </p>

                        {/* Family Members Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e8e8e8' }}>
                                    <th style={{ ...tc, width: '46px', textAlign: 'center' }}>Sl.</th>
                                    <th style={{ ...tc, textAlign: 'left' }}>Name of Family Member</th>
                                    <th style={{ ...tc, width: '160px', textAlign: 'center' }}>Relation with Head</th>
                                    <th style={{ ...tc, width: '175px', textAlign: 'center' }}>NID / Birth Reg. No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m, i) => (
                                    <tr key={i}>
                                        <td style={{ ...tc, textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ ...tc }}>{toTitleCase(m.nameEn || '')}</td>
                                        <td style={{ ...tc, textAlign: 'center' }}>{toSentenceCase(m.relation || '')}</td>
                                        <td style={{ ...tc, textAlign: 'center' }}>{m.nid}</td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <td colSpan={4} style={{ ...tc, fontWeight: 'bold', textAlign: 'right' }}>
                                        Total Family Members: {members.length} person{members.length !== 1 ? 's' : ''}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <p style={{ lineHeight: '1.7' }}>
                            Based on local inquiry and verification, the above-mentioned information is found to be correct. This certificate is issued upon request for lawful purposes.
                        </p>
                    </div>
                );
            }

            return (
                <div className="w-full">
                    <p style={{ textAlign: 'justify', lineHeight: '1.7', marginBottom: '12px' }}>
                        এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{headNameBn}</strong>, পিতা/স্বামী: <strong>{headFatherBn}</strong>, মাতা: <strong>{headMotherBn}</strong>, ঠিকানা: {headAddressBn}, অত্র ইউনিয়ন পরিষদের একজন স্থায়ী বাসিন্দা। তাঁহার পরিবারের সদস্যগণের তালিকা নিম্নরূপ:
                    </p>

                    {/* পরিবারের সদস্যগণের তালিকা */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e8e8e8' }}>
                                <th style={{ ...tc, width: '46px', textAlign: 'center' }}>ক্রঃ নং</th>
                                <th style={{ ...tc, textAlign: 'center' }}>পরিবারের সদস্যের নাম</th>
                                <th style={{ ...tc, width: '160px', textAlign: 'center' }}>পরিবার প্রধানের সাথে সম্পর্ক</th>
                                <th style={{ ...tc, width: '175px', textAlign: 'center' }}>জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নং</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m, i) => (
                                <tr key={i}>
                                    <td style={{ ...tc, textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{m.nameBn}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{m.relation}</td>
                                    <td style={{ ...tc, textAlign: 'center' }}>{m.nid}</td>
                                </tr>
                            ))}
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <td colSpan={4} style={{ ...tc, fontWeight: 'bold', textAlign: 'right' }}>
                                    মোট পরিবারের সদস্য সংখ্যা: {members.length} জন
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p style={{ textAlign: 'justify', lineHeight: '1.7' }}>
                        সরেজমিনে তদন্ত ও স্থানীয় গণ্যমান্য ব্যক্তিবর্গের সুপারিশক্রমে উল্লেখিত তথ্য সঠিক বলিয়া প্রতীয়মান হইয়াছে। আবেদনক্রমে পারিবারিক সনদ প্রদান করা হইল। আমি তাদের সার্বিক মঙ্গল কামনা করি।
                    </p>
                </div>
            );
        }

        // Disability Certificate Narrative
        if (certificate.type === 'Disability' || certificate.type === 'Disability Certificate' || certificate.type.includes('Disability') || certificate.type.includes('প্রতিবন্ধী')) {
            const rawDisabilityType = getDetailString('disabilityType') || '';
            const rawDisabilityTypeBn = getDetailString('disabilityTypeBn') || '';

            // Extract pure English from legacy mixed values like "শারীরিক প্রতিবন্ধী (Physical Disability)"
            const extractEnglish = (val: string) => val.includes('(') ? val.replace(/.*\((.+)\)/, '$1') : val;
            // Extract pure Bangla from legacy mixed values
            const extractBangla = (val: string) => val.includes('(') ? val.replace(/\s*\(.+\)/, '') : val;

            const disabilityType = toSentenceCase(extractEnglish(rawDisabilityType));
            const disabilityTypeBn = rawDisabilityTypeBn ? extractBangla(rawDisabilityTypeBn) : extractBangla(rawDisabilityType);

            // Check for custom body text override
            const customBodyEn = getDetailString('bodyTextEn');
            const customBodyBn = getDetailString('bodyTextBn');

            if (language === 'en') {
                return (
                    <span>
                        This is to certify that <strong>{name}</strong>, Father/Husband: <strong>{father}</strong>, Mother: <strong>{mother}</strong>, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district}, is a permanent resident of this Union Parishad.
                        <br /><br />
                        <strong>Type of Disability:</strong> {disabilityType}
                        <br /><br />
                        {customBodyEn || 'After due inquiry it has been ascertained that the above-named person is a person with disability. This certificate is issued upon request for lawful purposes. I wish the person all success in life.'}
                    </span>
                );
            }

            return (
                <span>
                    এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{name}</strong>, পিতা/স্বামী: <strong>{father}</strong>, মাতা: <strong>{mother}</strong>, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district}, অত্র ইউনিয়ন পরিষদের একজন স্থায়ী বাসিন্দা।
                    <br /><br />
                    <strong>প্রতিবন্ধিতার ধরন:</strong> {disabilityTypeBn}
                    <br /><br />
                    {customBodyBn || 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি একজন প্রতিবন্ধী ব্যক্তি। আবেদনক্রমে তাঁহার প্রতিবন্ধী সনদ প্রদান করা হইল। আমি তাঁর সর্বাঙ্গীণ মঙ্গল কামনা করি।'}
                </span>
            );
        }

        // Landless Certificate Narrative
        if (certificate.type === 'Landless' || certificate.type === 'Landless Certificate' || certificate.type === 'ভূমিহীন সনদ' || certificate.type.includes('Landless') || certificate.type.includes('ভূমিহীন')) {
            const customBodyEn = getDetailString('bodyTextEn');
            const customBodyBn = getDetailString('bodyTextBn');

            if (language === 'en') {
                return (
                    <span>
                        This is to certify that <strong>{name}</strong>, Father/Husband: <strong>{father}</strong>, Mother: <strong>{mother}</strong>, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district}, is a permanent resident of this Union Parishad.
                        <br /><br />
                        {customBodyEn || 'After due inquiry it has been ascertained that the above-named person does not own any agricultural or non-agricultural land within this Union or elsewhere. The person is genuinely landless and earns a livelihood through daily labor/small trade.'}
                        <br /><br />
                        This certificate is issued upon request for lawful purposes. I wish the person all success in life.
                    </span>
                );
            }

            return (
                <span>
                    এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{name}</strong>, পিতা/স্বামী: <strong>{father}</strong>, মাতা: <strong>{mother}</strong>, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district}, অত্র ইউনিয়ন পরিষদের একজন স্থায়ী বাসিন্দা।
                    <br /><br />
                    {customBodyBn || 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন বা অন্য কোথাও কোনো কৃষি বা অকৃষি জমির মালিক নহেন। তিনি একজন প্রকৃত ভূমিহীন ব্যক্তি এবং দিনমজুরি/ক্ষুদ্র ব্যবসার মাধ্যমে জীবিকা নির্বাহ করেন।'}
                    <br /><br />
                    আবেদনক্রমে তাহার ভূমিহীন সনদ প্রদান করা হইল। আমি তাহার জীবনের সর্বাঙ্গীন উন্নতি ও মঙ্গল কামনা করি।
                </span>
            );
        }

        // Generic / Default Narrative (Citizenship, Character, and Custom Types)
        const customBodyEn = getDetailString('bodyTextEn');
        const customBodyBn = getDetailString('bodyTextBn');

        if (language === 'en') {
            return (
                <span>
                    This is to certify that <strong>{name}</strong>, Father/Husband: <strong>{father}</strong>, Mother: <strong>{mother}</strong>, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district}.
                    <br /><br />
                    {customBodyEn ? (
                        <span>{customBodyEn}</span>
                    ) : (
                        <span>
                            The person is a permanent resident of this Union. I have known this person personally for a long time. {certificate.type === 'Character' ? 'The person is of good moral character.' : ''} To the best of my knowledge, this person is not involved in any anti-social or anti-state activities.
                        </span>
                    )}
                    <br /><br />
                    This certificate is issued upon request for lawful purposes.
                </span>
            );
        }

        // Default Bangla Narrative
        return (
            <span>
                এই মর্মে সনদ প্রদান করা যাইতেছে যে, <strong>{name}</strong>, পিতা/স্বামী: <strong>{father}</strong>, মাতা: <strong>{mother}</strong>, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district}।
                <br /><br />
                {customBodyBn ? (
                    <span>{customBodyBn}</span>
                ) : (
                    <span>
                        তিনি অত্র ইউনিয়নের একজন স্থায়ী বাসিন্দা। আমি তাকে ব্যক্তিগতভাবে চিনি ও জানি। {certificate.type === 'Character' || certificate.type === 'চারিত্রিক সনদ' ? 'তার নৈতিক চরিত্র খুবই ভালো।' : ''} আমার জানামতে তিনি রাষ্ট্র বা সমাজ বিরোধী কোন কাজের সহিত জড়িত নহেন।
                    </span>
                )}
                <br /><br />
                আমি তার জীবনের সর্বাঙ্গীন উন্নতি ও মঙ্গল কামনা করি।
            </span>
        );
    };

    return (
        <div
            id="certificate-print-view"
            style={{
                width: '210mm',
                height: '297mm',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                color: '#111827',
                fontFamily: language === 'en' ? '"Times New Roman", Times, serif' : '"Kalpurush", "Noto Sans Bengali", "Hind Siliguri", sans-serif',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                // Remove global uppercase for English
                textTransform: 'none'
            }}
        >
            {/* Header Content */}
            <div style={{ padding: '20px 40px 10px 40px', textAlign: 'center', position: 'relative' }}>
                    {/* Government Header */}
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                        {language === 'en' ? "Government of the people's Republic of Bangladesh" : "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"}
                    </p>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    {/* Logo Left */}
                    <div style={{ width: '100px', height: '100px' }}>
                        {settings?.unionLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={settings.unionLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src="/bd-logo.png" alt="Bd Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                    </div>

                    {/* Union Text */}
                    <div style={{ textAlign: 'center' }}>
                        <h1 className="cert-red-text" style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            margin: '0',
                            color: '#dc2626', // Red
                            lineHeight: '1.2'
                        }}>{unionName}</h1>
                        <p style={{ fontSize: '20px', margin: '5px 0', color: '#000' }}>{unionAddress}</p>
                    </div>

                    {/* Hidden Spacer for Balance */}
                    <div style={{ width: '100px' }}></div>
                </div>
            </div>

            {/* Separator / Meta Line */}
            <div className="cert-red-text" style={{
                borderTop: '2px solid #16a34a', // Green Line
                margin: '0 40px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#dc2626', // Red Text
                fontWeight: 'bold',
                fontSize: '15px'
            }}>
                <div>{language === 'en' ? 'Memo No.' : 'স্মারক নং-'} {certificate.certificateNumber}</div>
                <div>{language === 'en' ? 'Date' : 'তারিখ :'} {formatDate(certificate.issueDate)}</div>
            </div>

            {/* Watermark */}
            {settings?.unionLogo && (
                <div style={{
                    position: 'absolute',
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    zIndex: 0,
                    opacity: 0.1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none'
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.unionLogo} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
            )}

            {/* Content Area */}
            <div style={{ padding: '40px 60px', flex: 1, position: 'relative', zIndex: 1 }}>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        margin: 0,
                        display: 'inline-block',
                        borderBottom: '2px solid #000', // Underline
                        paddingBottom: '12px',
                        lineHeight: '1.5',
                        color: '#111827'
                    }}>{getTitle()}</h2>
                </div>

                {/* Narrative */}
                <div style={{
                    fontSize: '20px',
                    lineHeight: '1.6',
                    textAlign: language === 'en' ? 'left' : 'justify',
                    color: '#000'
                }}>
                    {getNarrative()}
                </div>

            </div>

            {/* Footer Signatures */}
            <div style={{
                padding: '0 60px 20px 60px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                position: 'relative',
                zIndex: 1
            }}>
                {/* QR Code Left */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QRCodeCanvas value={verifyUrl} size={100} />
                    <p style={{ fontSize: '12px', marginTop: '5px' }}>{language === 'en' ? 'Verification' : 'যাচাই করুন'}</p>
                </div>

                {/* Chairman Signature Block Right */}
                <div style={{ textAlign: 'center', width: '280px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{language === 'en' ? 'Authorized Signature' : 'স্বাক্ষর-'}</p>
                    <div style={{ height: '40px' }}></div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0', color: '#111827' }}>
                        ({language === 'en' ? (settings?.chairmanNameEn || 'Bolai Miah') : (settings?.chairmanNameBn || 'বলাই মিয়া')})
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{language === 'en' ? 'Chairman' : 'চেয়ারম্যান'}</p>
                    <p style={{ fontSize: '16px', margin: 0, color: '#222' }}>{language === 'en' ? '04 No Kalikaccha Union Parishad' : '০৪ নং কালিকচ্ছ ইউনিয়ন পরিষদ'}</p>
                    <p style={{ fontSize: '16px', margin: 0, color: '#222' }}>{language === 'en' ? 'Sarail, Brahmanbaria' : 'সরাইল, ব্রাহ্মণবাড়িয়া'}</p>
                    <p style={{ fontSize: '16px', margin: 0, color: '#222' }}>{language === 'en' ? 'Bangladesh' : 'বাংলাদেশ'}</p>
                </div>
            </div>

            {/* Bottom Green Bar */}
            <div style={{
                backgroundColor: '#16a34a', // Green
                color: 'white',
                padding: '6px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                marginTop: 'auto',
                whiteSpace: 'nowrap',
                gap: '12px'
            }}>
                <div>{unionName}</div>
                {settings?.unionWebsite && <div>Website: {settings.unionWebsite}</div>}
                {settings?.unionEmail && <div>Email: {settings.unionEmail}</div>}
            </div>

        </div>
    );
}
