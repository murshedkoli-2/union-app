export const translations = {
    en: {
        common: {
            unionPortal: 'UnionPortal',
            officialPortal: 'Official Union Portal',
            adminPanel: 'Admin Panel',
            dashboard: 'Dashboard',
            welcome: 'Welcome',
            logout: 'Logout',
            search: 'Search...',
            notifications: 'Notifications',
            noNotifications: 'No notifications',
            markAllRead: 'Mark all read',
            bangla: 'Bangla',
            english: 'English',
        },
        sidebar: {
            overview: 'Overview',
            citizens: 'Citizens',
            addCitizen: 'Add Citizen',
            certificates: 'Certificates',
            issueCertificate: 'Issue Certificate',
            certificateTypes: 'Certificate Types',
            holdingTax: 'Holding Tax',
            reports: 'Reports',
            settings: 'Settings',
            adminUser: 'Admin User',
        },
        home: {
            welcomeTitle: 'Welcome to',
            unionName: 'Kalikaccha',
            unionSuffix: 'Union',
            subtitle: 'Your digital gateway to union services. Apply for citizenship, get certificates, and pay taxes online—fast, easy, and secure.',
            registerCitizen: 'Register as Citizen',
            applyCertificate: 'Apply for Certificate',
            checkStatus: 'Check Status',
            features: {
                citizenReg: {
                    title: 'Citizen Registration',
                    desc: 'Become a registered member of our union. Get your unique digital ID and access all services.'
                },
                onlineCert: {
                    title: 'Online Certificates',
                    desc: 'Need a trade license, character certificate, or warish certificate? Apply online and get it delivered.'
                },
                verifyDocs: {
                    title: 'Verify Documents',
                    desc: 'Instantly verify the authenticity of any certificate issued by our union using our online tool.'
                }
            },
            footerRights: 'All rights reserved.'
        },
        dashboard: {
            title: 'Dashboard Overview',
            welcomeBack: "Welcome back to the Union Admin Dashboard. Here's what's happening today.",
            totalCitizens: 'Total Citizens',
            certificatesIssued: 'Certificates Issued',
            pendingRequests: 'Pending Requests',
            revenue: 'Revenue',
            weeklyTrend: 'Weekly Registration Trend',
            weeklyTrendDesc: 'New citizen registrations over the last 7 days',
            monthlyCerts: 'Monthly Certificates',
            monthlyCertsDesc: 'Certificates issued over the last 6 months',
        },
        citizens: {
            title: 'Manage Citizens',
            subtitle: 'View and manage registered citizens.',
            add: 'Add Citizen',
            searchPlaceholder: 'Search by name, NID, or phone...',
            tabs: {
                all: 'All',
                pending: 'Pending',
                approved: 'Approved',
                rejected: 'Rejected',
            },
            table: {
                name: 'Name',
                nid: 'NID',
                status: 'Status',
                address: 'Address',
                actions: 'Actions',
                loading: 'Loading...',
                noData: 'No citizens found.',
            },
            form: {
                title: 'Citizen Registration',
                personalInfo: 'Personal Information',
                nameBn: 'Name (Bangla)',
                nameEn: 'Name (English)',
                fatherName: 'Father Name',
                motherName: 'Mother Name',
                nid: 'National ID',
                dob: 'Date of Birth',
                gender: 'Gender',
                phone: 'Phone Number',
                addressInfo: 'Address Information',
                village: 'Village',
                postOffice: 'Post Office',
                ward: 'Ward',
                submit: 'Register Citizen',
                success: 'Citizen registered successfully',
                error: 'Failed to register citizen',
            }
        },
        certificates: {
            title: 'Certificates',
            subtitle: 'Manage and issue certificates.',
            issue: 'Issue New',
            searchPlaceholder: 'Search certificates...',
            tabs: {
                all: 'All',
                pending: 'Pending',
                approved: 'Approved',
                rejected: 'Rejected',
                issued: 'Issued',
            },
            table: {
                certNo: 'Cert. No',
                name: 'Citizen Name',
                type: 'Type',
                date: 'Issue Date',
                status: 'Status',
                actions: 'Actions',
                loading: 'Loading certificates...',
                noData: 'No certificates found.',
            },
            issuePage: {
                title: 'Issue Certificate',
                subtitle: 'Create and issue a new certificate for a citizen.',
                steps: {
                    selectCitizen: 'Select Citizen',
                    selectType: 'Select Type',
                    review: 'Review & Issue'
                },
                searchPlaceholder: 'Search citizen by Name, NID or Phone...',
                chooseType: 'Choose Certificate Type',
                fee: 'Fee',
                reviewSection: {
                    citizen: 'Citizen',
                    certType: 'Certificate Type',
                    totalFee: 'Total Fee',
                    disclaimer: 'By clicking "Issue Certificate", you confirm that the fee has been collected and the details are verified.',
                    issueBtn: 'Issue Certificate',
                    back: 'Back',
                    next: 'Next Step',
                    reviewOrder: 'Review Order'
                },
                success: 'Certificate issued successfully',
                error: 'Failed to issue certificate'
            },
            types: {
                title: 'Certificate Types',
                subtitle: 'Manage certificate categories and fees.',
                addNew: 'Add New Type',
                cancel: 'Cancel',
                save: 'Save Type',
                table: {
                    nameEn: 'Name (En)',
                    nameBn: 'Name (Bn)',
                    fee: 'Fee',
                    actions: 'Actions',
                    loading: 'Loading types...',
                    noData: 'No types found.'
                },
                form: {
                    nameEn: 'Name (English)',
                    nameBn: 'Name (Bangla)',
                    fee: 'Fee (BDT)',
                    exampleEn: 'e.g. Trade License',
                    exampleBn: 'e.g. ট্রেড লাইসেন্স'
                },
                messages: {
                    added: 'Certificate type added successfully',
                    updated: 'Certificate type updated',
                    error: 'Error submitting form',
                    deleteDisabled: 'Delete action is currently disabled for safety.'
                }
            },
        },
        holdingTax: {
            title: 'Holding Tax',
            subtitle: 'Manage holding tax collection and settings.',
            receivePayment: 'Receive Payment',
            searchPlaceholder: 'Search citizen by Name or NID...',
            noCitizenFound: 'No citizen found',
            select: 'Select',
            financialYear: 'Financial Year',
            amount: 'Amount (Tk)',
            actions: 'Actions',
            paid: 'Paid',
            taxAlreadyPaid: 'Tax Already Paid',
            paidByFamily: 'Paid by family member:',
            printReceipt: 'Print Receipt',
            confirmPayment: 'Confirm Payment',
            processing: 'Processing...',
            recentPayments: 'Recent Payments',
            refresh: 'Refresh',
            table: {
                receiptNo: 'Receipt No',
                citizen: 'Citizen',
                fy: 'FY',
                amount: 'Amount',
                date: 'Date',
                action: 'Action',
                loading: 'Loading history...',
                noData: 'No payment records found'
            },
            messages: {
                success: 'Tax payment recorded successfully',
                alreadyPaid: 'Already paid for this year',
                error: 'Failed to record payment',
                checkError: 'Failed to check status',
                loadError: 'Failed to load settings'
            }
        },
        reports: {
            title: 'Reports & Analytics',
            subtitle: 'Comprehensive overview of union activities and statistics.',
            totalCitizens: 'Total Citizens',
            totalCertificates: 'Total Certificates',
            pendingRequests: 'Pending Requests',
            issuedTrend: 'Certificates Issued (Last 6 Months)',
            typeDistribution: 'Distribution by Certificate Type',
            noTrendData: 'Not enough data for trend analysis',
            noTypeData: 'No certificates issued yet',
            error: 'Failed to load report data',
            noData: 'No data available'
        },
        settings: {
            title: 'Settings',
            subtitle: 'Manage your dashboard preferences and configuration.',
            tabs: {
                general: 'General',
                organization: 'Organization',
                finance: 'Finance & Tax',
                preferences: 'Preferences',
                account: 'Account'
            },
            save: 'Save Changes',
            saving: 'Saving...',
            systemStatus: 'System Status',
            operational: 'Operational',
            general: {
                siteName: 'Site Name',
                siteNameDesc: 'Appears in the browser tab and dashboard header.',
                adminEmail: 'Admin Email',
                branding: 'Branding',
                unionLogo: 'Union Logo',
                uploadDesc: 'Recommended format: PNG/JPG with transparent background.\nMAX size: 500KB. Used on certificates and reports.'
            },
            organization: {
                unionNameEn: 'Union Name (English)',
                unionNameBn: 'Union Name (Bangla)',
                addressEn: 'Address (English)',
                addressBn: 'Address (Bangla)',
                chairmanEn: 'Chairman Name (English)',
                chairmanBn: 'Chairman Name (Bangla)',
                email: 'Union Email',
                website: 'Union Website'
            },
            finance: {
                taxAmount: 'Annual Tax Amount (Tk)',
                taxAmountDesc: 'Default amount for new yearly payments.',
                enforceTax: 'Enforce Payment for Certificates',
                enforceTaxDesc: 'When enabled, the system will prevent generating certificates for citizens who have not paid holding tax for the current financial year.'
            },
            preferences: {
                appearance: 'Appearance',
                theme: 'Theme',
                light: 'Light Mode',
                dark: 'Dark Mode',
                system: 'System Default',
                language: 'Language',
                notifications: 'Enable Email Notifications'
            },
            account: {
                profileInfo: 'Profile Information',
                fullName: 'Full Name',
                username: 'Username',
                email: 'Email Address',
                updateInfo: 'Update Info',
                emailVerification: 'Email Verification',
                emailChanged: 'Email changed. You must verify to save. Check console for OTP.',
                enterCode: 'Enter Verification Code',
                verifySave: 'Verify & Save',
                verified: 'Verified',
                confirmCode: 'Confirm Code',
                cancel: 'Cancel',
                checkConsole: 'Check your server console/terminal for the 6-digit code.',
                changePassword: 'Change Password',
                currentPassword: 'Current Password',
                newPassword: 'New Password',
                confirmPassword: 'Confirm New Password',
                updating: 'Updating...',
            },
            messages: {
                saved: 'Settings saved successfully',
                failed: 'Failed to save settings',
                profileUpdated: 'Profile information updated',
                passwordChanged: 'Password changed successfully',
                otpSent: 'OTP sent! Check system console.',
                emailVerified: 'Email verified and updated successfully',
                invalidOtp: 'Invalid OTP',
                mismatch: 'New passwords do not match'
            }
        },
        auth: {
            loginTitle: 'Admin Login',
            email: 'Email Address',
            password: 'Password',
            loginButton: 'Sign In',
            loggingIn: 'Signing in...',
            forgotPassword: 'Forgot password?',
            backToHome: 'Back to Home'
        }
    },
    bn: {
        common: {
            unionPortal: 'ইউনিয়ন পোর্টাল',
            officialPortal: 'অফিসিয়াল ইউনিয়ন পোর্টাল',
            adminPanel: 'অ্যাডমিন প্যানেল',
            dashboard: 'ড্যাশবোর্ড',
            welcome: 'স্বাগতম',
            logout: 'লগআউট',
            search: 'অনুসন্ধান...',
            notifications: 'নোটিফিকেশন',
            noNotifications: 'কোনো নোটিফিকেশন নেই',
            markAllRead: 'সবগুলো পড়া হয়েছে',
            bangla: 'বাংলা',
            english: 'English',
        },
        sidebar: {
            overview: 'ওভারভিউ',
            citizens: 'নাগরিক',
            addCitizen: 'নাগরিক যোগ করুন',
            certificates: 'সনদপত্র',
            issueCertificate: 'সনদ প্রদান',
            certificateTypes: 'সনদের ধরণ',
            holdingTax: 'হোল্ডিং ট্যাক্স',
            reports: 'রিপোর্ট',
            settings: 'সেটিংস',
            adminUser: 'অ্যাডমিন ইউজার',
        },
        home: {
            welcomeTitle: 'স্বাগতম',
            unionName: 'কালিকচ্ছ',
            unionSuffix: 'ইউনিয়ন',
            subtitle: 'আপনার ইউনিয়ন সেবার ডিজিটাল মাধ্যম। নাগরিকত্বের জন্য আবেদন করুন, সনদপত্র নিন এবং ট্যাক্স পরিশোধ করুন অনলাইনে—দ্রুত, সহজে এবং নিরাপদে।',
            registerCitizen: 'নাগরিক নিবন্ধন',
            applyCertificate: 'সনদের আবেদন',
            checkStatus: 'অবস্থা যাচাই',
            features: {
                citizenReg: {
                    title: 'নাগরিক নিবন্ধন',
                    desc: 'আমাদের ইউনিয়নের নিবন্ধিত সদস্য হোন। আপনার ডিজিটাল আইডি পান এবং সকল সেবা গ্রহণ করুন।'
                },
                onlineCert: {
                    title: 'অনলাইন সনদপত্র',
                    desc: 'ট্রেড লাইসেন্স, চারিত্রিক সনদ বা ওয়ারিশ সনদের প্রয়োজন? অনলাইনে আবেদন করুন এবং পেয়ে যান।'
                },
                verifyDocs: {
                    title: 'ডকুমেন্ট যাচাই',
                    desc: 'আমাদের ইউনিয়ন দ্বারা ইস্যুকৃত যেকোনো সনদের সত্যতা যাচাই করুন আমাদের অনলাইন টুলের মাধ্যমে।'
                }
            },
            footerRights: 'সর্বস্বত্ব সংরক্ষিত।'
        },
        dashboard: {
            title: 'ড্যাশবোর্ড ওভারভিউ',
            welcomeBack: 'ইউনিয়ন অ্যাডমিন ড্যাশবোর্ডে স্বাগতম। আজকের কার্যক্রম একনজরে দেখে নিন।',
            totalCitizens: 'মোট নাগরিক',
            certificatesIssued: 'ইস্যুকৃত সনদ',
            pendingRequests: 'অপেক্ষমান অনুরোধ',
            revenue: 'রাজস্ব',
            weeklyTrend: 'সাপ্তাহিক নিবন্ধনের ধারা',
            weeklyTrendDesc: 'গত ৭ দিনের নতুন নাগরিক নিবন্ধন',
            monthlyCerts: 'মাসিক সনদপত্র',
            monthlyCertsDesc: 'গত ৬ মাসে ইস্যুকৃত সনদপত্র',
        },
        citizens: {
            title: 'নাগরিক ব্যবস্থাপনা',
            subtitle: 'নিবন্ধিত নাগরিকদের তালিকা দেখুন ও পরিচালনা করুন।',
            add: 'নাগরিক যোগ করুন',
            searchPlaceholder: 'নাম, এনআইডি বা ফোন নম্বর দিয়ে খুঁজুন...',
            tabs: {
                all: 'সকল',
                pending: 'অপেক্ষমান',
                approved: 'অনুমোদিত',
                rejected: 'বাতিলকৃত',
            },
            table: {
                name: 'নাম',
                nid: 'এনআইডি',
                status: 'অবস্থা',
                address: 'ঠিকানা',
                actions: 'পদক্ষেপ',
                loading: 'লোড হচ্ছে...',
                noData: 'কোনো নাগরিক পাওয়া যায়নি।',
            },
            form: {
                title: 'নাগরিক নিবন্ধন',
                personalInfo: 'ব্যক্তিগত তথ্য',
                nameBn: 'নাম (বাংলা)',
                nameEn: 'নাম (ইংরেজি)',
                fatherName: 'পিতার নাম',
                motherName: 'মাতার নাম',
                nid: 'জাতীয় পরিচয়পত্র',
                dob: 'জন্ম তারিখ',
                gender: 'লিঙ্গ',
                phone: 'মোবাইল নম্বর',
                addressInfo: 'ঠিকানা তথ্য',
                village: 'গ্রাম',
                postOffice: 'ডাকঘর',
                ward: 'ওয়ার্ড',
                submit: 'নিবন্ধন করুন',
                success: 'নাগরিক সফলভাবে নিবন্ধিত হয়েছে',
                error: 'নিবন্ধন ব্যর্থ হয়েছে',
            }
        },
        certificates: {
            title: 'সনদপত্রসমূহ',
            subtitle: 'সনদপত্র তৈরি এবং বিতরণ করুন।',
            issue: 'নতুন ইস্যু করুন',
            searchPlaceholder: 'সনদ অনুসন্ধান...',
            tabs: {
                all: 'সকল',
                pending: 'অপেক্ষমান',
                approved: 'অনুমোদিত',
                rejected: 'বাতিলকৃত',
                issued: 'ইস্যুকৃত',
            },
            table: {
                certNo: 'সনদ নং',
                name: 'নাগরিকের নাম',
                type: 'ধরণ',
                date: 'ইস্যু তারিখ',
                status: 'অবস্থা',
                actions: 'পদক্ষেপ',
                loading: 'সনদ লোড হচ্ছে...',
                noData: 'কোনো সনদ পাওয়া যায়নি।',
            },
            issuePage: {
                title: 'সনদ ইস্যু করুন',
                subtitle: 'নাগরিকের জন্য নতুন সনদ তৈরি ও ইস্যু করুন।',
                steps: {
                    selectCitizen: 'নাগরিক নির্বাচন',
                    selectType: 'ধরণ নির্বাচন',
                    review: 'যাচাই ও ইস্যু'
                },
                searchPlaceholder: 'নাম, এনআইডি বা ফোন নম্বর দিয়ে খুঁজুন...',
                chooseType: 'সনদের ধরণ নির্বাচন করুন',
                fee: 'ফি',
                reviewSection: {
                    citizen: 'নাগরিক',
                    certType: 'সনদের ধরণ',
                    totalFee: 'মোট ফি',
                    disclaimer: '"সনদ ইস্যু করুন"-এ ক্লিক করে আপনি নিশ্চিত করছেন যে ফি গ্রহণ করা হয়েছে এবং তথ্য যাচাই করা হয়েছে।',
                    issueBtn: 'সনদ ইস্যু করুন',
                    back: 'ফিরে যান',
                    next: 'পরবর্তী ধাপ',
                    reviewOrder: 'অর্ডার যাচাই করুন'
                },
                success: 'সনদ সফলভাবে ইস্যু করা হয়েছে',
                error: 'সনদ ইস্যু করতে ব্যর্থ হয়েছে'
            },
            types: {
                title: 'সনদের ধরণ',
                subtitle: 'সনদের ক্যাটাগরি এবং ফি ব্যবস্থাপনা করুন।',
                addNew: 'নতুন ধরণ যোগ করুন',
                cancel: 'বাতিল',
                save: 'সেভ করুন',
                table: {
                    nameEn: 'নাম (ইংরেজি)',
                    nameBn: 'নাম (বাংলা)',
                    fee: 'ফি',
                    actions: 'পদক্ষেপ',
                    loading: 'লোড হচ্ছে...',
                    noData: 'কোনো ধরণ পাওয়া যায়নি।'
                },
                form: {
                    nameEn: 'নাম (ইংরেজি)',
                    nameBn: 'নাম (বাংলা)',
                    fee: 'ফি (টাকা)',
                    exampleEn: 'Note: In Bangla form also English example is fine or translate e.g.',
                    exampleBn: 'উদাহরণ: ট্রেড লাইসেন্স'
                },
                messages: {
                    added: 'সনদের ধরণ সফলভাবে যোগ করা হয়েছে',
                    updated: 'সনদের ধরণ আপডেট করা হয়েছে',
                    error: 'সাবমিট করতে ত্রুটি হয়েছে',
                    deleteDisabled: 'নিরাপত্তার স্বার্থে ডিলিট অপশন বর্তমানে বন্ধ আছে।'
                }
            },
        },
        holdingTax: {
            title: 'হোল্ডিং ট্যাক্স',
            subtitle: 'হোল্ডিং ট্যাক্স সংগ্রহ এবং সেটিংস ব্যবস্থাপনা করুন।',
            receivePayment: 'পেমেন্ট গ্রহণ করুন',
            searchPlaceholder: 'নাম বা এনআইডি দ্বারা নাগরিক খুঁজুন...',
            noCitizenFound: 'কোনো নাগরিক পাওয়া যায়নি',
            select: 'নির্বাচন করুন',
            financialYear: 'অর্থবছর',
            amount: 'টাকার পরিমাণ',
            actions: 'পদক্ষেপ',
            paid: 'পরিশোধিত',
            taxAlreadyPaid: 'ট্যাক্স ইতিমধ্যে পরিশোধিত',
            paidByFamily: 'পারিবারিক সদস্য পরিশোধ করেছেন:',
            printReceipt: 'রশিদ প্রিন্ট করুন',
            confirmPayment: 'পেমেন্ট নিশ্চিত করুন',
            processing: 'প্রসেসিং...',
            recentPayments: 'সাম্প্রতিক পেমেন্ট',
            refresh: 'রিফ্রেশ',
            table: {
                receiptNo: 'রশিদ নং',
                citizen: 'নাগরিক',
                fy: 'অর্থবছর',
                amount: 'টাকা',
                date: 'তারিখ',
                action: 'পদক্ষেপ',
                loading: 'ইতিহাস লোড হচ্ছে...',
                noData: 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি'
            },
            messages: {
                success: 'ট্যাক্স পেমেন্ট সফলভাবে রেকর্ড করা হয়েছে',
                alreadyPaid: 'এই বছরের জন্য ইতিমধ্যে পরিশোধিত',
                error: 'পেমেন্ট রেকর্ড করতে ব্যর্থ হয়েছে',
                checkError: 'অবস্থা যাচাই করতে ব্যর্থ হয়েছে',
                loadError: 'সেটিংস লোড করতে ব্যর্থ হয়েছে'
            }
        },
        reports: {
            title: 'রিপোর্ট এবং বিশ্লেষণ',
            subtitle: 'ইউনিয়ন কার্যক্রম এবং পরিসংখ্যানের বিস্তারিত ওভারভিউ।',
            totalCitizens: 'মোট নাগরিক',
            totalCertificates: 'মোট সনদপত্র',
            pendingRequests: 'অপেক্ষমান অনুরোধ',
            issuedTrend: 'ইস্যুকৃত সনদ (গত ৬ মাস)',
            typeDistribution: 'সনদের ধরণ অনুযায়ী বিভাজন',
            noTrendData: 'ট্রেন্ড বিশ্লেষণের জন্য পর্যাপ্ত তথ্য নেই',
            noTypeData: 'এখনও কোনো সনদ ইস্যু করা হয়নি',
            error: 'রিপোর্ট লোড করতে ব্যর্থ হয়েছে',
            noData: 'কোনো তথ্য উপলব্ধ নেই'
        },
        settings: {
            title: 'সেটিংস',
            subtitle: 'ড্যাশবোর্ড পছন্দ এবং কনফিগারেশন ব্যবস্থাপনা করুন।',
            tabs: {
                general: 'সাধারণ',
                organization: 'প্রতিষ্ঠান',
                finance: 'অর্থ ও কর',
                preferences: 'পছন্দসমূহ',
                account: 'অ্যাকাউন্ট'
            },
            save: 'পরিবর্তন সেভ করুন',
            saving: 'সেভ হচ্ছে...',
            systemStatus: 'সিস্টেম স্ট্যাটাস',
            operational: 'সচল',
            general: {
                siteName: 'সাইটের নাম',
                siteNameDesc: 'ব্রাউজার ট্যাব এবং ড্যাশবোর্ড হেডারে প্রদর্শিত হয়।',
                adminEmail: 'অ্যাডমিন ইমেইল',
                branding: 'ব্র্যান্ডিং',
                unionLogo: 'ইউনিয়ন লোগো',
                uploadDesc: 'সুপারিশকৃত ফরম্যাট: পিএনজি/জেপিজি (ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড)।\nসর্বোচ্চ সাইজ: ৫০০কেবি। সনদ ও রিপোর্টে ব্যবহৃত হবে।'
            },
            organization: {
                unionNameEn: 'ইউনিয়ন নাম (ইংরেজি)',
                unionNameBn: 'ইউনিয়ন নাম (বাংলা)',
                addressEn: 'ঠিকানা (ইংরেজি)',
                addressBn: 'ঠিকানা (বাংলা)',
                chairmanEn: 'চেয়ারম্যানের নাম (ইংরেজি)',
                chairmanBn: 'চেয়ারম্যানের নাম (বাংলা)',
                email: 'ইউনিয়ন ইমেইল',
                website: 'ইউনিয়ন ওয়েবসাইট'
            },
            finance: {
                taxAmount: 'বার্ষিক করের পরিমাণ (টাকা)',
                taxAmountDesc: 'নতুন বাৎসরিক পেমেন্টের জন্য ডিফল্ট পরিমাণ।',
                enforceTax: 'সনদের জন্য ট্যাক্স পেমেন্ট বাধ্যতামূলক করুন',
                enforceTaxDesc: 'চালু থাকলে, চলতি অর্থবছরের হোল্ডিং ট্যাক্স পরিশোধ না করা নাগরিকদের সনদ তৈরি করতে বাধা দেবে সিস্টেম।'
            },
            preferences: {
                appearance: 'দৃশ্যমানতা',
                theme: 'থিম',
                light: 'লাইট মোড',
                dark: 'ডার্ক মোড',
                system: 'সিস্টেম ডিফল্ট',
                language: 'ভাষা',
                notifications: 'ইমেইল নোটিফিকেশন চালু করুন'
            },
            account: {
                profileInfo: 'প্রোফাইল তথ্য',
                fullName: 'পূর্ণ নাম',
                username: 'ইউজারনেম',
                email: 'ইমেইল ঠিকানা',
                updateInfo: 'তথ্য আপডেট করুন',
                emailVerification: 'ইমেইল যাচাইকরণ',
                emailChanged: 'ইমেইল পরিবর্তিত হয়েছে। সেভ করতে যাচাই প্রয়োজন। ওটিপি দেখুন।',
                enterCode: 'যাচাইকরণ কোড লিখুন',
                verifySave: 'যাচাই ও সেভ',
                verified: 'যাচাইকৃত',
                confirmCode: 'কোড নিশ্চিত করুন',
                cancel: 'বাতিল',
                checkConsole: '৬-সংখ্যার কোডের জন্য সার্ভার কনসোল/টার্মিনাল দেখুন।',
                changePassword: 'পাসওয়ার্ড পরিবর্তন',
                currentPassword: 'বর্তমান পাসওয়ার্ড',
                newPassword: 'নতুন পাসওয়ার্ড',
                confirmPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
                updating: 'আপডেট হচ্ছে...',
            },
            messages: {
                saved: 'সেটিংস সফলভাবে সেভ করা হয়েছে',
                failed: 'সেটিংস সেভ করতে ব্যর্থ',
                profileUpdated: 'প্রোফাইল তথ্য আপডেট করা হয়েছে',
                passwordChanged: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে',
                otpSent: 'ওটিপি পাঠানো হয়েছে! সিস্টেম কনসোল চেক করুন।',
                emailVerified: 'ইমেইল যাচাই এবং আপডেট সফল হয়েছে',
                invalidOtp: 'ভুল ওটিপি',
                mismatch: 'নতুন পাসওয়ার্ড মিলছে না'
            }
        },
        auth: {
            loginTitle: 'অ্যাডমিন লগইন',
            email: 'ইমেইল ঠিকানা',
            password: 'পাসওয়ার্ড',
            loginButton: 'লগইন',
            loggingIn: 'লগইন হচ্ছে...',
            forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
            backToHome: 'হোমে ফিরে যান'
        }
    }
};

export type Language = 'en' | 'bn';
export type Translation = typeof translations.en;
