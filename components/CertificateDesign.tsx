import { QRCodeCanvas } from 'qrcode.react';
import { VILLAGES, POST_OFFICES } from '@/lib/constants';
import { SettingsData } from '@/types';

interface CertificateProps {
    certificate: {
        certificateNumber: string;
        type: string;
        issueDate: string;
        details?: Record<string, any>;
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
            dateOfBirth?: string;
        };
    };
    settings?: SettingsData;
    language?: 'bn' | 'en';
}

export default function CertificateDesign({ certificate, settings, language = 'bn' }: CertificateProps) {
    const { citizenId: citizen } = certificate;
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;

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
            ? (citizenData.name || certificate.details?.applicantName || '')
            : (citizenData.nameBn || certificate.details?.applicantNameBn || citizenData.name || certificate.details?.applicantName || '');

        // Father/Husband Name
        const father = language === 'en'
            ? (citizenData.fatherName || certificate.details?.fatherName || '')
            : (citizenData.fatherNameBn || citizenData.fatherName || certificate.details?.fatherName || '');

        // Mother Name
        const mother = language === 'en'
            ? (citizenData.motherName || certificate.details?.motherName || '')
            : (citizenData.motherNameBn || citizenData.motherName || certificate.details?.motherName || '');

        // Address Handling
        let village = '';
        let post = '';
        let currentUpazila = upazila; // Use the upazila defined at the top level
        let currentDistrict = district; // Use the district defined at the top level

        // Check if address is object (from Citizen model) or manual
        if (citizenData.address && typeof citizenData.address === 'object') {
            if (language === 'en') {
                village = (citizenData.address as any).village || '';
                post = (citizenData.address as any).postOffice || '';
                currentUpazila = (citizenData.address as any).upazila || upazila;
                currentDistrict = (citizenData.address as any).district || district;
            } else {
                village = VILLAGES.find(v => v.en === (citizenData.address as any).village)?.bn || (citizenData.address as any).village || '';
                post = POST_OFFICES.find(p => p.en === (citizenData.address as any).postOffice)?.bn || (citizenData.address as any).postOffice || '';
                currentUpazila = (citizenData.address as any).upazila || upazila; // Assuming upazila/district might not have bn mapping here
                currentDistrict = (citizenData.address as any).district || district;
            }
        } else {
            // Fallback to manual address details from certificate.details
            if (language === 'bn') {
                village = certificate.details?.villageBn || certificate.details?.village || '';
                post = certificate.details?.postOfficeBn || certificate.details?.postOffice || '';
                currentUpazila = certificate.details?.upazilaBn || certificate.details?.upazila || upazila;
                currentDistrict = certificate.details?.districtBn || certificate.details?.district || district;
            } else {
                village = certificate.details?.village || '';
                post = certificate.details?.postOffice || '';
                currentUpazila = certificate.details?.upazila || upazila;
                currentDistrict = certificate.details?.district || district;
            }
        }

        if (certificate.type === 'Trade License' || certificate.type === 'Trade') {
            const businessName = language === 'en'
                ? (certificate.details?.businessName || '')
                : (certificate.details?.businessNameBn || certificate.details?.businessName || '');

            const businessType = language === 'en'
                ? (certificate.details?.businessType || '')
                : (certificate.details?.businessTypeBn || certificate.details?.businessType || '');

            const businessAddress = language === 'en'
                ? (certificate.details?.businessAddress || '')
                : (certificate.details?.businessAddressBn || certificate.details?.businessAddress || '');

            if (language === 'en') {
                return (
                    <span>
                        This is to certify that <strong>{businessName}</strong>, Prop: <strong>{name}</strong>, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district}.
                        Business Address: {businessAddress}.
                        The establishment is a regular taxpayer of this Union. No environmental damage is caused by this establishment.
                        <br /><br />
                        I wish the establishment every success.
                    </span>
                );
            }

            return (
                <span>
                    আমি এই মর্মে সনদ প্রদান করিতেছি যে, <strong>{businessName}</strong>, প্রোঃ <strong>{name}</strong>, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district}।
                    ব্যবসা প্রতিষ্ঠানের ঠিকানা: {businessAddress}।
                    প্রতিষ্ঠানটি অত্র ইউনিয়নের একজন নিয়মিত করদাতা। উক্ত প্রতিষ্ঠানের দ্বারা কোন প্রকার পরিবেশের ক্ষতি সাধন হয়না।
                    <br /><br />
                    আমি তার প্রতিষ্ঠানের সার্বিক সফলতা কামনা করিতেছি।
                </span>
            );
        }

        if (certificate.type === 'Warish') {
            const deceasedName = language === 'en'
                ? (certificate.details?.deceasedName || '')
                : (certificate.details?.deceasedNameBn || certificate.details?.deceasedName || '');

            const deceasedFather = language === 'en'
                ? (certificate.details?.deceasedFatherName || '')
                : (certificate.details?.deceasedFatherNameBn || certificate.details?.deceasedFatherName || '');

            const heirs = (certificate.details?.heirs as any[]) || [];

            if (language === 'en') {
                return (
                    <div className="w-full">
                        <p>
                            This is to certify that Late <strong>{deceasedName}</strong>, Father/Husband: {deceasedFather}, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district} was a permanent resident of this Union. He/She died leaving behind the following heirs:
                        </p>
                        <div className="mt-4 border border-black/50 overflow-hidden rounded-sm">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid black', padding: '5px' }}>SL</th>
                                        <th style={{ border: '1px solid black', padding: '5px' }}>Name</th>
                                        <th style={{ border: '1px solid black', padding: '5px' }}>Relation</th>
                                        <th style={{ border: '1px solid black', padding: '5px' }}>Age</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {heirs.map((heir, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                                            <td style={{ border: '1px solid black', padding: '5px' }}>{heir.name}</td>
                                            <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{heir.relation}</td>
                                            <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{heir.age}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4">
                            Usually the heirs of a deceased person are not verified by this office. This certificate is issued based on the information provided by the applicant and local enquiry.
                        </p>
                    </div>
                );
            }

            return (
                <div className="w-full">
                    <p>
                        এই মর্মে সনদ প্রদান করা যাইতেছে যে, মৃত <strong>{deceasedName}</strong>, পিতা/স্বামী: {deceasedFather}, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district} অত্র ইউনিয়নের একজন স্থায়ী বাসিন্দা ছিলেন। মৃত্যুকালে তিনি নিম্নবর্ণিত ওয়ারিশগণ রাখিয়া মৃত্যুবরণ করেন।
                    </p>
                    <div className="mt-4 border border-black/50 overflow-hidden rounded-sm">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid black', padding: '5px' }}>নং</th>
                                    <th style={{ border: '1px solid black', padding: '5px' }}>নাম</th>
                                    <th style={{ border: '1px solid black', padding: '5px' }}>সম্পর্ক</th>
                                    <th style={{ border: '1px solid black', padding: '5px' }}>বয়স</th>
                                </tr>
                            </thead>
                            <tbody>
                                {heirs.map((heir, i) => (
                                    <tr key={i}>
                                        <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ border: '1px solid black', padding: '5px' }}>{heir.nameBn || heir.name}</td>
                                        <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{heir.relationBn || heir.relation}</td>
                                        <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{heir.ageBn || heir.age}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">
                        সাধারণত মৃত ব্যক্তির ওয়ারিশগণ এই অফিস দ্বারা যাচাই করা হয় না। এই সনদ আবেদনকারীর প্রদত্ত তথ্য এবং স্থানীয় তদন্তের ভিত্তিতে প্রদান করা হইল।
                    </p>
                </div>
            );
        }

        // Generic / Default Narrative (Citizenship, Character, and Custom Types)
        const customBodyEn = certificate.details?.bodyTextEn;
        const customBodyBn = certificate.details?.bodyTextBn;

        if (language === 'en') {
            return (
                <span>
                    This is to certify that <strong>{name}</strong>, Father/Husband: {father}, Mother: {mother}, Village: {village}, Post Office: {post}, Upazila: {upazila}, District: {district}.
                    <br /><br />
                    {customBodyEn ? (
                        <span>{customBodyEn}</span>
                    ) : (
                        <span>
                            He/She is a permanent resident of this Union. I know him/her personally for a long time. {certificate.type === 'Character' ? 'His/Her moral character is very good.' : ''} To my best knowledge, he/she is not involved in any anti-social or anti-state activities.
                        </span>
                    )}
                    <br /><br />
                    I wish him/her every success in life.
                </span>
            );
        }

        // Default Bangla Narrative
        return (
            <span>
                এই মর্মে সনদ প্রদান করা যাইতেছে যে, <strong>{name}</strong>, পিতা/স্বামী: {father}, মাতা: {mother}, সাং- {village}, ডাকঘর: {post}, থানা/উপজেলা: {upazila}, জেলা: {district}।
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
                fontFamily: language === 'en' ? '"Times New Roman", Times, serif' : 'var(--font-bengali), "Noto Serif Bengali", sans-serif',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header Content */}
            <div style={{ padding: '20px 40px 10px 40px', textAlign: 'center', position: 'relative' }}>
                <p style={{ fontSize: '16px', margin: '0 0 5px 0' }}>
                    {language === 'en' ? 'Bismillahir Rahmanir Rahim' : 'বিসমিল্লাহির রহমানির রহিম'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    {/* Logo Left */}
                    <div style={{ width: '100px', height: '100px' }}>
                        {settings?.unionLogo ?
                            <img src={settings.unionLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> :
                            <img src="/bd-logo.png" alt="Bd Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        }
                    </div>

                    {/* Union Text */}
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: '36px',
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
            <div style={{
                borderTop: '2px solid #16a34a', // Green Line
                margin: '0 40px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#dc2626', // Red Text
                fontWeight: 'bold',
                fontSize: '15px'
            }}>
                <div>{language === 'en' ? 'Memo No-' : 'স্মারক নং-'} {certificate.certificateNumber}</div>
                <div>{language === 'en' ? 'Date :' : 'তারিখ :'} {formatDate(certificate.issueDate)}</div>
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
                        lineHeight: '1.5'
                    }}>{getTitle()}</h2>
                </div>

                {/* Narrative */}
                <div style={{
                    fontSize: '20px',
                    lineHeight: '2',
                    textAlign: 'justify',
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
                    <p style={{ fontSize: '12px', marginTop: '5px' }}>{language === 'en' ? 'Verify' : 'যাচাই করুন'}</p>
                </div>

                {/* Chairman Signature Block Right */}
                <div style={{ textAlign: 'center', width: '250px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{language === 'en' ? 'Signature-' : 'স্বাক্ষর-'}</p>
                    <div style={{ height: '40px' }}></div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                        ({language === 'en' ? (settings?.chairmanNameEn || 'Bolai Miah') : (settings?.chairmanNameBn || 'বলাই মিয়া')})
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{language === 'en' ? 'Chairman' : 'চেয়ারম্যান'}</p>
                    <p style={{ fontSize: '16px', margin: 0 }}>{unionName}</p>
                    <p style={{ fontSize: '16px', margin: 0 }}>{district}</p>
                </div>
            </div>

            {/* Bottom Green Bar */}
            <div style={{
                backgroundColor: '#16a34a', // Green
                color: 'white',
                padding: '10px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                marginTop: 'auto'
            }}>
                <div>{unionName}</div>
                <div>Web: union.brahmanbaria.gov.bd</div>
                <div>E-mail: union@gmail.com</div>
            </div>

        </div>
    );
}
