import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

type ModalType = 'privacy' | 'terms' | 'safety' | 'contact' | 'disclaimer' | 'language' | null;

interface CityMetadata {
  cityHindi: string;
  cityEnglish: string;
  taglineHindi: string;
  taglineEnglish: string;
  rtoCode: string;
  officeAddress: string;
  officeAddressEnglish: string;
  helplinePhone: string;
  helplineEmail: string;
  workingHours: string;
  workingHoursEnglish: string;
  prominentAreas: string[];
  disclaimerHighlight: string;
  disclaimerHighlightEnglish: string;
  emergencyHelpline: string;
}

const CITY_METADATA_MAP: Record<string, CityMetadata> = {
  rewa: {
    cityHindi: 'रीवा',
    cityEnglish: 'Rewa',
    taglineHindi: 'विंध्य का विश्वसनीय व मुख्य लोकल मार्केटप्लेस',
    taglineEnglish: "Vindhya's Trusted Hyperlocal Marketplace",
    rtoCode: 'MP-17 (रीवा)',
    officeAddress: 'शिल्पी प्लाजा ब्लॉक-बी, सिविल लाइन्स, रीवा, म.प्र. 486001',
    officeAddressEnglish: 'Shilpi Plaza Block-B, Civil Lines, Rewa, MP 486001',
    helplinePhone: '+91 7662 254890 / 98270 41239',
    helplineEmail: 'support.rewa@rewabazaar.in',
    workingHours: 'सोमवार - शनिवार: 9:00 AM - 8:00 PM',
    workingHoursEnglish: 'Mon - Sat: 9:00 AM - 8:00 PM',
    prominentAreas: ['शिल्पी प्लाजा', 'सिविल लाइन्स', 'समान नाका', 'सिरमौर', 'गुढ़', 'गोविंदगढ़', 'मनगवां', 'चोरहटा', 'अनंतपुर'],
    disclaimerHighlight: 'रीवा जिले (MP-17) में सभी प्रकार के दोपहिया, चारपहिया व प्रॉपर्टी सौदों के लिए व्यक्तिगत शारीरिक जांच, MP Transport RTO पोर्टल पर स्मार्ट आरसी व चालान जांच अनिवार्य रूप से करें। मिलने के लिए सिरमौर चौक या शिल्पी प्लाजा जैसे सुरक्षित स्थान चुनें।',
    disclaimerHighlightEnglish: 'In Rewa district (MP-17), inspect vehicles and properties in person. Verify Smart RC & challan on MP Transport RTO portal. Choose public meetups like Shilpi Plaza or Sirmour Chauraha.',
    emergencyHelpline: '112 (MP Police) / 100 रीवा कंट्रोल रूम',
  },
  satna: {
    cityHindi: 'सतना',
    cityEnglish: 'Satna',
    taglineHindi: 'सीमेंट सिटी व विंध्य का प्रमुख व्यापारिक केंद्र',
    taglineEnglish: 'Cement City & Major Vindhya Commercial Trading Hub',
    rtoCode: 'MP-19 (सतना)',
    officeAddress: 'सर्किट हाउस चौराहा, स्टेशन रोड, सतना, म.प्र. 485001',
    officeAddressEnglish: 'Circuit House Chowk, Station Road, Satna, MP 485001',
    helplinePhone: '+91 7672 234120 / 98270 41239',
    helplineEmail: 'support.satna@rewabazaar.in',
    workingHours: 'सोमवार - शनिवार: 9:00 AM - 8:30 PM',
    workingHoursEnglish: 'Mon - Sat: 9:00 AM - 8:30 PM',
    prominentAreas: ['सर्किट हाउस', 'पतेरी', 'मुख्त्यारगंज', 'सेमरिया चौक', 'उचेहरा', 'नागौद', 'अमरपाटन', 'कोठी', 'सोहावल'],
    disclaimerHighlight: 'सतना जिले (MP-19) में किसी भी अज्ञात व्यक्ति को ऑनलाइन यूपीआई या टोकन मनी न भेजें। सर्किट हाउस या स्टेशन रोड जैसी व्यस्त सार्वजनिक जगहों पर ही मिलें और कागजात जांचें।',
    disclaimerHighlightEnglish: 'Never send advance token payments to strangers in Satna (MP-19). Meet in busy spots like Circuit House or Station Road.',
    emergencyHelpline: '112 / सतना सिटी कोतवाली',
  },
  maihar: {
    cityHindi: 'मैहर',
    cityEnglish: 'Maihar',
    taglineHindi: 'माँ शारदा धाम व नवगठित जिला स्थानीय मार्केट',
    taglineEnglish: 'Maa Sharda Dham & Newly Formed District Local Market',
    rtoCode: 'MP-19 / MP-71 (मैहर)',
    officeAddress: 'घंटाघर चौक, स्टेशन रोड, मैहर, म.प्र. 485771',
    officeAddressEnglish: 'Ghantaghar Chowk, Station Road, Maihar, MP 485771',
    helplinePhone: '+91 7674 231500 / 98270 41239',
    helplineEmail: 'support.maihar@rewabazaar.in',
    workingHours: 'सोमवार - शनिवार: 8:30 AM - 8:30 PM',
    workingHoursEnglish: 'Mon - Sat: 8:30 AM - 8:30 PM',
    prominentAreas: ['घंटाघर चौक', 'सरला नगर', 'बदेरा', 'मैहर धाम', 'स्टेशन रोड', 'अमदरा', 'बदनपुर'],
    disclaimerHighlight: 'मैहर जिले में सुरक्षित स्थानीय लेनदेन हेतु शारदा धाम चौक व स्टेशन रोड पर सीधे खरीदार-विक्रेता मुलाकात और वाहन के दस्तावेजों का सत्यापन आवश्यक है।',
    disclaimerHighlightEnglish: 'Verify paper ownership directly at Sharda Dham Chowk or Station Road in Maihar district.',
    emergencyHelpline: '112 / मैहर पुलिस थाना',
  },
  sidhi: {
    cityHindi: 'सीधी',
    cityEnglish: 'Sidhi',
    taglineHindi: 'सीधी-सिंगरौली विंध्य अंचल का भरोसेमंद बाज़ार',
    taglineEnglish: "Sidhi & Vindhya Region's Trusted Local Market",
    rtoCode: 'MP-53 (सीधी)',
    officeAddress: 'सम्राट चौक, हॉस्पिटल रोड, सीधी, म.प्र. 486661',
    officeAddressEnglish: 'Samrat Chowk, Hospital Road, Sidhi, MP 486661',
    helplinePhone: '+91 7822 252110 / 98270 41239',
    helplineEmail: 'support.sidhi@rewabazaar.in',
    workingHours: 'सोमवार - शनिवार: 9:00 AM - 7:30 PM',
    workingHoursEnglish: 'Mon - Sat: 9:00 AM - 7:30 PM',
    prominentAreas: ['सम्राट चौक', 'मड़वास', 'चुरहट', 'मझौली', 'सिहावल', 'रामपुर नैकिन', 'बहरी'],
    disclaimerHighlight: 'सीधी जिले (MP-53) में वाहन RTO स्वामित्व, ट्रैक्टर व कृषि यंत्रों के मूल दस्तावेज शारीरिक रूप से मिलकर जांचें।',
    disclaimerHighlightEnglish: 'Verify tractor, agricultural and vehicle ownership in person across Sidhi (MP-53).',
    emergencyHelpline: '112 / सीधी कोतवाली',
  },
  mauganj: {
    cityHindi: 'मऊगंज',
    cityEnglish: 'Mauganj',
    taglineHindi: 'मऊगंज नवगठित जिला व हनुमना-देवतालाब स्थानीय बाज़ार',
    taglineEnglish: 'Mauganj District & Hanumana-Devtalab Hyperlocal Market',
    rtoCode: 'MP-17 / मऊगंज जिला',
    officeAddress: 'बस स्टैंड रोड, कलेक्ट्रेट मार्ग, मऊगंज, म.प्र. 486331',
    officeAddressEnglish: 'Bus Stand Road, Collectorate Marg, Mauganj, MP 486331',
    helplinePhone: '+91 7663 241020 / 98270 41239',
    helplineEmail: 'support.mauganj@rewabazaar.in',
    workingHours: 'सोमवार - शनिवार: 9:00 AM - 7:30 PM',
    workingHoursEnglish: 'Mon - Sat: 9:00 AM - 7:30 PM',
    prominentAreas: ['मऊगंज कस्बा', 'हनुमना', 'देवतालाब', 'नईगढ़ी', 'खटखरी', 'शाहपुर', 'पहाड़ी'],
    disclaimerHighlight: 'मऊगंज जिले के ग्रामीण व शहरी क्षेत्र में शून्य दलाली पर सीधा स्थानीय क्रय-विक्रय। किसी भी अनजान सेलर को एडवांस न दें।',
    disclaimerHighlightEnglish: 'Zero-brokerage direct trading in Mauganj district. Do not send token money without physical verification.',
    emergencyHelpline: '112 / मऊगंज थाना',
  },
  bhopal: {
    cityHindi: 'भोपाल',
    cityEnglish: 'Bhopal',
    taglineHindi: 'राजधानी म.प्र. स्मार्ट क्लासिफाइड हब',
    taglineEnglish: 'MP Capital City Smart Classifieds Marketplace',
    rtoCode: 'MP-04 (भोपाल)',
    officeAddress: 'एमपी नगर ज़ोन-2, डीबी मॉल के पास, भोपाल, म.प्र. 462011',
    officeAddressEnglish: 'MP Nagar Zone-2, Near DB Mall, Bhopal, MP 462011',
    helplinePhone: '+91 755 2781400 / 98270 41239',
    helplineEmail: 'support.bhopal@rewabazaar.in',
    workingHours: 'प्रतिदिन: 9:00 AM - 9:00 PM',
    workingHoursEnglish: 'Daily: 9:00 AM - 9:00 PM',
    prominentAreas: ['एमपी नगर', 'न्यू मार्केट', 'अरेरा कॉलोनी', 'कोलार', 'बैरागढ़', 'होशंगाबाद रोड', 'अयोध्या बायपास'],
    disclaimerHighlight: 'भोपाल (MP-04) में सभी लेनदेन सार्वजनिक स्थलों पर करें। ऑनलाइन पेमेंट क्यूआर कोड या अनजान लिंक से बचें।',
    disclaimerHighlightEnglish: 'Trade in public locations in Bhopal (MP-04). Avoid random QR code payment requests.',
    emergencyHelpline: '112 / 100 भोपाल पुलिस',
  },
  jabalpur: {
    cityHindi: 'जबलपुर',
    cityEnglish: 'Jabalpur',
    taglineHindi: 'संस्कारधानी व महाकोशल ट्रेड हब',
    taglineEnglish: 'Sanskardhani & Mahakoshal Commerce Hub',
    rtoCode: 'MP-20 (जबलपुर)',
    officeAddress: 'सिविक सेंटर, मढ़ताल, जबलपुर, म.प्र. 482002',
    officeAddressEnglish: 'Civic Centre, Marhatal, Jabalpur, MP 482002',
    helplinePhone: '+91 761 2450890 / 98270 41239',
    helplineEmail: 'support.jabalpur@rewabazaar.in',
    workingHours: 'प्रतिदिन: 9:00 AM - 8:30 PM',
    workingHoursEnglish: 'Daily: 9:00 AM - 8:30 PM',
    prominentAreas: ['सिविक सेंटर', 'राइट टाउन', 'रसेल चौक', 'अधारताल', 'गोरखपुर', 'विजय नगर', 'गढ़ा'],
    disclaimerHighlight: 'जबलपुर (MP-20) संभाग में RTO कागजात व प्रॉपर्टी की रजिस्ट्री जांच अनिवार्य रूप से करें।',
    disclaimerHighlightEnglish: 'Verify MP-20 vehicle papers and registry documents in person in Jabalpur.',
    emergencyHelpline: '112 / 100 जबलपुर कंट्रोल रूम',
  },
  indore: {
    cityHindi: 'इंदौर',
    cityEnglish: 'Indore',
    taglineHindi: 'मालवा कमर्शियल हब व डिजिटल बाज़ार',
    taglineEnglish: 'Malwa Commercial Hub & Digital Marketplace',
    rtoCode: 'MP-09 (इंदौर)',
    officeAddress: 'विजय नगर चौराहा, एबी रोड, इंदौर, म.प्र. 452010',
    officeAddressEnglish: 'Vijay Nagar Square, AB Road, Indore, MP 452010',
    helplinePhone: '+91 731 2549100 / 98270 41239',
    helplineEmail: 'support.indore@rewabazaar.in',
    workingHours: 'प्रतिदिन: 9:00 AM - 9:00 PM',
    workingHoursEnglish: 'Daily: 9:00 AM - 9:00 PM',
    prominentAreas: ['विजय नगर', 'पलासिया', 'राजवाड़ा', 'भंवरकुआं', 'अन्नपूर्णा', 'सुपर कॉरिडोर', 'बंगाली चौराहा'],
    disclaimerHighlight: 'इंदौर (MP-09) में सुरक्षित डिलीवरी व प्रत्यक्ष सत्यापन के बाद ही ऑनलाइन भुगतान करें।',
    disclaimerHighlightEnglish: 'Ensure physical verification before paying online across Indore (MP-09).',
    emergencyHelpline: '112 / इंदौर कमिश्नरेट',
  },
};

