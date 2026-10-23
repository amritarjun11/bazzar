import { ChatMessage, Listing } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

// Initial chat threads for standard seed listings
export const SEED_CHAT_THREADS: Record<string, ChatMessage[]> = {
  // 1. Honda Shine - Rahul Sharma (Rahul Automobiles)
  listing_honda_shine: INITIAL_CHAT_MESSAGES,

  // 2. iPhone 13 - Manish Soni (AppleHub MP)
  listing_iphone_13: [
    {
      id: 'msg_ip_1',
      sender: 'buyer',
      text: 'Namaste Manish ji, iPhone 13 128GB Midnight abhi available hai? Battery health kitni hai?',
      timestamp: '09:20 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_ip_2',
      sender: 'seller',
      text: 'Namaste! Haan bilkul available hai. 88% original battery health hai, kabhi open ya repair nahi hua.',
      timestamp: '09:22 AM',
      type: 'text',
    },
    {
      id: 'msg_ip_3',
      sender: 'seller',
      text: 'Original Apple box, bill aur braided cable saath me milegi. TrueTone aur Face ID 100% working hai. Saman Naka shop par aakar check kar lijiye.',
      timestamp: '09:23 AM',
      type: 'text',
    },
    {
      id: 'msg_ip_4',
      sender: 'buyer',
      timestamp: '09:25 AM',
      status: 'read',
      type: 'offer',
      offerData: {
        round: 1,
        amount: 40000,
        originalPrice: 43500,
        status: 'countered',
      },
    },
    {
      id: 'msg_ip_5',
      sender: 'seller',
      timestamp: '09:28 AM',
      type: 'counter_offer',
      offerData: {
        round: 2,
        amount: 41500,
        originalPrice: 43500,
        status: 'pending',
        sellerNote: 'Bhaiya ₹41,500 final settle kar sakte hain. Phone brand new condition me hai, tempered glass laga hua hai.',
        savings: 2000,
        expiresIn: '24 hrs',
      },
    },
  ],

  // 3. Royal Enfield Classic 350 - Vikram Singh Baghel (Royal Motors Rewa)
  listing_classic_350: [
    {
      id: 'msg_cl_1',
      sender: 'buyer',
      text: 'Namaste Vikram ji, Classic 350 Stealth Matte Black abhi available hai? Gaadi me koi issue to nahi hai?',
      timestamp: '11:05 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_cl_2',
      sender: 'seller',
      text: 'Haan bhai! Bike bilkul fresh condition me hai. 1st owner, BS6 model, company service record ke saath.',
      timestamp: '11:08 AM',
      type: 'text',
    },
    {
      id: 'msg_cl_3',
      sender: 'seller',
      timestamp: '11:10 AM',
      type: 'video_snippet',
      videoSnippet: {
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRepx_p5-2AwKuor3GQCTN083TEChy9pHvesicKBQ95H-mSUgDlzGgZyv2FBXzhm7F-06Szf7gljRKGRM8_10BsYKtHgrvAz3eDvVaCtK8QiQJ1bTTeUuySJlowskgz18PMS-RMt685NkE_3s6mF0zpY7m6_DhMGQIaoo8o5BSu-eORqNPq0c4cfyvvq6QPYqKzfCE9t1_DabhX5OnmTbrvnR3rY9QTc3UVy1Agc7R_ywsaljOHNxk',
        title: 'Classic 350 Dug-Dug Heavy Bass Thump Sound',
        duration: '0:15',
        note: '"Engine ekdum silent hai aur exhaust ka raw thump suniye"',
      },
    },
    {
      id: 'msg_cl_4',
      sender: 'buyer',
      text: 'Test ride ke liye kab aa sakte hain?',
      timestamp: '11:12 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_cl_5',
      sender: 'seller',
      text: 'Bodabag Road par Royal Motors me aaj sham 4 se 6 baje ke beech aakar test ride le lijiye.',
      timestamp: '11:14 AM',
      type: 'text',
    },
  ],

  // 4. Flat / Property - Anil Dwivedi (Rewa Estates & Rentals)
  listing_2bhk_flat: [
    {
      id: 'msg_fl_1',
      sender: 'buyer',
      text: 'Namaste Anil ji, University Road wala 2 BHK flat abhi vacant hai?',
      timestamp: '08:30 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_fl_2',
      sender: 'seller',
      text: 'Namaste! Haan bilkul, flat abhi vacant hai aur immediate shifting ready hai. 24x7 boring water aur separate sub-meter hai.',
      timestamp: '08:34 AM',
      type: 'text',
    },
    {
      id: 'msg_fl_3',
      sender: 'buyer',
      text: 'Family ke liye safe hai? Car parking milegi?',
      timestamp: '08:36 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_fl_4',
      sender: 'seller',
      text: 'Haanji, bohot shaant aur safe locality hai. Dedicated covered car parking available hai. Aaj sham 5 baje visit kar sakte hain.',
      timestamp: '08:38 AM',
      type: 'text',
    },
  ],
  listing_rewa_flat: [
    {
      id: 'msg_fl_1',
      sender: 'buyer',
      text: 'Namaste Anil ji, University Road wala 2 BHK flat abhi vacant hai?',
      timestamp: '08:30 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_fl_2',
      sender: 'seller',
      text: 'Namaste! Haan bilkul, flat abhi vacant hai aur immediate shifting ready hai.',
      timestamp: '08:34 AM',
      type: 'text',
    },
  ],

  // 5. Honda SP 125 - Rohit Tiwari (Tiwari Automobiles)
  listing_honda_sp125: [
    {
      id: 'msg_sp_1',
      sender: 'buyer',
      text: 'Namaste Rohit ji, SP 125 Red-Black bike abhi available hai? Average kitna de rahi hai?',
      timestamp: '10:05 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_sp_2',
      sender: 'seller',
      text: 'Haan bhaiya bilkul available hai! Real-world average 60 kmpl araam se deti hai. Single hand chali hai 19k km.',
      timestamp: '10:07 AM',
      type: 'text',
    },
    {
      id: 'msg_sp_3',
      sender: 'buyer',
      text: 'Dhobia Tanki me kahan par dekh sakte hain?',
      timestamp: '10:09 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_sp_4',
      sender: 'seller',
      text: 'Dhobia Tanki chowk Tiwari Automobiles par aa jaiye, test drive aur papers live dikha dunga.',
      timestamp: '10:11 AM',
      type: 'text',
    },
  ],

  // 6. Bajaj Pulsar 150 - Amit Patel (Rewa Auto Junction)
  listing_pulsar_150: [
    {
      id: 'msg_pl_1',
      sender: 'buyer',
      text: 'Namaste Amit ji, Pulsar 150 Twin Disc ka final price kya hoga? Engine me koi sound to nahi?',
      timestamp: '01:15 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_pl_2',
      sender: 'seller',
      text: 'Namaste! Engine bilkul smooth hai, laser graphics original condition me hain. ₹60,000 cash me deal kar lenge.',
      timestamp: '01:18 PM',
      type: 'text',
    },
    {
      id: 'msg_pl_3',
      sender: 'seller',
      text: 'Kothi Compound me showroom hai hamara, aakar bike chala kar tasalli kar lijiye.',
      timestamp: '01:20 PM',
      type: 'text',
    },
  ],

  // 7. TVS Apache 160 - Shubham Mishra (Mishra Speed Motors)
  listing_apache_160: [
    {
      id: 'msg_ap_1',
      sender: 'buyer',
      text: 'Namaste Shubham ji, Apache RTR 160 4V 2022 model abhi unsold hai?',
      timestamp: '03:40 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_ap_2',
      sender: 'seller',
      text: 'Haan bhai, bilkul available hai! Sirf 8,500 km chali hai Racing Red color me. 1st owner, spotless gaadi hai.',
      timestamp: '03:43 PM',
      type: 'text',
    },
    {
      id: 'msg_ap_3',
      sender: 'buyer',
      text: 'Urrahat me kab mil sakte hain inspection ke liye?',
      timestamp: '03:45 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_ap_4',
      sender: 'seller',
      text: 'Urrahat me main sham 4 se 8 baje tak shop par rahunga, aakar test drive le lijiye.',
      timestamp: '03:47 PM',
      type: 'text',
    },
  ],

  // 8. LG TV - Deepak Gupta (Gupta Electronics & Appliances)
  listing_lg_tv: [
    {
      id: 'msg_tv_1',
      sender: 'buyer',
      text: 'Namaste Deepak ji, LG 43 Inch 4K Smart TV abhi stock me hai? Bill aur box saath me hai?',
      timestamp: '11:30 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_tv_2',
      sender: 'seller',
      text: 'Namaste! Haan bilkul available hai. Original bill, box aur magic remote sab complete hai.',
      timestamp: '11:32 AM',
      type: 'text',
    },
    {
      id: 'msg_tv_3',
      sender: 'seller',
      text: 'Shilpi Plaza me hamari shop par testing counter hai. Aap screen display, 4K picture aur sound check karke le jaiye.',
      timestamp: '11:35 AM',
      type: 'text',
    },
    {
      id: 'msg_tv_4',
      sender: 'buyer',
      text: 'Price negotiable hai?',
      timestamp: '11:38 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_tv_5',
      sender: 'seller',
      text: 'Bhaiya ₹17,500 tak cash me settle kar denge. Brand new condition hai.',
      timestamp: '11:40 AM',
      type: 'text',
    },
  ],

  // 9. Banarasi Saree - Priya Verma (Verma Saree & Fashion Boutique)
  listing_banarasi_saree: [
    {
      id: 'msg_sr_1',
      sender: 'buyer',
      text: 'Namaste Priya ji, Banarasi Silk Saree ka color bilkul photo jaisa royal red hai? Fabric pure silk hai?',
      timestamp: '02:10 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_sr_2',
      sender: 'seller',
      text: 'Namaste! Haanji, 100% pure katan silk hai with heavy authentic golden zari work. Unstitched blouse piece saath me hai.',
      timestamp: '02:14 PM',
      type: 'text',
    },
    {
      id: 'msg_sr_3',
      sender: 'seller',
      text: 'Venkat Road par Verma Boutique par aakar drape karke texture dekh sakti hain. Bohot royal look aayega.',
      timestamp: '02:16 PM',
      type: 'text',
    },
  ],

  // 10. Sagwan Bed - Santosh Vishwakarma (Vishwakarma Furniture Mart)
  listing_teak_bed: [
    {
      id: 'msg_bd_1',
      sender: 'buyer',
      text: 'Namaste Santosh ji, Sagwan teak wood double bed me hydraulic storage smooth kaam kar raha hai? Delivery Rewa me ho jayegi?',
      timestamp: '04:20 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_bd_2',
      sender: 'seller',
      text: 'Namaste bhai! Pure Sagwan (teak wood) ka heavy frame hai. Heavy duty hydraulic jack laga hai. Rewa city me free delivery aur fitting karva denge.',
      timestamp: '04:24 PM',
      type: 'text',
    },
    {
      id: 'msg_bd_3',
      sender: 'seller',
      text: 'Pili Kothi shop par aakar wood quality aur polish check kar lijiye.',
      timestamp: '04:26 PM',
      type: 'text',
    },
  ],

  // 11. Delivery Job - Rajesh Pandey (Rewa Express Logistics)
  listing_delivery_job: [
    {
      id: 'msg_jb_1',
      sender: 'buyer',
      text: 'Namaste Rajesh sir, Delivery partner vacancy abhi open hai? Timing aur joining process kya hai?',
      timestamp: '10:40 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_jb_2',
      sender: 'seller',
      text: 'Namaste! Haan vacancy open hai. Daily 9 AM se 6 PM shift hai, ₹15,000 fixed salary + daily petrol allowance milega.',
      timestamp: '10:43 AM',
      type: 'text',
    },
    {
      id: 'msg_jb_3',
      sender: 'seller',
      text: 'Aadhaar Card aur Driving Licence lekar New Bus Stand office me aaiye, same-day joining ho jayegi.',
      timestamp: '10:45 AM',
      type: 'text',
    },
  ],

  // 12. Swaraj Tractor - Ramakant Kushwaha (Kisan Tractor & Krishi Yantra)
  listing_swaraj_tractor: [
    {
      id: 'msg_tr_1',
      sender: 'buyer',
      text: 'Ramakant ji ram ram, Swaraj 744 FE tractor ka khet me chala kar trial mil jayega? Trolley saath me hai?',
      timestamp: '07:30 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_tr_2',
      sender: 'seller',
      text: 'Ram ram bhaiya! Haan hydraulic tipping trolley saath me hai. Power steering hai aur engine me 1 rupaye ka kaam nahi hai.',
      timestamp: '07:35 AM',
      type: 'text',
    },
    {
      id: 'msg_tr_3',
      sender: 'seller',
      text: 'Aap Chorhata aaiye, khet me rotavator aur trolley jodkar live trial lijiye.',
      timestamp: '07:38 AM',
      type: 'text',
    },
  ],

  // 13. Murrah Buffalo - Surendra Yadav (Yadav Dairy Farm)
  listing_murrah_buffalo: [
    {
      id: 'msg_bf_1',
      sender: 'buyer',
      text: 'Namaste Surendra ji, Murrah bhains ka doodh kitna nikal raha hai? Subah doodh nikaal kar dekh sakte hain?',
      timestamp: '06:15 AM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_bf_2',
      sender: 'seller',
      text: 'Namaste bhai! Dono time milakar 14 litre (subah 7L, sham 7L) doodh pakka hai. Sath me 1 mahine ka baccha hai.',
      timestamp: '06:19 AM',
      type: 'text',
    },
    {
      id: 'msg_bf_3',
      sender: 'seller',
      text: 'Aap Gudh Road dairy par aakar subah ya sham khud haath se doodh nikaal kar nap lijiye, bilkul santusht hokar le jaiye.',
      timestamp: '06:22 AM',
      type: 'text',
    },
  ],

  // 14. MPPSC Books - Neeraj Shukla (Shukla Book Depot & Xerox)
  listing_mppsc_books: [
    {
      id: 'msg_bk_1',
      sender: 'buyer',
      text: 'Namaste Neeraj bhaiya, MPPSC complete set me sabhi 12 kitabein latest 2024 syllabus wali hain?',
      timestamp: '05:10 PM',
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_bk_2',
      sender: 'seller',
      text: 'Haan bhai, bilkul latest updated syllabus hai. Koi marking ya cut nahi hai, saath me mains solved papers aur topper notes free hain.',
      timestamp: '05:13 PM',
      type: 'text',
    },
    {
      id: 'msg_bk_3',
      sender: 'seller',
      text: 'APSU University Gate par Shukla Book Depot se hand to hand collect kar sakte hain.',
      timestamp: '05:15 PM',
      type: 'text',
    },
  ],
};

