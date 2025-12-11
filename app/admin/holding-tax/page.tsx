'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Save, Check, AlertCircle, History, Receipt, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { TaxReceipt } from './TaxReceipt';

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

function HoldingTaxContent() {
    const searchParams = useSearchParams();
    const preSelectedCitizenId = searchParams.get('citizenId');

    // Settings State
    const [settings, setSettings] = useState<any>(null); // Store full settings for receipt

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
                } catch (error) {
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
    }, []);

    // Fetch Settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setSettings(data);
                setPaymentAmount(data.holdingTaxAmount || 500); // Default payment amount
            } catch (error) {
                toast.error('Failed to load settings');
            }
        }
        fetchSettings();
    }, []);

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
            } catch (error) {
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
                toast.success('Tax payment recorded successfully');

                // Immediately update status to PAID locally with new record
                const newRecord = {
                    ...data,
                    citizenId: selectedCitizen // augment with full citizen object for UI
                };
                setPaymentStatus({ paid: true, record: newRecord });

                fetchHistory(); // Refresh history
            } else if (res.status === 409) {
                toast.error(data.error || 'Already paid for this year');
                // Trigger re-check just in case
                setPaymentStatus({ paid: true });
            } else {
                toast.error('Failed to record payment');
            }
        } catch (error) {
            toast.error('Payment failed');
        } finally {
            setProcessing(false);
        }
    };

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

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Holding Tax</h1>
                <p className="text-muted-foreground mt-1">Manage holding tax collection and settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Settings Panel */}
                {/* Payment Panel - Full Width Now */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border bg-card p-6 shadow-sm h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt size={18} /> Receive Payment
                        </h3>

                        {!selectedCitizen ? (
                            <div className="space-y-4 flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        placeholder="Search citizen by Name or NID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="space-y-2 mt-2">
                                        {citizens.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No citizen found</p>
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
                                                        Select
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
                                        <div className="text-sm text-muted-foreground">Father: {selectedCitizen.fatherName} | NID: {selectedCitizen.nid}</div>
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
                                        <label className="text-sm font-medium">Financial Year</label>
                                        <input
                                            value={financialYear}
                                            onChange={(e) => setFinancialYear(e.target.value)}
                                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>

                                    {paymentStatus.paid ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-transparent">Actions</label>
                                            <div className="h-10 flex items-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    <Check size={14} /> Paid
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Amount (Tk)</label>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Payment Status / Actions */}
                                <div className="mt-auto pt-4">
                                    {checkingStatus ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Checking Status...
                                        </div>
                                    ) : paymentStatus.paid ? (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold text-lg">
                                                <Check className="h-6 w-6" /> Tax Already Paid
                                            </div>
                                            <p className="text-sm text-emerald-600">
                                                {paymentStatus.record?.citizenId._id === selectedCitizen._id ? (
                                                    `This citizen has already paid holding tax for the financial year ${financialYear}.`
                                                ) : (
                                                    <span>
                                                        Paid by family member: <span className="font-bold">{paymentStatus.record?.citizenId.name}</span>
                                                    </span>
                                                )}
                                            </p>
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => paymentStatus.record && printReceipt({
                                                        ...paymentStatus.record,
                                                        citizenId: selectedCitizen // ensure citizen details are present
                                                    })}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
                                                >
                                                    <Printer size={16} /> Print Receipt
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                                        >
                                            {processing ? 'Processing...' : (
                                                <>
                                                    <Check size={18} /> Confirm Payment
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
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History size={18} /> Recent Payments
                    </h3>
                    <button onClick={fetchHistory} className="text-xs text-primary hover:underline">Refresh</button>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Receipt No</th>
                                <th className="px-6 py-3">Citizen</th>
                                <th className="px-6 py-3">FY</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Date</th>
                                <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loadingHistory ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading history...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No payment records found</td>
                                </tr>
                            ) : (
                                history.map(record => (
                                    <tr key={record._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{record.receiptNumber}</td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium">{record.citizenId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{record.citizenId?.nid}</div>
                                        </td>
                                        <td className="px-6 py-3"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">{record.financialYear}</span></td>
                                        <td className="px-6 py-3 text-right font-semibold">৳{record.amount}</td>
                                        <td className="px-6 py-3 text-right text-muted-foreground">{format(new Date(record.paidAt), 'dd MMM yyyy')}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => printReceipt(record)}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                title="Print Receipt"
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
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading holding tax module...</div>}>
            <HoldingTaxContent />
        </Suspense>
    );
}