// Helper function to resolve localized city metadata
function getCityMetadata(rawLocation: string): CityMetadata {
  const normalized = (rawLocation || 'rewa').toLowerCase().trim();

  for (const key of Object.keys(CITY_METADATA_MAP)) {
    if (normalized.includes(key)) {
      return CITY_METADATA_MAP[key];
    }
  }

  // Hindi name checks
  if (normalized.includes('रीवा')) return CITY_METADATA_MAP.rewa;
  if (normalized.includes('सतना')) return CITY_METADATA_MAP.satna;
  if (normalized.includes('मैहर')) return CITY_METADATA_MAP.maihar;
  if (normalized.includes('सीधी')) return CITY_METADATA_MAP.sidhi;
  if (normalized.includes('मऊगंज')) return CITY_METADATA_MAP.mauganj;
  if (normalized.includes('भोपाल')) return CITY_METADATA_MAP.bhopal;
  if (normalized.includes('जबलपुर')) return CITY_METADATA_MAP.jabalpur;
  if (normalized.includes('इंदौर')) return CITY_METADATA_MAP.indore;

  // Fallback for custom user-entered city
  const cleanCity = rawLocation.split(',')[0].trim() || 'रीवा';
  return {
    cityHindi: cleanCity,
    cityEnglish: cleanCity,
    taglineHindi: `${cleanCity} का भरोसेमंद स्थानीय ऑनलाइन मार्केट`,
    taglineEnglish: `Trusted Hyperlocal Online Marketplace in ${cleanCity}`,
    rtoCode: `स्थानीय RTO (${cleanCity})`,
    officeAddress: `मुख्य बाज़ार सेवा केंद्र व सहायता डेस्क, ${cleanCity}, मध्य प्रदेश`,
    officeAddressEnglish: `Main Bazaar Service Center & Support Desk, ${cleanCity}, MP`,
    helplinePhone: '+91 98270 41239 / 1800-202-4890',
    helplineEmail: `support.${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '') || 'local'}@rewabazaar.in`,
    workingHours: 'सोमवार - शनिवार: 9:00 AM - 8:00 PM',
    workingHoursEnglish: 'Mon - Sat: 9:00 AM - 8:00 PM',
    prominentAreas: [cleanCity, 'मुख्य बाज़ार', 'स्टेशन रोड', 'सिविल क्षेत्र', 'नया बस स्टैंड', 'आसपास के उपनगर'],
    disclaimerHighlight: `${cleanCity} क्षेत्र में सामान लेने से पहले व्यक्तिगत प्रत्यक्ष जांच व सार्वजनिक जगह पर ही भुगतान करें।`,
    disclaimerHighlightEnglish: `Inspect items in person and conduct transactions in public spots across ${cleanCity}.`,
    emergencyHelpline: '112 (राष्ट्रीय आपातकालीन सेवा)',
  };
}