/**
 * Generates initial chat messages for any listing if no prior chat exists.
 */
export function getInitialChatForListing(listing: Listing): ChatMessage[] {
  const sellerName = listing.seller?.proprietorName || listing.seller?.name || 'Seller';
  const location = listing.location?.neighborhood || 'Rewa';
  const price = listing.price ? `₹${listing.price.toLocaleString()}` : '';

  if (listing.categoryId === 'vehicles') {
    return [
      {
        id: `msg_init_1_${listing.id}`,
        sender: 'buyer',
        text: `Namaste ${sellerName} ji, kya aapki "${listing.title}" abhi available hai?`,
        timestamp: 'Just now',
        status: 'read',
        type: 'text',
      },
      {
        id: `msg_init_2_${listing.id}`,
        sender: 'seller',
        text: `Haan ji! Gaadi bilkul available hai (${price}). First-class condition me hai, single hand driven.`,
        timestamp: 'Just now',
        type: 'text',
      },
      {
        id: `msg_init_3_${listing.id}`,
        sender: 'seller',
        text: `Aap ${location} me aakar test drive le sakte hain aur papers check kar sakte hain.`,
        timestamp: 'Just now',
        type: 'text',
      },
    ];
  }

  if (listing.categoryId === 'mobiles') {
    return [
      {
        id: `msg_init_1_${listing.id}`,
        sender: 'buyer',
        text: `Namaste ${sellerName} ji, ${listing.title} abhi available hai? Kya bill aur box saath me hai?`,
        timestamp: 'Just now',
        status: 'read',
        type: 'text',
      },
      {
        id: `msg_init_2_${listing.id}`,
        sender: 'seller',
        text: `Haan ji, bilkul available hai! Phone 100% genuine hai, original condition aur testing warranty ke saath.`,
        timestamp: 'Just now',
        type: 'text',
      },
      {
        id: `msg_init_3_${listing.id}`,
        sender: 'seller',
        text: `Aap ${location} me aakar phone live chala kar check kar sakte hain.`,
        timestamp: 'Just now',
        type: 'text',
      },
    ];
  }

  if (listing.categoryId === 'property') {
    return [
      {
        id: `msg_init_1_${listing.id}`,
        sender: 'buyer',
        text: `Namaste ${sellerName} ji, ${listing.title} ke bare me enquiry karni thi. Kya visit kar sakte hain?`,
        timestamp: 'Just now',
        status: 'read',
        type: 'text',
      },
      {
        id: `msg_init_2_${listing.id}`,
        sender: 'seller',
        text: `Namaste! Haan property abhi available hai. ${location} me location bohot achhi hai.`,
        timestamp: 'Just now',
        type: 'text',
      },
      {
        id: `msg_init_3_${listing.id}`,
        sender: 'seller',
        text: `Aap call karke timing fix kar lijiye, main site par dikha dunga.`,
        timestamp: 'Just now',
        type: 'text',
      },
    ];
  }

  // General fallback for any other category (electronics, fashion, furniture, agri, pets, books, etc.)
  return [
    {
      id: `msg_init_1_${listing.id}`,
      sender: 'buyer',
      text: `Namaste ${sellerName} ji, kya ${listing.title} abhi available hai?`,
      timestamp: 'Just now',
      status: 'read',
      type: 'text',
    },
    {
      id: `msg_init_2_${listing.id}`,
      sender: 'seller',
      text: `Haan ji, item bilkul available hai (${price}). Immaculate condition me hai.`,
      timestamp: 'Just now',
      type: 'text',
    },
    {
      id: `msg_init_3_${listing.id}`,
      sender: 'seller',
      text: `Aap ${location} me aakar tasalli se check kar lijiye. Reasonable bargain bhi ho jayega.`,
      timestamp: 'Just now',
      type: 'text',
    },
  ];
}

