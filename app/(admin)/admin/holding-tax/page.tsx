'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Check, History, Receipt, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { TaxReceipt } from './TaxReceipt';
import type { SettingsData } from '@/types';

interface Citizen {
    _id: string;
    name: string;
    nid: string;
    fatherName: string;
}

interface TaxRecord {
    _id: string;
    citizenId: Citizen;
    financialYear: string;
    amount: number;
    paidAt: string;
    receiptNumber: string;
}

import { useLanguage } from '@/components/providers/LanguageContext';

function HoldingTaxContent() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const preSelectedCitizenId = searchParams.get('citizenId');

    // Settings State
    const [settings, setSettings] = useState<SettingsData | null>(null);

    // Payment State
    const [searchTerm, setSearchTerm] = useState('');
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
    const [financialYear, setFinancialYear] = useState('');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<{ paid: boolean, record?: TaxRecord }>({ paid: false });
    const [checkingStatus, setCheckingStatus] = useState(false);

    // History State
    const [history, setHistory] = useState<TaxRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Printing State
    const receiptRef = useRef<HTMLDivElement>(null);
    const [printingRecord, setPrintingRecord] = useState<TaxRecord | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        onAfterPrint: () => setPrintingRecord(null) // Reset after print
    });

    // Trigger print when a record is set for printing
    useEffect(() => {
        if (printingRecord) {
            handlePrint();
        }
    }, [printingRecord, handlePrint]);

    // Manually trigger print for a specific record
    const printReceipt = (record: TaxRecord) => {
        setPrintingRecord(record);
    };


    // Pre-select Citizen Effect
    useEffect(() => {
        if (preSelectedCitizenId && !selectedCitizen) {
            async function fetchPreSelected() {
                try {
                    const res = await fetch(`/api/citizens/${preSelectedCitizenId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSelectedCitizen(data);
                    }
                } catch {
                    console.error('Failed to fetch pre-selected citizen');
                }
            }
            fetchPreSelected();
        }
    }, [preSelectedCitizenId, selectedCitizen]);

    // Calculate Current Financial Year (July to June)
    useEffect(() => {
        const calculateFY = () => {
            const today = new Date();
            const month = today.getMonth() + 1; // 1-12
            const year = today.getFullYear();
            if (month >= 7) {
                return `${year}-${year + 1}`;
            } else {
                return `${year - 1}-${year}`;
            }
        };
        const currentFY = calculateFY();
        setFinancialYear(currentFY);
    }, [language]);

    // Fetch Settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setSettings(data);
                setPaymentAmount(data.holdingTaxAmount || 500); // Default payment amount
            } catch {
                toast.error(language === 'en' ? 'Failed to load settings' : 'সেটিংস লোড করা যায়নি');
            }
        }
        fetchSettings();
    }, [language]);

    // Check Payment Status whenever Citizen or FY changes
    useEffect(() => {
        if (!selectedCitizen || !financialYear) {
            setPaymentStatus({ paid: false });
            return;
        }

        const checkStatus = async () => {
            setCheckingStatus(true);
            try {
                const res = await fetch(`/api/holding-tax/check?citizenId=${selectedCitizen._id}&financialYear=${financialYear}`);
                const data = await res.json();
                if (data.paid && data.details) {
                    setPaymentStatus({ paid: true, record: data.details });
                } else {
                    setPaymentStatus({ paid: false });
                }
            } catch {
                console.error('Failed to check status');
            } finally {
                setCheckingStatus(false);
            }
        };

        checkStatus();
    }, [selectedCitizen, financialYear]);


    // Fetch History
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch('/api/holding-tax?limit=10');
            const data = await res.json();
            setHistory(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch Citizens for Search
    useEffect(() => {
        const fetchCitizens = async () => {
            if (!searchTerm) {
                setCitizens([]);
                return;
            }
            try {
                const res = await fetch('/api/citizens');
                const data = await res.json();
                const filtered = data.filter((c: Citizen) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.nid.includes(searchTerm)
                ).slice(0, 5);
                setCitizens(filtered);
            } catch (error) {
                console.error(error);
            }
        };

        const timer = setTimeout(fetchCitizens, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePayment = async () => {
        if (!selectedCitizen) return;
        setProcessing(true);
        try {
            const res = await fetch('/api/holding-tax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizenId: selectedCitizen._id,
                    financialYear,
                    amount: paymentAmount
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(t.holdingTax.messages.success);

                // Immediately update status to PAID locally with new record
                const newRecord = {
                    ...data,
                    citizenId: selectedCitizen // augment with full citizen object for UI
                };
                setPaymentStatus({ paid: true, record: newRecord });

                fetchHistory(); // Refresh history
            } else if (res.status === 409) {
                toast.error(data.error || t.holdingTax.messages.alreadyPaid);
                // Trigger re-check just in case
                setPaymentStatus({ paid: true });
            } else {
                toast.error(t.holdingTax.messages.error);
            }
        } catch {
            toast.error(t.holdingTax.messages.error);
        } finally {
            setProcessing(false);
        }
    };

    const paidCount = history.length;
    const totalCollected = history.reduce((sum, record) => sum + (record.amount || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
            {/* Hidden Receipt Component for Printing */}
            <div style={{ display: 'none' }}>
                <TaxReceipt
                    ref={receiptRef}
                    record={printingRecord}
                    settings={settings}
                />
            </div>

            <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/55 via-card to-card p-6 md:p-7">
                <p className="text-sm font-medium text-primary">
                    {language === 'en' ? 'Tax Collection Desk' : 'কর আদায় ডেস্ক'}
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display md:text-3xl">{t.holdingTax.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{t.holdingTax.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Recent payments' : 'সাম্প্রতিক পরিশোধ'}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{paidCount}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Total collected' : 'মোট আদায়'}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--success)]">৳{totalCollected}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{language === 'en' ? 'Current financial year' : 'চলতি অর্থবছর'}</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{financialYear || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Settings Panel */}
                {/* Payment Panel - Full Width Now */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt size={18} /> {t.holdingTax.receivePayment}
                        </h3>

                        {!selectedCitizen ? (
                            <div className="space-y-4 flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        placeholder={t.holdingTax.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="space-y-2 mt-2">
                                        {citizens.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">{t.holdingTax.noCitizenFound}</p>
                                        ) : (
                                            citizens.map(citizen => (
                                                <div
                                                    key={citizen._id}
                                                    onClick={() => { setSelectedCitizen(citizen); setSearchTerm(''); }}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div>
                                                        <div className="font-medium">{citizen.name}</div>
                                                        <div className="text-xs text-muted-foreground">NID: {citizen.nid}</div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                        {t.holdingTax.select}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in flex-1 flex flex-col">
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-primary">{selectedCitizen.name}</div>
                                        <div className="text-sm text-muted-foreground">{language === 'en' ? 'Father' : 'পিতা'}: {selectedCitizen.fatherName} | NID: {selectedCitizen.nid}</div>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedCitizen(null); setPaymentStatus({ paid: false }); }}
                                        className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Financial Year Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t.holdingTax.financialYear}</label>
                                        <input
                                            value={financialYear}
                                            onChange={(e) => setFinancialYear(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                        />
                                    </div>

                                    {paymentStatus.paid ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-transparent">{t.holdingTax.actions}</label>
                                                <div className="h-11 flex items-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    <Check size={14} /> {t.holdingTax.paid}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t.holdingTax.amount}</label>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Payment Status / Actions */}
                                <div className="mt-auto pt-4">
                                    {checkingStatus ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            {language === 'en' ? 'Checking status...' : 'অবস্থা যাচাই করা হচ্ছে...'}
                                        </div>
                                    ) : paymentStatus.paid ? (
                                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 text-center space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
                                                <Check className="h-6 w-6" /> {t.holdingTax.taxAlreadyPaid}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {paymentStatus.record?.citizenId._id === selectedCitizen._id ? (
                                                    t.holdingTax.messages.alreadyPaid
                                                ) : (
                                                    <span>
                                                        {t.holdingTax.paidByFamily} <span className="font-bold">{paymentStatus.record?.citizenId.name}</span>
                                                    </span>
                                                )}
                                            </p>
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => paymentStatus.record && printReceipt({
                                                        ...paymentStatus.record,
                                                        citizenId: selectedCitizen // ensure citizen details are present
                                                    })}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
                                                >
                                                    <Printer size={16} /> {t.holdingTax.printReceipt}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                                        >
                                            {processing ? t.holdingTax.processing : (
                                                <>
                                                    <Check size={18} /> {t.holdingTax.confirmPayment}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. History Panel */}
            <div className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History size={18} /> {t.holdingTax.recentPayments}
                    </h3>
                    <button onClick={fetchHistory} className="text-xs text-primary hover:underline">{t.holdingTax.refresh}</button>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">{t.holdingTax.table.receiptNo}</th>
                                <th className="px-6 py-3">{t.holdingTax.table.citizen}</th>
                                <th className="px-6 py-3">{t.holdingTax.table.fy}</th>
                                <th className="px-6 py-3 text-right">{t.holdingTax.table.amount}</th>
                                <th className="px-6 py-3 text-right">{t.holdingTax.table.date}</th>
                                <th className="px-6 py-3 text-center">{t.holdingTax.table.action}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loadingHistory ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">{t.holdingTax.table.loading}</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">{t.holdingTax.table.noData}</td>
                                </tr>
                            ) : (
                                history.map(record => (
                                    <tr key={record._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{record.receiptNumber}</td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium">{record.citizenId?.name || (language === 'en' ? 'Unknown' : 'অজানা')}</div>
                                            <div className="text-xs text-muted-foreground">{record.citizenId?.nid}</div>
                                        </td>
                                        <td className="px-6 py-3"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">{record.financialYear}</span></td>
                                        <td className="px-6 py-3 text-right font-semibold">৳{record.amount}</td>
                                        <td className="px-6 py-3 text-right text-muted-foreground">{format(new Date(record.paidAt), 'dd MMM yyyy')}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => printReceipt(record)}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                title={language === 'en' ? 'Print receipt' : 'রশিদ প্রিন্ট'}
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function HoldingTaxPage() {
    return (
        <Suspense fallback={<HoldingTaxFallback />}>
            <HoldingTaxContent />
        </Suspense>
    );
}

function HoldingTaxFallback() {
    const { language } = useLanguage();

    return (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
            {language === 'en' ? 'Loading holding tax module...' : 'হোল্ডিং ট্যাক্স মডিউল লোড হচ্ছে...'}
        </div>
    );
}