interface LanguageOption {
  code: 'hi' | 'en' | 'bg' | 'bk' | 'bh' | 'cg' | 'mr';
  nameNative: string;
  nameEnglish: string;
  region: string;
  status: 'active' | 'upcoming';
  flag: string;
}

const LANGUAGES_LIST: LanguageOption[] = [
  {
    code: 'hi',
    nameNative: 'हिंदी (Hindi)',
    nameEnglish: 'Hindi',
    region: 'मध्य प्रदेश व उत्तर भारत की मुख्य भाषा',
    status: 'active',
    flag: '🇮🇳',
  },
  {
    code: 'en',
    nameNative: 'English',
    nameEnglish: 'English',
    region: 'Global & Business Language',
    status: 'active',
    flag: '🇬🇧',
  },
  {
    code: 'bg',
    nameNative: 'बघेली (Bagheli)',
    nameEnglish: 'Bagheli',
    region: 'विंध्य अंचल (रीवा, सतना, सीधी, मऊगंज)',
    status: 'upcoming',
    flag: '🏛️',
  },
  {
    code: 'bk',
    nameNative: 'बुंदेली (Bundelkhandi)',
    nameEnglish: 'Bundeli',
    region: 'बुंदेलखंड अंचल (पन्ना, छतरपुर, सागर)',
    status: 'upcoming',
    flag: '🏰',
  },
  {
    code: 'bh',
    nameNative: 'भोजपुरी (Bhojpuri)',
    nameEnglish: 'Bhojpuri',
    region: 'पूर्वांचल व सीमांत क्षेत्र',
    status: 'upcoming',
    flag: '🌾',
  },
  {
    code: 'cg',
    nameNative: 'छत्तीसगढ़ी (Chhattisgarhi)',
    nameEnglish: 'Chhattisgarhi',
    region: 'मध्य व पूर्वी क्षेत्रीय अंचल',
    status: 'upcoming',
    flag: '🌳',
  },
  {
    code: 'mr',
    nameNative: 'मराठी (Marathi)',
    nameEnglish: 'Marathi',
    region: 'महाराष्ट्र व सीमावर्ती मध्य भारत',
    status: 'upcoming',
    flag: '🚩',
  },
];

