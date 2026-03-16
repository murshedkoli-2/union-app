import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CertificateType from '@/models/CertificateType';

export async function GET() {
    try {
        await dbConnect();
        // Seed default types if empty
        const count = await CertificateType.countDocuments();
        const defaultTypes = [
                {
                    name: 'Citizenship',
                    nameBn: 'নাগরিকত্ব সনদ',
                    bodyTextEn: 'He/She is a permanent resident of this Union Parishad area. To the best of my knowledge and belief, he/she is a loyal and law-abiding citizen of the People\'s Republic of Bangladesh. I wish him/her all success in life.',
                    bodyTextBn: 'তিনি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা। আমার জানামতে তিনি গণপ্রজাতন্ত্রী বাংলাদেশের একজন আইনানুগ ও বিশ্বস্ত নাগরিক। আমি তাঁর সর্বাঙ্গীণ মঙ্গল কামনা করি।'
                },
                {
                    name: 'Character',
                    nameBn: 'চারিত্রিক সনদ',
                    bodyTextEn: 'He/She is a permanent resident of this Union Parishad area. To the best of my knowledge and belief, he/she bears a good moral character. He/She has not been involved in any criminal or anti-social activities. I wish him/her all success in life.',
                    bodyTextBn: 'তিনি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা। আমার জানামতে তিনি সচ্চরিত্রের অধিকারী। তিনি কোনো ফৌজদারি বা সমাজবিরোধী কার্যকলাপে জড়িত নহেন। আমি তাঁর সর্বাঙ্গীণ মঙ্গল কামনা করি।'
                },
                {
                    name: 'Trade License',
                    nameBn: 'ট্রেড লাইসেন্স',
                    bodyTextEn: 'Permission is hereby granted to carry on the trade/business mentioned above within the jurisdiction of this Union Parishad for the current financial year subject to the conditions mentioned in the Trade License rules. This license is not transferable and must be renewed annually.',
                    bodyTextBn: 'চলতি আর্থিক বারের জন্য অত্র ইউনিয়ন পরিষদের এখতিয়ারভুক্ত এলাকায় উপরেউল্লিখিত ব্যবসা/পেশা পরিচালনার অনুমতি প্রদান করা হইল। এই লাইসেন্স হস্তান্তরযোগ্য নহে এবং প্রতিবছর নবায়নযোগ্য।'
                },
                {
                    name: 'Warish',
                    nameBn: 'ওয়ারিশ সনদ',
                    bodyTextEn: 'After due inquiry and verification, it has been ascertained that the above-mentioned deceased person was a permanent resident of this Union Parishad area and the persons listed above are the legal heirs (warish) of the deceased. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত মৃত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা ছিলেন এবং উপরে বর্ণিত ব্যক্তিগণ তাঁর বৈধ ওয়ারিশ। আবেদনক্রমে তাঁহাদের ওয়ারিশ সনদ প্রদান করা হইল।'
                },
                {
                    name: 'Heirship',
                    nameBn: 'উত্তরাধিকার সনদ',
                    bodyTextEn: 'After due inquiry and verification, it has been ascertained that the above-mentioned deceased person was a permanent resident of this Union Parishad area and the persons listed above are the legal successors/heirs of the deceased. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত মৃত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা ছিলেন এবং উপরে বর্ণিত ব্যক্তিগণ তাঁর বৈধ উত্তরাধিকারী। আবেদনক্রমে তাঁহাদের উত্তরাধিকার সনদ প্রদান করা হইল।'
                },
                {
                    name: 'Family Certificate',
                    nameBn: 'পারিবারিক সনদ',
                    bodyTextEn: 'After due inquiry and verification, the above-mentioned person is a permanent resident of this Union Parishad area and the persons listed above are confirmed members of his/her family. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা এবং উপরে বর্ণিত ব্যক্তিগণ তাঁহার পরিবারের সদস্য হিসেবে নিশ্চিত হওয়া গিয়াছে। আবেদনক্রমে পারিবারিক সনদ প্রদান করা হইল।'
                },
                {
                    name: 'Landless',
                    nameBn: 'ভূমিহীন সনদ',
                    bodyTextEn: 'After due inquiry it has been ascertained that the above-named person does not own any agricultural or non-agricultural land within this Union or elsewhere. The person is genuinely landless and earns a livelihood through daily labor/small trade. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন বা অন্য কোথাও কোনো কৃষি বা অকৃষি জমির মালিক নহেন। তিনি একজন প্রকৃত ভূমিহীন ব্যক্তি এবং দিনমজুরি/ক্ষুদ্র ব্যবসার মাধ্যমে জীবিকা নির্বাহ করেন। আবেদনক্রমে তাঁহার ভূমিহীন সনদ প্রদান করা হইল।'
                }
                ,
                {
                    name: 'Disability',
                    nameBn: 'প্রতিবন্ধী সনদ',
                    bodyTextEn: 'After due inquiry it has been ascertained that the above-named person is a person with disability. The nature of disability is mentioned above. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি একজন প্রতিবন্ধী ব্যক্তি। তাঁহার প্রতিবন্ধিতার ধরন উপরে উল্লেখ করা হইয়াছে। আবেদনক্রমে তাঁহার প্রতিবন্ধী সনদ প্রদান করা হইল।'
                }
            ];
        if (count === 0) {
            await CertificateType.insertMany(defaultTypes);
        } else {
            // Backfill body text for existing types that don't have it
            const defaultBodyTexts: Record<string, { bodyTextEn: string; bodyTextBn: string }> = {
                'Citizenship': {
                    bodyTextEn: 'He/She is a permanent resident of this Union Parishad area. To the best of my knowledge and belief, he/she is a loyal and law-abiding citizen of the People\'s Republic of Bangladesh. I wish him/her all success in life.',
                    bodyTextBn: 'তিনি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা। আমার জানামতে তিনি গণপ্রজাতন্ত্রী বাংলাদেশের একজন আইনানুগ ও বিশ্বস্ত নাগরিক। আমি তাঁর সর্বাঙ্গীণ মঙ্গল কামনা করি।'
                },
                'Character': {
                    bodyTextEn: 'He/She is a permanent resident of this Union Parishad area. To the best of my knowledge and belief, he/she bears a good moral character. He/She has not been involved in any criminal or anti-social activities. I wish him/her all success in life.',
                    bodyTextBn: 'তিনি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা। আমার জানামতে তিনি সচ্চরিত্রের অধিকারী। তিনি কোনো ফৌজদারি বা সমাজবিরোধী কার্যকলাপে জড়িত নহেন। আমি তাঁর সর্বাঙ্গীণ মঙ্গল কামনা করি।'
                },
                'Trade License': {
                    bodyTextEn: 'Permission is hereby granted to carry on the trade/business mentioned above within the jurisdiction of this Union Parishad for the current financial year subject to the conditions mentioned in the Trade License rules. This license is not transferable and must be renewed annually.',
                    bodyTextBn: 'চলতি আর্থিক বারের জন্য অত্র ইউনিয়ন পরিষদের এখতিয়ারভুক্ত এলাকায় উপরেউল্লিখিত ব্যবসা/পেশা পরিচালনার অনুমতি প্রদান করা হইল। এই লাইসেন্স হস্তান্তরযোগ্য নহে এবং প্রতিবছর নবায়নযোগ্য।'
                },
                'Warish': {
                    bodyTextEn: 'After due inquiry and verification, it has been ascertained that the above-mentioned deceased person was a permanent resident of this Union Parishad area and the persons listed above are the legal heirs (warish) of the deceased. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত মৃত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা ছিলেন এবং উপরে বর্ণিত ব্যক্তিগণ তাঁর বৈধ ওয়ারিশ। আবেদনক্রমে তাঁহাদের ওয়ারিশ সনদ প্রদান করা হইল।'
                },
                'Heirship': {
                    bodyTextEn: 'After due inquiry and verification, it has been ascertained that the above-mentioned deceased person was a permanent resident of this Union Parishad area and the persons listed above are the legal successors/heirs of the deceased. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত মৃত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা ছিলেন এবং উপরে বর্ণিত ব্যক্তিগণ তাঁর বৈধ উত্তরাধিকারী। আবেদনক্রমে তাঁহাদের উত্তরাধিকার সনদ প্রদান করা হইল।'
                },
                'Family Certificate': {
                    bodyTextEn: 'After due inquiry and verification, the above-mentioned person is a permanent resident of this Union Parishad area and the persons listed above are confirmed members of his/her family. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন পরিষদ এলাকার স্থায়ী বাসিন্দা এবং উপরে বর্ণিত ব্যক্তিগণ তাঁহার পরিবারের সদস্য হিসেবে নিশ্চিত হওয়া গিয়াছে। আবেদনক্রমে পারিবারিক সনদ প্রদান করা হইল।'
                },
                'Landless': {
                    bodyTextEn: 'After due inquiry it has been ascertained that the above-named person does not own any agricultural or non-agricultural land within this Union or elsewhere. The person is genuinely landless and earns a livelihood through daily labor/small trade. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি অত্র ইউনিয়ন বা অন্য কোথাও কোনো কৃষি বা অকৃষি জমির মালিক নহেন। তিনি একজন প্রকৃত ভূমিহীন ব্যক্তি এবং দিনমজুরি/ক্ষুদ্র ব্যবসার মাধ্যমে জীবিকা নির্বাহ করেন। আবেদনক্রমে তাঁহার ভূমিহীন সনদ প্রদান করা হইল।'
                },
                'Disability': {
                    bodyTextEn: 'After due inquiry it has been ascertained that the above-named person is a person with disability. The nature of disability is mentioned above. This certificate is issued upon request for lawful purposes.',
                    bodyTextBn: 'সরেজমিনে তদন্ত ও অনুসন্ধানে জানা যায় যে, উপরোক্ত ব্যক্তি একজন প্রতিবন্ধী ব্যক্তি। তাঁহার প্রতিবন্ধিতার ধরন উপরে উল্লেখ করা হইয়াছে। আবেদনক্রমে তাঁহার প্রতিবন্ধী সনদ প্রদান করা হইল।'
                },
            };
            for (const [name, texts] of Object.entries(defaultBodyTexts)) {
                await CertificateType.updateMany(
                    { name, $or: [{ bodyTextEn: { $exists: false } }, { bodyTextEn: '' }, { bodyTextEn: null }] },
                    { $set: texts }
                );
            }
            // Insert any missing default types
            for (const dt of defaultTypes) {
                const exists = await CertificateType.findOne({ name: dt.name });
                if (!exists) {
                    await CertificateType.create(dt);
                }
            }
        }

        const types = await CertificateType.find().sort({ name: 1 });
        return NextResponse.json(types);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch certificate types' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (!body.name || !body.nameBn) {
            return NextResponse.json({ error: 'Name (En) and Name (Bn) are required' }, { status: 400 });
        }

        const newType = await CertificateType.create({
            name: body.name,
            nameBn: body.nameBn,
            bodyTextEn: body.bodyTextEn,
            bodyTextBn: body.bodyTextBn,
            fee: body.fee || 0
        });
        return NextResponse.json(newType, { status: 201 });
    } catch (error: unknown) {
        const dbError = error as { code?: number };
        if (dbError.code === 11000) {
            return NextResponse.json({ error: 'Certificate type already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create certificate type' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updates } = body;

        if (!_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updatedType = await CertificateType.findByIdAndUpdate(
            _id,
            { $set: updates },
            { new: true }
        );

        if (!updatedType) {
            return NextResponse.json({ error: 'Certificate type not found' }, { status: 404 });
        }

        return NextResponse.json(updatedType);
    } catch {
        return NextResponse.json({ error: 'Failed to update certificate type' }, { status: 500 });
    }
}