/**
 * Generates an intelligent, context-aware seller reply based on message text and listing details.
 */
export function generateSellerReply(
  userText: string,
  listing: Listing
): string {
  const queryLower = userText.toLowerCase();
  const sellerName = listing.seller?.proprietorName || listing.seller?.name || 'Seller';
  const location = listing.location?.neighborhood || 'Rewa';
  const price = listing.price;
  const category = listing.categoryId || 'general';

  // 1. Bargain / Price negotiation queries
  if (
    queryLower.includes('cash') ||
    queryLower.includes('final') ||
    queryLower.includes('price') ||
    queryLower.includes('rate') ||
    queryLower.includes('discount') ||
    queryLower.includes('kam') ||
    queryLower.includes('offer') ||
    queryLower.includes('kitne')
  ) {
    if (price && price > 0) {
      const discount = Math.round(price * 0.05); // ~5% discount
      const discountedPrice = Math.round((price - discount) / 100) * 100;
      return `Bhaiya agar aap aaj hand-to-hand deal karte hain to ₹${discountedPrice.toLocaleString()} tak final settle kar lenge. Aamne-saamne baithkar baat kar lenge.`;
    }
    return `Haan ji, price me thoda bahut gunjaish ho jayegi. Aap aakar dekh lijiye, reasonable settlement kar denge.`;
  }

  // 2. Location / Address queries
  if (
    queryLower.includes('location') ||
    queryLower.includes('kahan') ||
    queryLower.includes('address') ||
    queryLower.includes('jagah') ||
    queryLower.includes('milna') ||
    queryLower.includes('aana')
  ) {
    return `Hamari dukaan/location ${location}, Rewa me hai. Aap aane se 15 minute pehle call kar lijiye, exact landmark samjha dunga.`;
  }

  // 3. Category specific queries
  if (category === 'vehicles') {
    if (
      queryLower.includes('rc') ||
      queryLower.includes('paper') ||
      queryLower.includes('document') ||
      queryLower.includes('challan')
    ) {
      return `Sabhi documents 100% clear hain bhaiya - Original MP17 Smart RC Card, valid Insurance aur NOC hand-to-hand name transfer ke liye ready hai.`;
    }
    if (
      queryLower.includes('test') ||
      queryLower.includes('drive') ||
      queryLower.includes('chala') ||
      queryLower.includes('dekh') ||
      queryLower.includes('sound')
    ) {
      return `Haan bilkul! Aaj sham 4 se 7 baje ke beech ${location} aakar gaadi start karke live test drive le sakte hain. Pickup aur engine condition ekdum smooth hai.`;
    }
    if (queryLower.includes('mileage') || queryLower.includes('average')) {
      return `Real-world city average bohot solid hai bhai, 50-55 kmpl aaram se nikalta hai. Regular servicing time par hui hai.`;
    }
  }

  if (category === 'mobiles') {
    if (
      queryLower.includes('battery') ||
      queryLower.includes('health') ||
      queryLower.includes('backup')
    ) {
      return `Battery health bilkul genuine hai aur full day backup deti hai. Phone kabhi khula ya repair nahi hua hai.`;
    }
    if (
      queryLower.includes('bill') ||
      queryLower.includes('box') ||
      queryLower.includes('charger') ||
      queryLower.includes('cable')
    ) {
      return `Original bill, box aur original cable dono saath me milenge. Diagnostic aur checking ke baad hi payment kijiye.`;
    }
    if (
      queryLower.includes('exchange') ||
      queryLower.includes('badal')
    ) {
      return `Aapka purana phone condition check karke exchange valuation par lag sakta hai. Shop par le aaiye.`;
    }
  }

  if (category === 'property') {
    if (
      queryLower.includes('visit') ||
      queryLower.includes('dekhna') ||
      queryLower.includes('kab')
    ) {
      return `Aap aaj sham 5 se 7 baje ya kal subah 10 baje flat visit kar sakte hain. Main khud available rahunga ${location} me.`;
    }
    if (
      queryLower.includes('water') ||
      queryLower.includes('paani') ||
      queryLower.includes('light') ||
      queryLower.includes('meter')
    ) {
      return `24 ghante meetha paani hai, separate electricity meter aur car parking facility available hai. Zero brokerage deal hai.`;
    }
  }

  if (category === 'fashion') {
    if (
      queryLower.includes('size') ||
      queryLower.includes('fitting') ||
      queryLower.includes('fabric') ||
      queryLower.includes('cloth')
    ) {
      return `Fabric pure quality ka hai, fitting perfect hai aur bilkul naye jaisa hai. Aakar tasalli se dekh sakte hain.`;
    }
  }

  if (category === 'agri') {
    if (
      queryLower.includes('tractor') ||
      queryLower.includes('hp') ||
      queryLower.includes('engine')
    ) {
      return `Tractor/machine ka engine ekdum powerful hai, khet me trial le sakte hain. Koi leakage ya dhuan nahi hai.`;
    }
  }

  if (category === 'pets') {
    if (
      queryLower.includes('milk') ||
      queryLower.includes('doodh') ||
      queryLower.includes('vaccin')
    ) {
      return `Pashu bilkul swasth aur shant swabhav ka hai. Daily milk yield aap subah/sham khud nikal kar dekh sakte hain.`;
    }
  }

  // 4. Default polite seller response mentioning the actual item
  return `Haan ji! "${listing.title}" ke regarding aap bilkul befikar rahein. Aap ${location} me aakar live check kar lijiye, deal ho jayegi.`;
}