export const Footer: React.FC = () => {
  const {
    showToast,
    navigateTo,
    location,
    setLocation,
    language,
    setLanguage,
    currentUser,
    savedAccounts,
    switchUserAccount,
    openAuthModal,
    openEditProfileModal,
    isAdmin,
    submitSupportMessage,
  } = useApp();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState<'contact_support' | 'help' | 'feedback' | 'bug_report' | 'suggestion'>('contact_support');
  const [contactRating, setContactRating] = useState<number>(5);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Custom city input state in footer
  const [isChangingCity, setIsChangingCity] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');

  // Dynamically resolve city information based on active location state
  const cityInfo = getCityMetadata(location);

  const isEn = language === 'en';

  // Quick switch popular cities
  const popularCities = [
    { label: 'रीवा (Rewa)', value: 'Rewa' },
    { label: 'सतना (Satna)', value: 'Satna' },
    { label: 'मैहर (Maihar)', value: 'Maihar' },
    { label: 'सीधी (Sidhi)', value: 'Sidhi' },
    { label: 'मऊगंज (Mauganj)', value: 'Mauganj' },
    { label: 'भोपाल (Bhopal)', value: 'Bhopal' },
    { label: 'जबलपुर (Jabalpur)', value: 'Jabalpur' },
    { label: 'इंदौर (Indore)', value: 'Indore' },
  ];

  const handleApplyCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    const clean = customCityInput.trim();
    setLocation(clean);
    setIsChangingCity(false);
    setCustomCityInput('');
    showToast(isEn ? `📍 Location updated: ${clean}` : `📍 लोकेशन अपडेट: ${clean} (निचली जानकारी बदल गई)`);
  };

  const handleSelectPopularCity = (val: string) => {
    setLocation(val);
    showToast(isEn ? `📍 Location switched to: ${val}` : `📍 लोकेशन बदली: ${val}`);
  };

  // Sync with user's account registered location
  const handleSyncAccountLocation = () => {
    if (currentUser?.location) {
      const cityPart = currentUser.location.split(',')[0].trim();
      setLocation(cityPart);
      showToast(isEn ? `📍 Switched to account location: ${cityPart}` : `📍 आपके खाते की लोकेशन लागू की गई: ${cityPart}`);
    }
  };

  const handleSelectLanguage = (langOpt: LanguageOption) => {
    if (langOpt.status === 'active') {
      if (langOpt.code === 'hi' || langOpt.code === 'en') {
        setLanguage(langOpt.code);
        showToast(
          langOpt.code === 'hi'
            ? '✅ भाषा बदली गई: हिंदी (Hindi)'
            : '✅ Language changed: English'
        );
        setActiveModal(null);
      }
    } else {
      showToast(
        isEn
          ? `✨ ${langOpt.nameNative} support is coming soon! Currently Hindi & English are active.`
          : `✨ ${langOpt.nameNative} बोली/भाषा का समर्थन जल्द शुरू किया जा रहा है! अभी हिंदी व English चालू हैं।`
      );
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      showToast(isEn ? 'Please fill all fields' : 'कृपया सभी जानकारी भरें');
      return;
    }

    // Submit to real AppContext Support & Admin Inbox
    submitSupportMessage({
      name: contactName.trim(),
      phone: contactPhone.trim(),
      email: contactEmail.trim() || (currentUser?.email ? currentUser.email : undefined),
      category: contactCategory,
      subject:
        contactCategory === 'feedback'
          ? `${cityInfo.cityEnglish} कस्टमर फ़ीडबैक (${contactRating}★)`
          : contactCategory === 'bug_report'
          ? `${cityInfo.cityEnglish} तकनीकी बग रिपोर्ट`
          : contactCategory === 'suggestion'
          ? `${cityInfo.cityEnglish} नया सुझाव`
          : `${cityInfo.cityEnglish} कस्टमर सहायता संदेश`,
      message: contactMessage.trim(),
      city: cityInfo.cityEnglish,
      rating: contactCategory === 'feedback' ? contactRating : undefined,
    });

    setContactSubmitted(true);
    showToast(
      isEn
        ? `✅ Message received! ${cityInfo.cityEnglish} support desk has logged your request.`
        : `✅ संदेश प्राप्त हुआ! ${cityInfo.cityHindi} सपोर्ट डेस्क पर दर्ज कर दिया गया है।`
    );
    setTimeout(() => {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
      setActiveModal(null);
    }, 2500);
  };

  return (
    <>
      <footer className="mt-8 border-t border-[#222a3d] bg-[#070d1d] text-[#dae2fd] text-xs">
        {/* ========================================================================= */}
        {/* 1. DYNAMIC ACCOUNT HUB: Current Logged-in / Signed-up Account Strip       */}
        {/* ========================================================================= */}
        <div className="bg-[#101728] border-b border-[#242e45] px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Account Identity Card */}
              <div className="flex items-center gap-3.5 flex-1">
                <div className="relative">
                  <img
                    src={
                      currentUser?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={currentUser?.name || 'User'}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#8083ff]/40 shadow-md shadow-[#8083ff]/10"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4edea3] border-2 border-[#101728] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white">
                      {currentUser?.name || (isEn ? 'Guest User' : 'अतिथि उपयोगकर्ता (Guest)')}
                    </span>
                    {currentUser?.isAdmin ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">shield</span>
                        {isEn ? 'Super Admin' : 'सुपर एडमिन'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30 text-[10px] font-bold">
                        {currentUser?.role === 'seller'
                          ? isEn ? '🏷️ Verified Seller' : '🏷️ सत्यापित विक्रेता'
                          : currentUser?.role === 'dealer'
                          ? isEn ? '🏢 Verified Dealer' : '🏢 प्रमाणित डीलर'
                          : isEn ? '🛍️ Verified Buyer' : '🛍️ सत्यापित खरीदार'}
                      </span>
                    )}

                    <span className="px-1.5 py-0.5 rounded-md bg-[#4edea3]/15 text-[#4edea3] text-[9px] font-bold border border-[#4edea3]/30">
                      {isEn ? 'KYC Verified ✅' : 'KYC प्रमाणित ✅'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#908fa0] flex items-center gap-3 flex-wrap">
                    {currentUser?.phone && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#8083ff]">phone</span>
                        <span>{currentUser.phone}</span>
                      </span>
                    )}
                    {currentUser?.email && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#4edea3]">mail</span>
                        <span>{currentUser.email}</span>
                      </span>
                    )}
                    {currentUser?.location && (
                      <span className="flex items-center gap-1 text-[#dae2fd]">
                        <span className="material-symbols-outlined text-xs text-amber-400">home_pin</span>
                        <span>
                          {isEn ? 'Registered Area:' : 'पंजीकृत इलाका:'} <strong>{currentUser.location}</strong>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Actions & Quick Switch */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                {currentUser?.location &&
                  !location.toLowerCase().includes(currentUser.location.toLowerCase().split(',')[0]) && (
                    <button
                      onClick={handleSyncAccountLocation}
                      title={isEn ? "Switch to account's home market" : 'स्विच करके अपने अकाउंट की लोकेशन वाला बाज़ार खोलें'}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">my_location</span>
                      <span>
                        {isEn
                          ? `View Account Area (${currentUser.location.split(',')[0]})`
                          : `अकाउंट लोकेशन (${currentUser.location.split(',')[0]}) देखें`}
                      </span>
                    </button>
                  )}

                <button
                  onClick={() => navigateTo('profile')}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-xs text-[#8083ff]">account_circle</span>
                  <span>{isEn ? 'My Profile' : 'मेरी प्रोफाइल'}</span>
                </button>

                <button
                  onClick={() => openAuthModal('switch')}
                  className="px-3 py-1.5 rounded-xl bg-[#8083ff]/15 hover:bg-[#8083ff]/25 border border-[#8083ff]/30 text-[#c0c1ff] text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-xs">switch_account</span>
                  <span>{isEn ? 'Switch Account' : 'खाता बदलें'}</span>
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-[11px] flex items-center gap-1 shadow-sm hover:opacity-95 transition-all"
                >
                  <span className="material-symbols-outlined text-xs font-bold">person_add</span>
                  <span>{isEn ? '+ New Account' : '+ नया खाता बनाएं'}</span>
                </button>
              </div>
            </div>

            {/* Saved Accounts Fast Switch Bar (if more than 1 account on this device) */}
            {savedAccounts && savedAccounts.length > 1 && (
              <div className="mt-3 pt-3 border-t border-[#1c2538] flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-[#908fa0] shrink-0 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#4edea3]">group</span>
                  <span>{isEn ? 'Other Saved Accounts:' : 'अन्य सहेजे गए खाते:'}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {savedAccounts.map((acc, idx) => {
                    const isSelected =
                      (acc.phone && acc.phone === currentUser.phone) ||
                      (acc.email && acc.email === currentUser.email);
                    return (
                      <button
                        key={acc.id || idx}
                        onClick={() => switchUserAccount(acc)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] transition-all ${
                          isSelected
                            ? 'bg-[#8083ff]/25 border-[#8083ff] text-white font-bold'
                            : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#222a3d]'
                        }`}
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{acc.name}</span>
                        {isSelected && <span className="text-[#4edea3] text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC LOCATION & LANGUAGE TOP CONTROLLER STRIP                       */}
        {/* ========================================================================= */}
        <div className="bg-[#0b1122] border-b border-[#1f283d] px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Active City indicator */}
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center border border-[#4edea3]/30 shrink-0">
                <span className="material-symbols-outlined text-base">location_on</span>
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">
                    {isEn ? 'Active Market:' : 'सक्रिय मार्केट:'}{' '}
                    <span className="text-[#4edea3]">
                      {isEn ? `${cityInfo.cityEnglish} (${cityInfo.cityHindi})` : `${cityInfo.cityHindi} (${cityInfo.cityEnglish})`}
                    </span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#8083ff]/20 text-[#c0c1ff] text-[10px] font-bold border border-[#8083ff]/30">
                    {cityInfo.rtoCode}
                  </span>
                </div>
                <p className="text-[10px] text-[#908fa0]">
                  {isEn ? cityInfo.taglineEnglish : cityInfo.taglineHindi} •{' '}
                  {isEn ? 'Information below dynamically adapts to this location' : 'नीचे दी गई जानकारी इस लोकेशन के अनुसार प्रदर्शित है'}
                </p>
              </div>
            </div>

            {/* Quick Location Switcher Buttons & Language Trigger */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#908fa0] font-bold uppercase tracking-wider mr-1">
                  {isEn ? 'City:' : 'शहर:'}
                </span>
                {popularCities.slice(0, 4).map(c => {
                  const isActive = location.toLowerCase().includes(c.value.toLowerCase());
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleSelectPopularCity(c.value)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        isActive
                          ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                          : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-white hover:bg-[#222a3d]'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsChangingCity(!isChangingCity)}
                  className="px-2 py-1 rounded-lg bg-[#8083ff]/20 hover:bg-[#8083ff]/30 border border-[#8083ff]/40 text-[#c0c1ff] text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-xs">edit_location_alt</span>
                  <span>{isEn ? 'More...' : 'अन्य...'}</span>
                </button>
              </div>

              {/* Fast Language Switcher Pill in Top Controller */}
              <div className="flex items-center bg-[#171f33] border border-[#2d3449] rounded-xl p-0.5 ml-auto md:ml-0">
                <button
                  onClick={() => {
                    setLanguage('hi');
                    showToast('✅ भाषा: हिंदी');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                    language === 'hi'
                      ? 'bg-[#8083ff] text-[#0b1326] shadow-sm font-black'
                      : 'text-[#908fa0] hover:text-white'
                  }`}
                >
                  <span>🇮🇳</span>
                  <span>हिंदी</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    showToast('✅ Language: English');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                    language === 'en'
                      ? 'bg-[#4edea3] text-[#0b1326] shadow-sm font-black'
                      : 'text-[#908fa0] hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Custom City Input Dropdown */}
          {isChangingCity && (
            <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-[#1f283d] flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <span className="material-symbols-outlined text-sm text-[#4edea3]">search</span>
                <input
                  type="text"
                  value={customCityInput}
                  onChange={e => setCustomCityInput(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Enter your city or area (e.g. Maihar, Satna, Mauganj, Rewa, Bhopal)...'
                      : 'अपना शहर, कस्बा या इलाका लिखें (उदा. Maihar, Satna, Mauganj, Rewa, Bhopal)...'
                  }
                  className="flex-1 bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-1.5 text-xs text-[#dae2fd] placeholder-[#908fa0] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleApplyCustomCity}
                  className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-[#4edea3] text-[#0b1326] font-black text-xs hover:opacity-90 transition-opacity"
                >
                  {isEn ? 'Apply' : 'लागू करें'}
                </button>
                <button
                  onClick={() => setIsChangingCity(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-xs font-bold text-[#908fa0]"
                >
                  {isEn ? 'Cancel' : 'रद्द'}
                </button>
              </div>

              {/* All Popular Cities Chips */}
              <div className="flex items-center gap-1 flex-wrap w-full pt-2">
                <span className="text-[10px] text-[#908fa0]">{isEn ? 'Quick pick:' : 'त्वरित चयन:'}</span>
                {popularCities.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      handleSelectPopularCity(c.value);
                      setIsChangingCity(false);
                    }}
                    className="px-2 py-0.5 rounded-md bg-[#131b2e] hover:bg-[#242e45] border border-[#2d3449] text-[10px] text-[#dae2fd]"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. SAFETY BANNER: Localized for current city & RTO                        */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#171f33] via-[#1a243c] to-[#171f33] border-b border-[#2d3449] px-4 py-3.5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <span className="material-symbols-outlined text-base">verified_user</span>
              </span>
              <div>
                <h4 className="text-xs font-black text-amber-300">
                  {isEn
                    ? `100% Safe Local Transactions Guide (${cityInfo.cityEnglish} ${cityInfo.rtoCode})`
                    : `100% सुरक्षित स्थानीय लेनदेन दिशानिर्देश (${cityInfo.cityHindi} ${cityInfo.rtoCode})`}
                </h4>
                <p className="text-[11px] text-[#908fa0] leading-tight">
                  {isEn ? cityInfo.disclaimerHighlightEnglish : cityInfo.disclaimerHighlight}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('safety')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-colors whitespace-nowrap"
            >
              {isEn ? 'Safety Rules >' : 'सुरक्षा नियम पढ़ें >'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. MAIN FOOTER LINKS & DYNAMIC CITY INFORMATION GRID (5 COLUMNS)          */}
        {/* ========================================================================= */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand & Localized Mission */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8083ff] to-[#4edea3] flex items-center justify-center text-[#0b1326] font-black text-base shadow-md">
                {cityInfo.cityEnglish.charAt(0)}
              </div>
              <div>
                <span className="font-headline font-black text-sm tracking-wide text-white block">
                  {cityInfo.cityHindi} बाज़ार <span className="text-[#8083ff]">{cityInfo.cityEnglish} Bazaar</span>
                </span>
                <span className="text-[10px] text-[#4edea3] font-bold block">
                  {isEn ? cityInfo.taglineEnglish : cityInfo.taglineHindi}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#908fa0] leading-relaxed">
              {isEn
                ? `Direct buyer & seller classifieds platform in ${cityInfo.cityEnglish} and surrounding regions with zero brokerage. Trade bikes, mobiles, electronics, homes, cattle and goods directly.`
                : `${cityInfo.cityHindi} शहर और आस-पास के क्षेत्रों में पुरानी गाड़ियां, मोबाइल, इलेक्ट्रॉनिक्स, घर-मकान, पशु, कपड़े और अन्य सामान सीधे खरीदार और विक्रेता के बीच बिना किसी ब्रोकरेज के खरीदने-बेचने का स्वतंत्र मंच।`}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4edea3] font-bold">
              <span className="material-symbols-outlined text-base">pin_drop</span>
              <span>
                {isEn ? `Operating in ${cityInfo.rtoCode} • Local Service` : `${cityInfo.rtoCode} में संचालित • स्थानीय सेवा`}
              </span>
            </div>
          </div>

          {/* Quick Links & Categories */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] border-b border-[#222a3d] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8083ff] text-sm">category</span>
              <span>{isEn ? 'Top Categories' : `${cityInfo.cityHindi} में श्रेणियां`}</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#c0c1ff]/80">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-left"
                >
                  <span>•</span>{' '}
                  <span>
                    {isEn ? `Vehicles & Bikes (${cityInfo.cityEnglish})` : `गाड़ियां व बाइक्स (${cityInfo.cityHindi} Hero, Bullet)`}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-left"
                >
                  <span>•</span>{' '}
                  <span>{isEn ? 'Mobiles & Electronics (iPhone, 5G)' : 'मोबाइल व लैपटॉप (iPhone, Samsung 5G)'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-left"
                >
                  <span>•</span>{' '}
                  <span>{isEn ? `Rentals & Property (${cityInfo.cityEnglish})` : `मकान, फ्लैट व जमीन (${cityInfo.cityHindi} Rentals)`}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-left"
                >
                  <span>•</span>{' '}
                  <span>{isEn ? 'Tractors & Cattle (Swaraj, Buffalo)' : 'खेती, ट्रैक्टर व मवेशी (Swaraj, मुर्रा भैंस)'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('post-ad')}
                  className="text-[#4edea3] font-bold hover:underline flex items-center gap-1 pt-1"
                >
                  <span>+</span> <span>{isEn ? '+ Post Free Ad Now' : `+ ${cityInfo.cityHindi} में मुफ्त Ad पोस्ट करें`}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Policies & Safety */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] border-b border-[#222a3d] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8083ff] text-sm">gavel</span>
              <span>{isEn ? 'Policies & Safety' : 'नीतियां व सुरक्षा'}</span>
            </h4>
            <ul className="space-y-2 text-[11px] text-[#c7c4d7]">
              <li>
                <button
                  onClick={() => setActiveModal('disclaimer')}
                  className="hover:text-[#8083ff] text-left transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs text-amber-400">warning</span>
                  <span className="underline decoration-[#2d3449] hover:decoration-[#8083ff]">
                    {isEn ? 'Legal Disclaimer' : 'डिस्क्लेमर (Legal Disclaimer)'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-[#8083ff] text-left transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs text-[#4edea3]">lock</span>
                  <span className="underline decoration-[#2d3449] hover:decoration-[#8083ff]">
                    {isEn ? 'Privacy Policy' : 'प्राइवेसी पॉलिसी (Privacy Policy)'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-[#8083ff] text-left transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs text-[#8083ff]">description</span>
                  <span className="underline decoration-[#2d3449] hover:decoration-[#8083ff]">
                    {isEn ? 'Terms of Service' : 'नियम व शर्तें (Terms of Service)'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('safety')}
                  className="hover:text-[#8083ff] text-left transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs text-cyan-400">health_and_safety</span>
                  <span className="underline decoration-[#2d3449] hover:decoration-[#8083ff]">
                    {isEn ? 'Fraud Prevention Guide' : 'सुरक्षा निर्देश व धोखाधड़ी रोकथाम'}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us & Local Support Hub */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] border-b border-[#222a3d] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8083ff] text-sm">contact_support</span>
              <span>{isEn ? `${cityInfo.cityEnglish} Support` : `${cityInfo.cityHindi} सहायता व संपर्क`}</span>
            </h4>
            <div className="space-y-2 text-[11px] text-[#908fa0]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-xs text-[#8083ff] mt-0.5">location_on</span>
                <span>{isEn ? cityInfo.officeAddressEnglish : cityInfo.officeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-[#4edea3]">call</span>
                <a
                  href={`tel:${cityInfo.helplinePhone.split('/')[0].trim()}`}
                  className="hover:text-white transition-colors text-[#dae2fd] font-bold"
                >
                  {cityInfo.helplinePhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-[#38bdf8]">mail</span>
                <a
                  href={`mailto:${cityInfo.helplineEmail}`}
                  className="hover:text-white transition-colors text-[#dae2fd]"
                >
                  {cityInfo.helplineEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-[#ffb2b7]">schedule</span>
                <span>{isEn ? cityInfo.workingHoursEnglish : cityInfo.workingHours}</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('contact')}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-md shadow-[#8083ff]/20 hover:opacity-95 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  <span>{isEn ? 'Message Support' : 'मदद / संदेश भेजें'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. NEW MENU: LANGUAGE SELECTION & INDIAN LOCAL LANGUAGES MENU             */}
          {/* ========================================================================= */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] border-b border-[#222a3d] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4edea3] text-sm">translate</span>
              <span>{isEn ? 'Language / भाषा' : 'भाषा (Language)'}</span>
            </h4>
            <div className="space-y-2">
              <p className="text-[10px] text-[#908fa0]">
                {isEn
                  ? 'Currently Hindi & English are active. Indian local languages (Bagheli, Bundelkhandi, Bhojpuri) coming soon!'
                  : 'अभी हिंदी और English चालू हैं। भारतीय स्थानीय बोलियां (बघेली, बुंदेली, भोजपुरी) जल्द जोड़ी जा रही हैं।'}
              </p>

              {/* Active Toggle Buttons */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setLanguage('hi');
                    showToast('✅ भाषा: हिंदी (Hindi) चुनी गई');
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    language === 'hi'
                      ? 'bg-[#8083ff]/25 border-[#8083ff] text-white shadow-sm'
                      : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-white hover:bg-[#222a3d]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇮🇳</span>
                    <span>हिंदी (Hindi)</span>
                  </div>
                  {language === 'hi' && (
                    <span className="text-[#4edea3] text-[11px] font-black">सक्रिय ✓</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setLanguage('en');
                    showToast('✅ Language set to English');
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    language === 'en'
                      ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3] shadow-sm'
                      : 'bg-[#171f33] border-[#2d3449] text-[#908fa0] hover:text-white hover:bg-[#222a3d]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇬🇧</span>
                    <span>English</span>
                  </div>
                  {language === 'en' && (
                    <span className="text-[#4edea3] text-[11px] font-black">Active ✓</span>
                  )}
                </button>
              </div>

              {/* Upcoming Indian Local Languages Preview & Modal Trigger */}
              <div className="pt-1 border-t border-[#1a233a] space-y-1">
                <button
                  onClick={() => setActiveModal('language')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] hover:border-[#8083ff]/40 text-[#c0c1ff] text-[11px] font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#8083ff]">language</span>
                    <span>{isEn ? 'All Indian Languages' : 'भारतीय स्थानीय भाषाएं'}</span>
                  </span>
                  <span className="text-[10px] text-[#4edea3] font-bold">सूची देखें &gt;</span>
                </button>

                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {['बघेली (विंध्य)', 'बुंदेली', 'भोजपुरी', 'छत्तीसगढ़ी'].map(l => (
                    <span
                      key={l}
                      onClick={() => setActiveModal('language')}
                      className="px-1.5 py-0.5 rounded bg-[#131b2e] border border-[#242e45] text-[#908fa0] text-[9px] hover:text-white hover:border-[#8083ff] cursor-pointer transition-colors"
                      title={isEn ? 'Coming soon - click to view' : 'जल्द आ रहा है - सूची देखें'}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. DETAILED LEGAL DISCLAIMER BOX                                          */}
        {/* ========================================================================= */}
        <div className="border-t border-[#1a233a] bg-[#050914] px-4 py-4">
          <div className="max-w-6xl mx-auto space-y-2 text-[10px] text-[#908fa0] leading-relaxed">
            <p className="font-bold text-[#dae2fd]">
              <span className="text-amber-400 mr-1">
                {isEn
                  ? `⚠️ Statutory Legal Disclaimer for ${cityInfo.cityEnglish} (${cityInfo.rtoCode}):`
                  : `⚠️ वैधानिक अस्वीकरण (${cityInfo.cityHindi} - ${cityInfo.rtoCode}):`}
              </span>
              {isEn
                ? `${cityInfo.cityEnglish} Bazaar is an online hyperlocal classifieds connector platform for buyers and sellers in ${cityInfo.cityEnglish} and surrounding Vindhya/MP districts. The platform does not own, manufacture, warrant or deliver any listed product.`
                : `${cityInfo.cityHindi} बाज़ार केवल ${cityInfo.cityHindi} जिले व आसपास के स्थानीय खरीदारों और विक्रेताओं को आपस में जोड़ने वाला एक ऑनलाइन मंच (Classified Platform) है। यह प्लेटफॉर्म किसी भी वस्तु का प्रत्यक्ष स्वामित्व, निर्माण, वारंटी या वितरण नहीं करता।`}
            </p>
            <p>
              {isEn
                ? `Users are strongly advised never to send UPI, QR code or advance token money to unknown parties. Thoroughly inspect goods in person, verify MP RTO ownership, Smart RC, chassis details, and property documentation before concluding deals. Buyers and sellers are solely responsible for personal monetary transactions.`
                : `उपयोगकर्ताओं को सख्त सलाह दी जाती है कि वे किसी भी अज्ञात व्यक्ति को ऑनलाइन यूपीआई (UPI), क्यूआर कोड (QR Code) या अग्रिम राशि (Advance Payment) न भेजें। किसी भी सौदे से पूर्व वस्तु की व्यक्तिगत रूप से शारीरिक जांच, वाहन का ${cityInfo.rtoCode} स्वामित्व, स्मार्ट आरसी कार्ड व चेसिस नंबर और प्रॉपर्टी के मूल दस्तावेज अवश्य जांच लें। किसी भी व्यक्तिगत वित्तीय लेनदेन, धोखाधड़ी या विवाद के लिए खरीदार और विक्रेता स्वयं जिम्मेदार होंगे।`}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. BOTTOM COPYRIGHT & DYNAMIC LOCAL TOWNS LIST                            */}
        {/* ========================================================================= */}
        <div className="border-t border-[#1a233a] bg-[#03060d] px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#908fa0]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                © 2026{' '}
                <strong>
                  {isEn ? `${cityInfo.cityEnglish} Bazaar` : `${cityInfo.cityHindi} बाज़ार (${cityInfo.cityEnglish} Bazaar)`}
                </strong>
                .{' '}
                {isEn
                  ? 'All rights reserved. Vindhya & MP Local Marketplace.'
                  : 'सर्वाधिकार सुरक्षित। विंध्य व मध्य प्रदेश का अपना मार्केटप्लेस।'}
              </span>

              {/* Language Switch badge */}
              <button
                onClick={() => setLanguage(isEn ? 'hi' : 'en')}
                className="px-2 py-0.5 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[10px] text-[#4edea3] font-bold flex items-center gap-1"
                title="Toggle Language / भाषा बदलें"
              >
                <span>🌐</span>
                <span>{isEn ? 'हिंदी में बदलें' : 'Switch to English'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] flex-wrap justify-center sm:justify-end">
              <span className="text-[#4edea3] font-bold">
                {cityInfo.prominentAreas.join(' • ')}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* INTERACTIVE POLICY, CONTACT & LANGUAGE MODALS                             */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#222a3d] flex items-center justify-between bg-[#171f33]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">
                    {activeModal === 'privacy' && 'lock'}
                    {activeModal === 'terms' && 'description'}
                    {activeModal === 'safety' && 'security'}
                    {activeModal === 'disclaimer' && 'warning'}
                    {activeModal === 'contact' && 'support_agent'}
                    {activeModal === 'language' && 'translate'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#dae2fd]">
                    {activeModal === 'privacy' && (isEn ? 'Privacy Policy' : 'प्राइवेसी पॉलिसी (Privacy Policy)')}
                    {activeModal === 'terms' && (isEn ? 'Terms of Service' : 'नियम व शर्तें (Terms of Service)')}
                    {activeModal === 'safety' &&
                      (isEn
                        ? `Safety Guidelines (${cityInfo.cityEnglish})`
                        : `सुरक्षा निर्देश (${cityInfo.cityHindi} Safety Guide)`)}
                    {activeModal === 'disclaimer' &&
                      (isEn
                        ? `Legal Disclaimer (${cityInfo.cityEnglish} - ${cityInfo.rtoCode})`
                        : `कानूनी डिस्क्लेमर (${cityInfo.cityHindi} - ${cityInfo.rtoCode})`)}
                    {activeModal === 'contact' &&
                      (isEn
                        ? `${cityInfo.cityEnglish} Support & Helpdesk`
                        : `${cityInfo.cityHindi} सहायता व संपर्क (Contact Support)`)}
                    {activeModal === 'language' &&
                      (isEn
                        ? 'Select Language & Indian Regional Dialects'
                        : 'भाषा व भारतीय स्थानीय बोलियां चुनें')}
                  </h3>
                  <p className="text-[10px] text-[#908fa0]">
                    {isEn
                      ? `${cityInfo.cityEnglish} Bazaar • Consumer Safety Guidelines • ${cityInfo.rtoCode}`
                      : `${cityInfo.cityHindi} बाज़ार • उपभोक्ता सुरक्षा निर्देश • ${cityInfo.rtoCode}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#222a3d] text-[#dae2fd] flex items-center justify-center hover:bg-[#2d3449] transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#c7c4d7] leading-relaxed flex-1">
              {/* Language Selection Modal */}
              {activeModal === 'language' && (
                <div className="space-y-4">
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449] text-xs">
                    <p className="text-[#dae2fd]">
                      {isEn
                        ? 'Currently Hindi and English are supported across the platform. We are building native support for Indian regional languages and Vindhya dialects (Bagheli, Bundelkhandi, Bhojpuri, Chhattisgarhi, Marathi).'
                        : 'वर्तमान में ऐप में हिंदी और English सक्रिय हैं। रीवा, सतना, विंध्य और मध्य भारत की स्थानीय बोलियों (बघेली, बुंदेली, भोजपुरी, छत्तीसगढ़ी, मराठी) का समर्थन जल्द जोड़ा जा रहा है ताकि हर कोई अपनी मातृभाषा में व्यापार कर सके।'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#4edea3]">check_circle</span>
                      <span>{isEn ? 'Currently Active Languages' : 'वर्तमान में चालू भाषाएं'}</span>
                    </h4>
                    <div className="space-y-2">
                      {LANGUAGES_LIST.filter(l => l.status === 'active').map(langOpt => {
                        const isSelected = language === langOpt.code;
                        return (
                          <div
                            key={langOpt.code}
                            onClick={() => handleSelectLanguage(langOpt)}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#8083ff]/20 border-[#8083ff] text-white shadow-md'
                                : 'bg-[#171f33] border-[#2d3449] hover:bg-[#222a3d] hover:border-[#8083ff]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{langOpt.flag}</span>
                              <div>
                                <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>{langOpt.nameNative}</span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-bold">
                                      {isEn ? 'Selected' : 'चयनित ✓'}
                                    </span>
                                  )}
                                </h5>
                                <p className="text-[11px] text-[#908fa0]">{langOpt.region}</p>
                              </div>
                            </div>

                            <button
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#4edea3] text-[#0b1326] font-black'
                                  : 'bg-[#222a3d] text-[#c0c1ff] hover:bg-[#8083ff] hover:text-[#0b1326]'
                              }`}
                            >
                              {isSelected ? (isEn ? 'Active' : 'सक्रिय') : (isEn ? 'Select' : 'चुनें')}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#dae2fd] mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-amber-400">schedule</span>
                      <span>
                        {isEn
                          ? 'Upcoming Indian Local Languages & Dialects'
                          : 'आगामी भारतीय स्थानीय भाषाएं व बोलियां (Coming Soon)'}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {LANGUAGES_LIST.filter(l => l.status === 'upcoming').map(langOpt => (
                        <div
                          key={langOpt.code}
                          onClick={() => handleSelectLanguage(langOpt)}
                          className="p-3 rounded-2xl bg-[#131b2e] border border-[#242e45] hover:border-[#8083ff]/40 flex items-center justify-between cursor-pointer transition-all opacity-85 hover:opacity-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{langOpt.flag}</span>
                            <div>
                              <h5 className="font-bold text-xs text-[#dae2fd] flex items-center gap-2">
                                <span>{langOpt.nameNative}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                                  {isEn ? 'Coming Soon' : 'जल्द आ रहा है'}
                                </span>
                              </h5>
                              <p className="text-[11px] text-[#908fa0]">{langOpt.region}</p>
                            </div>
                          </div>

                          <span className="text-[11px] text-[#8083ff] font-bold">
                            {isEn ? 'Notify Me' : 'सूचना पाएं'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Policy */}
              {activeModal === 'privacy' && (
                <>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#4edea3] mb-1">
                      {isEn ? '1. Information Privacy' : '1. आपकी जानकारी की गोपनीयता'}
                    </h4>
                    <p>
                      {isEn
                        ? `${cityInfo.cityEnglish} Bazaar respects your privacy. Phone numbers and email are only shown to verified buyers/sellers for direct trading.`
                        : `${cityInfo.cityHindi} बाज़ार आपके व्यक्तिगत डेटा, फोन नंबर और ईमेल की गोपनीयता का पूरा सम्मान करता है। आपका फोन नंबर केवल सत्यापित खरीदारों/विक्रेताओं को ही संपर्क के लिए प्रदर्शित किया जाता है।`}
                    </p>
                  </div>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#4edea3] mb-1">
                      {isEn ? '2. Data Usage & Security' : '2. डेटा उपयोग व शेयरिंग'}
                    </h4>
                    <p>
                      {isEn
                        ? 'We never sell your data to third party marketing companies. Information is used strictly for display and fraud protection.'
                        : 'हम आपकी व्यक्तिगत जानकारी किसी तीसरे पक्ष या बाहरी टेलीमार्केटिंग कंपनियों को कभी नहीं बेचते हैं। डेटा केवल विज्ञापनों के प्रदर्शन और धोखाधड़ी रोकने के उद्देश्य से उपयोग किया जाता है।'}
                    </p>
                  </div>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#4edea3] mb-1">
                      {isEn ? '3. Local Device Storage' : '3. स्थानीय स्टोरेज व कुकीज'}
                    </h4>
                    <p>
                      {isEn
                        ? 'Your favorite listings, language preference, and chat histories are safely stored on your device.'
                        : 'ऐप आपके पसंदीदा विज्ञापनों और चैट हिस्ट्री को आपके डिवाइस में सुरक्षित रूप से सहेजता है ताकि दोबारा आने पर आपको तुरंत जानकारी मिल सके।'}
                    </p>
                  </div>
                </>
              )}

              {/* Terms of Service */}
              {activeModal === 'terms' && (
                <>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#8083ff] mb-1">
                      {isEn ? '1. Ad Posting Regulations' : '1. विज्ञापन पोस्ट करने के नियम'}
                    </h4>
                    <p>
                      {isEn
                        ? 'Only post authentic, legally-owned items with clear photos and genuine details. Misleading posts are prohibited.'
                        : 'केवल वैध, प्रामाणिक और आपके स्वामित्व वाले सामान का ही विज्ञापन पोस्ट करें। किसी भी प्रकार की नकली, चोरी की, या भ्रामक जानकारी देना सख्त प्रतिबंधित है।'}
                    </p>
                  </div>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#8083ff] mb-1">
                      {isEn ? '2. Prohibited Items' : '2. प्रतिबंधित वस्तुएं'}
                    </h4>
                    <p>
                      {isEn
                        ? 'Weapons, illicit substances, government documents, or vehicles without papers are strictly barred.'
                        : 'अवैध हथियार, मादक पदार्थ, सरकारी गोपनीय दस्तावेज, बिना कागजात के वाहन या गैरकानूनी सामग्री पोस्ट करने पर खाता तुरंत ब्लॉक कर पुलिस कार्रवाई की जाएगी।'}
                    </p>
                  </div>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#8083ff] mb-1">
                      {isEn ? '3. Direct Bargaining & Zero Brokerage' : '3. मोलभाव व सौदेबाजी'}
                    </h4>
                    <p>
                      {isEn
                        ? 'Buyers and sellers agree on prices directly through chat and calls without any brokerage fee.'
                        : `${cityInfo.cityHindi} बाज़ार पर खरीदार और विक्रेता दोनों सीधे चैट और कॉल द्वारा मूल्य तय करते हैं। हमारा मंच किसी भी सौदे पर कोई कमीशन या ब्रोकरेज नहीं लेता है।`}
                    </p>
                  </div>
                </>
              )}

              {/* Safety Guide */}
              {activeModal === 'safety' && (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">security</span>
                      <span>
                        {isEn
                          ? `4 Golden Rules for Fraud Prevention (${cityInfo.cityEnglish})`
                          : `धोखाधड़ी से बचने के 4 सुनहरे नियम (${cityInfo.cityHindi})`}
                      </span>
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside text-[#dae2fd]">
                      <li>
                        <strong>{isEn ? 'Never send advance token payments:' : 'कभी भी एडवांस न दें:'}</strong>{' '}
                        {isEn
                          ? 'Never pay courier or delivery fees upfront.'
                          : 'डिलीवरी चार्ज, कोरियर चार्ज या टोकन के नाम पर किसी को पैसे न भेजें।'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Meet in public places:' : 'सार्वजनिक जगह चुनें:'}</strong>{' '}
                        {isEn
                          ? `Choose busy areas like ${cityInfo.prominentAreas.slice(0, 3).join(', ')}.`
                          : `मिलने के लिए ${cityInfo.cityHindi} का कोई व्यस्त सार्वजनिक स्थान (${cityInfo.prominentAreas.slice(0, 3).join(', ')}) चुनें।`}
                      </li>
                      <li>
                        <strong>{isEn ? 'Verify vehicle papers:' : 'गाड़ी के कागजात जांचें:'}</strong>{' '}
                        {isEn
                          ? `Check ${cityInfo.rtoCode} registration, Smart RC and challan status.`
                          : `${cityInfo.rtoCode} व MP Transport पोर्टल पर जाकर रजिस्ट्रेशन, स्मार्ट कार्ड, इंश्योरेंस और चालान की जांच करें।`}
                      </li>
                      <li>
                        <strong>{isEn ? 'Never scan QR codes to receive money:' : 'QR कोड स्कैन न करें:'}</strong>{' '}
                        {isEn
                          ? 'You never need to scan a QR or enter UPI PIN to receive payment.'
                          : 'पैसे लेने के लिए कभी भी QR कोड स्कैन या UPI पिन डालने की आवश्यकता नहीं होती।'}
                      </li>
                    </ul>
                  </div>
                  <div className="bg-[#171f33] p-3 rounded-2xl border border-[#2d3449]">
                    <h4 className="font-bold text-[#4edea3] mb-1">
                      {isEn ? 'Report Suspicious Listings' : 'संदेहास्पद विज्ञापन की रिपोर्ट करें'}
                    </h4>
                    <p>
                      {isEn
                        ? `If an ad feels fraudulent, email us at ${cityInfo.helplineEmail} (Emergency: ${cityInfo.emergencyHelpline}).`
                        : `यदि कोई सेलर अनुचित मूल्य की मांग करे या संदिग्ध लगे, तो तुरंत ऐप में रिपोर्ट करें या हमें ईमेल करें: ${cityInfo.helplineEmail} (आपातकाल: ${cityInfo.emergencyHelpline})`}
                    </p>
                  </div>
                </>
              )}

              {/* Legal Disclaimer */}
              {activeModal === 'disclaimer' && (
                <>
                  <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-red-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">warning</span>
                      <span>
                        {isEn
                          ? `Full Legal Disclaimer (${cityInfo.cityEnglish} - ${cityInfo.rtoCode})`
                          : `पूर्ण कानूनी डिस्क्लेमर (${cityInfo.cityHindi} - ${cityInfo.rtoCode})`}
                      </span>
                    </h4>
                    <p className="text-[#dae2fd]">
                      {isEn
                        ? `${cityInfo.cityEnglish} Bazaar is solely an online information platform. Users must personally verify product condition, title ownership, RTO validity, and seller authenticity.`
                        : `${cityInfo.cityHindi} बाज़ार केवल एक ऑनलाइन सूचना मंच है। इस प्लेटफॉर्म पर प्रकाशित होने वाले किसी भी विज्ञापन, उत्पाद की स्थिति, वाहन के मालिकाना हक, प्रॉपर्टी के दस्तावेजों या सेलर की विश्वसनीयता की व्यक्तिगत पुष्टि उपयोगकर्ताओं को स्वयं करनी होगी।`}
                    </p>
                    <p className="text-[#dae2fd]">
                      {isEn
                        ? 'The platform is not liable for indirect or consequential damages or financial disputes. Users are subject to Indian Information Technology Act (IT Act 2000).'
                        : `${cityInfo.cityHindi} बाज़ार किसी भी प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक या परिणामी नुकसान, धोखाधड़ी या विवाद के लिए कानूनी रूप से उत्तरदायी नहीं है। दोनों पक्षों को भारतीय कानून और सूचना प्रौद्योगिकी अधिनियम (IT Act 2000) के तहत व्यवहार करना अनिवार्य है।`}
                    </p>
                  </div>
                </>
              )}

              {/* Contact Us Form */}
              {activeModal === 'contact' && (
                <div>
                  {contactSubmitted ? (
                    <div className="text-center py-8 space-y-2">
                      <span className="material-symbols-outlined text-4xl text-[#4edea3]">check_circle</span>
                      <h4 className="text-sm font-bold text-white">
                        {isEn ? 'Message Sent Successfully!' : 'संदेश सफलतापूर्वक भेजा गया!'}
                      </h4>
                      <p className="text-xs text-[#908fa0]">
                        {isEn
                          ? `Our ${cityInfo.cityEnglish} support team will get in touch shortly.`
                          : `हमारी ${cityInfo.cityHindi} कस्टमर सपोर्ट टीम आपसे जल्द संपर्क करेगी।`}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <div className="bg-[#171f33] p-2.5 rounded-xl border border-[#2d3449] text-[11px] space-y-1">
                        <div className="text-[#4edea3] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">store</span>
                          <span>
                            {isEn ? `${cityInfo.cityEnglish} Help Center:` : `${cityInfo.cityHindi} सेवा केंद्र:`}{' '}
                            {isEn ? cityInfo.officeAddressEnglish : cityInfo.officeAddress}
                          </span>
                        </div>
                        <div className="text-[#c0c1ff]">
                          {isEn ? 'Helpline:' : 'हेल्पलाइन:'} <strong>{cityInfo.helplinePhone}</strong> (
                          {isEn ? cityInfo.workingHoursEnglish : cityInfo.workingHours})
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                          {isEn ? 'Message Type' : 'संदेश का प्रकार'}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setContactCategory('contact_support')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border text-left transition-all flex items-center gap-1.5 ${
                              contactCategory === 'contact_support'
                                ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#8083ff]'
                                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">support_agent</span>
                            <span>{isEn ? 'Help & Support' : 'हेल्प व सहायता'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactCategory('feedback')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border text-left transition-all flex items-center gap-1.5 ${
                              contactCategory === 'feedback'
                                ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">thumb_up</span>
                            <span>{isEn ? 'App Feedback' : 'ऐप फ़ीडबैक'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactCategory('bug_report')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border text-left transition-all flex items-center gap-1.5 ${
                              contactCategory === 'bug_report'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">bug_report</span>
                            <span>{isEn ? 'Report Issue' : 'तकनीकी समस्या'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactCategory('suggestion')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border text-left transition-all flex items-center gap-1.5 ${
                              contactCategory === 'suggestion'
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-[#171f33] border-[#2d3449] text-[#908fa0]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">lightbulb</span>
                            <span>{isEn ? 'Improvement Idea' : 'सुधार का सुझाव'}</span>
                          </button>
                        </div>
                      </div>

                      {contactCategory === 'feedback' && (
                        <div>
                          <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                            {isEn ? 'Rate Your Experience:' : 'अपना अनुभव रेट करें:'}
                          </label>
                          <div className="flex items-center gap-1.5 bg-[#171f33] p-2 rounded-xl border border-[#2d3449]">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setContactRating(star)}
                                className={`text-base transition-transform ${
                                  star <= contactRating ? 'text-amber-400 scale-110' : 'text-[#444c65]'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                            <span className="text-[10px] text-[#908fa0] ml-2">
                              {contactRating === 5
                                ? (isEn ? 'Excellent service!' : 'उत्कृष्ट सेवा!')
                                : contactRating >= 4
                                ? (isEn ? 'Very good' : 'बहुत अच्छा')
                                : (isEn ? 'Needs improvement' : 'सुधार की ज़रूरत')}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                          {isEn ? 'Your Name' : 'आपका नाम'} *
                        </label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder={isEn ? 'e.g. Rahul Patel' : 'उदा. राहुल पटेल'}
                          className="w-full bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                            {isEn ? 'Mobile Number' : 'मोबाइल नंबर'} *
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            placeholder="+91 98XXX XXXXX"
                            className="w-full bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                            {isEn ? 'Email (Optional)' : 'ईमेल (वैकल्पिक)'}
                          </label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={e => setContactEmail(e.target.value)}
                            placeholder={currentUser?.email || 'name@example.com'}
                            className="w-full bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-[#908fa0] block mb-1 font-bold">
                          {isEn ? 'Issue / Feedback / Details' : 'समस्या / फ़ीडबैक / विवरण'} *
                        </label>
                        <textarea
                          value={contactMessage}
                          onChange={e => setContactMessage(e.target.value)}
                          rows={3}
                          placeholder={
                            contactCategory === 'feedback'
                              ? (isEn ? 'Tell us what you liked and how we can improve...' : 'बताएं ऐप में क्या अच्छा लगा और हम क्या बेहतर कर सकते हैं...')
                              : isEn
                              ? `Describe your question or issue in ${cityInfo.cityEnglish}...`
                              : `अपनी समस्या या ${cityInfo.cityHindi} विज्ञापन संबंधी प्रश्न यहाँ लिखें...`
                          }
                          className="w-full bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
                          required
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(
                              `https://wa.me/919827041239?text=Namaste%20${encodeURIComponent(
                                cityInfo.cityEnglish
                              )}%20Bazaar%20Support`,
                              '_blank'
                            );
                            showToast(`Opening WhatsApp Chat for ${cityInfo.cityEnglish}...`);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>WhatsApp सपोर्ट</span>
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#4edea3] text-[#0b1326] font-black text-xs shadow-md shadow-[#8083ff]/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">send</span>
                          <span>{isEn ? 'Submit' : 'सबमिट करें'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#171f33] border-t border-[#222a3d] flex items-center justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-bold text-[#dae2fd] transition-colors"
              >
                {isEn ? 'Close' : 'बंद करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
