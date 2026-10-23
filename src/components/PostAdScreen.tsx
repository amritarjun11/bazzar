import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Listing, ShortReel } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { CATEGORIES } from '../data/mockData';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { compressImage } from '../utils/imageCompressor';

const REWA_NEIGHBORHOODS = [
  'Civil Lines',
  'College Road',
  'Urrahat',
  'Bodabag',
  'Kothi Compound',
  'University Road (APSU)',
  'Sirmour Chauraha',
  'Chorhata',
  'Dhekaha',
  'Govindgarh Road',
  'Narendra Nagar',
  'Ananthpur',
  'Huzur',
];

const SAMPLE_DEMO_PHOTOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIhCqgZqpm0dtVogbhLFtZ-_OxyKmlMNb2obN192caQPM6Mo2ZFUX4XaPGlT8QRUsqLMUBSTD8eBqkpTr8KJ4cHt52NDofKFeuWBXU_kUa1SWpXFDR5MK4gogwlNV22Ayc6agq-LkIJt5GL7_lXRJjDC7sgGbq_VmlNY2zE_LWkxdwe1WXX9oodvkNhk3_P4YTZfJw3ToOSNxR9Xz-F21QpslaMgLgCWMAu5TqIZXAbgEuRCBf4O1n',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBA7FsKNURt0XZXpLOrvNEsUH-R0c0e3pCF-quOO2eaKqE26t-vXHHZmuq0a4seg6JkH4Q8zL5MiMyIMdxdMZZdUpZkhztF_IOV5FCi-ep61opmaRT2udiry8HBEtXyfM-HdxrEtzPWhFsCK6eSEy1UiIXp79Bv0Tu4egSEsKHm_WtcUo6JrD1WUiF8bHOBEvnf6_4RvX9MeifwPqmC7qc0lJvTTBRUNrBzcPJoitax8eq7woI5Kf9B',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAGSFiYGkJu5EdbCSw_aM8sGqqD2M-mbS6oNwukCGGbByaGxSqrrFwJBDkqhPh835SbFeTjb8DXDowPjLg-gpLywhR_U8j4lv4s7NEWvNaLuD9GdJ2dssQrzcrDYabohQw_0p47HhUFJbA6WCG-4LC_HWoCzeB2saIhg3igo8TtpLkZ9nQibuHbtcrP2g2iumpalFo_XHBuIIDuB1sD3UJIS4FmiVtm7go2cKOerP64nvaKIsY0vt6A',
];

export const CATEGORY_HINDI_MAP: Record<string, { hi: string; hint: string }> = {
  vehicles: { hi: 'गाड़ियां व बाइक्स', hint: 'Bikes, Scooters, Cars, Jeeps' },
  mobiles: { hi: 'मोबाइल व टैबलेट', hint: 'Smartphones, iPads, Earbuds' },
  electronics: { hi: 'इलेक्ट्रॉनिक्स व टीवी', hint: 'Laptops, Smart TVs, AC, Fridge' },
  property: { hi: 'प्रॉपर्टी व मकान', hint: '1/2 BHK Flats, Plots, Shops' },
  fashion: { hi: 'फैशन व कपड़े', hint: 'Ethnic Wear, Shoes, Watches' },
  furniture: { hi: 'फर्नीचर व सजावट', hint: 'Beds, Sofa Sets, Tables' },
  jobs: { hi: 'नौकरी व सेवाएं', hint: 'Delivery, Driver, Technician, Tutor' },
  agri: { hi: 'कृषि व ट्रैक्टर', hint: 'Tractors, Trolleys, Seeds, Pumps' },
  pets: { hi: 'पशु व पालतू जानवर', hint: 'Cows, Buffaloes, Dogs, Puppies' },
  books: { hi: 'किताबें व खेल', hint: 'MPPSC/Govt Exam Books, Cricket Kit' },
};

export const PostAdScreen: React.FC = () => {
  const { goBack, navigateTo, addNewListing, currentUser, managedUsers, location, showToast } = useApp();

  const userRecord = managedUsers.find(
    u =>
      (currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.phone && u.phone === currentUser.phone)
  );
  const isBanned = userRecord?.status === 'banned';

  // Hidden file inputs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  // Safe file pickers that clear value before click to ensure re-selecting same file fires onChange
  const triggerGalleryPicker = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  const triggerCameraPicker = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const triggerVideoPicker = () => {
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
      videoInputRef.current.click();
    }
  };

  const triggerVideoCameraPicker = () => {
    if (videoCameraInputRef.current) {
      videoCameraInputRef.current.value = '';
      videoCameraInputRef.current.click();
    }
  };

  // URL Image Modal
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState('vehicles');
  const selectedCategoryObj = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];
  const [subCategory, setSubCategory] = useState(
    selectedCategoryObj.subcategories?.[0]?.name || 'General'
  );

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [negotiable, setNegotiable] = useState(true);
  const [condition, setCondition] = useState<'Used (Mint Condition)' | 'Good (Normal Wear)' | 'Brand New'>(
    'Used (Mint Condition)'
  );
  const [description, setDescription] = useState('');

  // Seller & Location
  const [sellerName, setSellerName] = useState(currentUser.name || 'Aman Verma');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98270 45678');
  const [neighborhood, setNeighborhood] = useState('Civil Lines');

  useEffect(() => {
    if (currentUser.name) setSellerName(currentUser.name);
    if (currentUser.phone) setPhone(currentUser.phone);
  }, [currentUser]);

  // Media state
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [hasWalkaroundVideo, setHasWalkaroundVideo] = useState(true);
  const [publishToShorts, setPublishToShorts] = useState(true);

  // Dynamic Category-specific Attributes
  // Vehicles
  const [kmDriven, setKmDriven] = useState('15,000 km');
  const [regYear, setRegYear] = useState('2022');
  const [fuelType, setFuelType] = useState('Petrol');
  const [owners, setOwners] = useState('1st Owner');

  // Mobiles & Electronics
  const [brand, setBrand] = useState('Apple');
  const [storage, setStorage] = useState('128 GB');
  const [ram, setRam] = useState('6 GB');
  const [batteryHealth, setBatteryHealth] = useState('90%+ Battery (Bill & Box available)');

  // Property
  const [propType, setPropType] = useState('2 BHK');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [carpetArea, setCarpetArea] = useState('1,050 sq.ft');

  // Fashion & Apparel
  const [fashionSize, setFashionSize] = useState('Free Size');
  const [fashionGender, setFashionGender] = useState('Women Ethnic & Saree');

  // Furniture
  const [furnitureMaterial, setFurnitureMaterial] = useState('Solid Teak Wood (सागौन)');

  // Jobs & Services
  const [jobType, setJobType] = useState('Full Time');
  const [salaryPeriod, setSalaryPeriod] = useState('₹15,000 - ₹25,000 / Month');

  // Agri & Farming
  const [agriPower, setAgriPower] = useState('45 HP (Tractor / Machine)');

  // Animals & Pets
  const [petBreed, setPetBreed] = useState('Murrah Buffalo / Desi Gir Cow');
  const [milkCapacity, setMilkCapacity] = useState('12 - 14 Litres / Day');

  // Books & Education
  const [examSubject, setExamSubject] = useState('MPPSC / MP Govt Exam Books');
  const [bookEdition, setBookEdition] = useState('Latest 2024 Edition (Complete Set)');

  // Electronics & Appliances
  const [electronicsType, setElectronicsType] = useState('Laptops & Computers');
  const [warrantyStatus, setWarrantyStatus] = useState('Original Bill & Warranty Available');

  // Fashion & Apparel extra
  const [fabricMaterial, setFabricMaterial] = useState('Pure Cotton / Silk');

  // Agri & Farming extra
  const [agriMachineType, setAgriMachineType] = useState('Tractors & Farm Machines');

  // Animals & Pets extra
  const [petVaccinated, setPetVaccinated] = useState('Fully Vaccinated & Health Checked');

  // Category View Toggle (grid vs chips)
  const [categoryViewMode, setCategoryViewMode] = useState<'grid' | 'chips'>('grid');

  // General / Other
  const [itemAge, setItemAge] = useState('6 Months Old');

  const [isAiFilling, setIsAiFilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Category Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat && cat.subcategories && cat.subcategories.length > 0) {
      setSubCategory(cat.subcategories[0].name);
    }
  };

  // ----------------------------------------------------
  // PHOTO UPLOAD (Gallery, Camera & Direct URL)
  // ----------------------------------------------------
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    if (photos.length >= 8) {
      showToast('⚠️ Maximum 8 photos can be added!');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    const addedPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (photos.length + addedPhotos.length >= 8) {
        showToast('⚠️ Maximum 8 photos ki limit tak pahunch gaye');
        break;
      }
      const file = files[i];

      try {
        // Step 1: Instant local compression via Canvas (resizes large camera/gallery photos in ~50ms)
        let localDataUrl = '';
        try {
          localDataUrl = await compressImage(file, 900, 900, 0.8);
        } catch (compressErr) {
          console.warn('Canvas compression fallback to FileReader:', compressErr);
          localDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        if (localDataUrl) {
          addedPhotos.push(localDataUrl);
          // Show photo on screen immediately without waiting for other files
          setPhotos(prev => (prev.length < 8 ? [...prev, localDataUrl] : prev));

          // Step 2: Background Supabase upload (if configured with real keys)
          if (isSupabaseConfigured) {
            supabaseService.uploadMedia(file, 'product-images')
              .then(cloudUrl => {
                if (cloudUrl) {
                  setPhotos(current => current.map(p => (p === localDataUrl ? cloudUrl : p)));
                }
              })
              .catch(storageErr => {
                console.warn('Supabase storage background upload note:', storageErr);
              });
          }
        }
      } catch (err) {
        console.error('Failed to process image from gallery:', err);
        showToast(`⚠️ Photo "${file.name}" add nahi ho saki.`);
      }
    }

    setIsUploadingImage(false);
    if (addedPhotos.length > 0) {
      showToast(`✅ ${addedPhotos.length} photo(s) gallery se safalta-poorvak add ho gayi!`);
      audioEngine.playChime();
    } else {
      showToast('⚠️ Koi photo add nahi ho payi. Kripya doosri photo chunein.');
    }

    // Always clear input value so re-picking the same photo triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;

    if (photos.length >= 8) {
      showToast('⚠️ Maximum 8 photos can be added!');
      return;
    }

    setPhotos(prev => [...prev, trimmed]);
    setCustomImageUrl('');
    setIsUrlModalOpen(false);
    showToast('✅ Photo URL successfully add ho gayi!');
    audioEngine.playChime();
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    showToast('Photo removed');
  };

  const handleSetCoverPhoto = (index: number) => {
    setPhotos(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
    showToast('🌟 Set as main cover photo!');
  };

  const handleUseDemoPhotos = () => {
    setPhotos(SAMPLE_DEMO_PHOTOS);
    showToast('📸 Added 3 sample verified vehicle photos!');
  };

  // ----------------------------------------------------
  // VIDEO REEL UPLOAD (Gallery & Camera)
  // ----------------------------------------------------
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoName(file.name || 'walkaround_reel.mp4');
      setHasWalkaroundVideo(true);
      setPublishToShorts(true);
      showToast('🎥 Walkaround Video attached! Will appear in Shorts Feed.');
    } catch (err) {
      console.error('Video select error:', err);
      showToast('Video attach failed. Please try another video.');
    }

    e.target.value = '';
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
    setVideoName('');
    showToast('Video walkaround removed');
  };

  // ----------------------------------------------------
  // AI SMART FILL
  // ----------------------------------------------------
  const handleSmartFillAi = () => {
    setIsAiFilling(true);
    setTimeout(() => {
      if (selectedCategoryId === 'vehicles') {
        setTitle('Honda Shine 125 Disc Brake - 2022 Single Owner (Mint Condition)');
        setPrice(74500);
        setNegotiable(true);
        setKmDriven('14,000 km');
        setRegYear('2022');
        setDescription(
          'Single owner Honda Shine 125cc drum/disc in immaculate condition. Regular oil servicing done at authorized Honda showroom Rewa. Mileage 55 kmpl. All documents (Smart RC, valid Insurance, PUC) ready for immediate name transfer in Rewa RTO.'
        );
      } else if (selectedCategoryId === 'mobiles') {
        setTitle('iPhone 13 128GB Midnight Black - 100% Genuine with Bill & Box');
        setPrice(38500);
        setNegotiable(true);
        setBrand('Apple');
        setStorage('128 GB');
        setDescription(
          'Super clean iPhone 13 128GB in pristine condition. Zero scratches, original screen with TrueTone and Face ID working 100%. Battery health 89%. Comes with original bill, box and Apple fast charging cable. Available for hand-to-hand deal in Rewa.'
        );
      } else if (selectedCategoryId === 'property') {
        setTitle('Spacious 2 BHK Modular Flat near APS University Rewa');
        setPrice(8500);
        setNegotiable(false);
        setPropType('2 BHK');
        setFurnishing('Semi-Furnished');
        setDescription(
          'Newly painted airy 2 BHK apartment near APSU Rewa. 24x7 water supply, modular kitchen, dedicated car parking and 3-side balcony. Zero brokerage. Ideal for working professionals, doctors or families.'
        );
      } else if (selectedCategoryId === 'electronics') {
        setTitle('LG 43 Inch 4K Ultra HD Smart LED TV (WebOS) with Remote');
        setPrice(18500);
        setNegotiable(true);
        setBrand('LG');
        setElectronicsType('Smart TVs & Monitors');
        setWarrantyStatus('Original Bill & Remote Available');
        setDescription(
          'Crystal clear 4K resolution with HDR10, built-in Netflix, YouTube & Prime Video. Perfect display without lines or dead pixels. Bill and magic remote included.'
        );
      } else if (selectedCategoryId === 'fashion') {
        setTitle('Designer Pure Silk Banarasi Saree with Stitched Blouse Piece');
        setPrice(3200);
        setNegotiable(true);
        setFashionSize('Free Size');
        setFabricMaterial('Pure Silk / Zari Work');
        setDescription(
          'Worn only once in a family function, completely dry-cleaned and spotless. Elegant golden zari border work with rich pallu. Matching unstitched blouse piece included.'
        );
      } else if (selectedCategoryId === 'furniture') {
        setTitle('Solid Sagwan Teak Wood 6x6 King Size Bed with Storage Box');
        setPrice(22000);
        setNegotiable(true);
        setFurnitureMaterial('Solid Teak Wood (सागौन)');
        setDescription(
          'Heavy duty pure Sagwan teak wood double bed with large hydraulic storage boxes. Termite-proof, very sturdy, scratch-free finish. Moving out of Rewa hence selling.'
        );
      } else if (selectedCategoryId === 'jobs') {
        setTitle('Urgent Hiring: Delivery Executive & Field Staff (Rewa City)');
        setPrice(18000);
        setNegotiable(false);
        setJobType('Full Time');
        setSalaryPeriod('₹15,000 - ₹20,000 / Month + Petrol Allowance');
        setDescription(
          'Looking for energetic delivery partners with two-wheeler and valid DL. Daily local delivery in Rewa city. Weekly incentives, timely payout on 1st of every month.'
        );
      } else if (selectedCategoryId === 'agri') {
        setTitle('Mahindra 575 DI Power Plus Tractor (45 HP) - Excellent Condition');
        setPrice(340000);
        setNegotiable(true);
        setAgriPower('45 HP (Mahindra DI)');
        setAgriMachineType('Tractors & Farm Machines');
        setDescription(
          'Well maintained 45 HP Mahindra tractor with good tyre grip (80%). Powerful engine, zero oil leakage, single hand driven on agricultural farm in Rewa district. Original RC.'
        );
      } else if (selectedCategoryId === 'pets') {
        setTitle('Desi Gir Cow (First Lactation) with Healthy Heifer Calf');
        setPrice(45000);
        setNegotiable(true);
        setPetBreed('Desi Gir Cow / Murrah');
        setMilkCapacity('12 - 14 Litres / Day');
        setPetVaccinated('Vaccinated by Rewa Veterinary Doctor');
        setDescription(
          'High milk yielding Desi Gir breed cow. Very calm and gentle nature. Giving 12-14 litres pure A2 milk daily. All regular vaccinations and deworming completed.'
        );
      } else if (selectedCategoryId === 'books') {
        setTitle('Complete MPPSC Pre & Mains Notes + Samiksha Publication Books');
        setPrice(2800);
        setNegotiable(true);
        setExamSubject('MPPSC / MP Govt Exam Books');
        setBookEdition('Latest 2024 Edition (Complete Set)');
        setDescription(
          'Comprehensive MPPSC preparation combo including MP GK, Polity, History, Science & Ethics. All books are unmarked and neat like new with latest syllabus.'
        );
      } else {
        setTitle('Premium Quality Product in Mint Condition (Rewa)');
        setPrice(5000);
        setNegotiable(true);
        setDescription(
          'Carefully used and well maintained item. Fully working without any flaws or defects. Available for inspection and immediate pick up in Rewa.'
        );
      }

      if (photos.length === 0) {
        setPhotos(SAMPLE_DEMO_PHOTOS);
      }

      setIsAiFilling(false);
      showToast('✨ AI Smart-Fill completed! Optimized title, pricing & specs.');
    }, 600);
  };

  const handlePreviewAudio = () => {
    audioEngine.playEngineSound(selectedCategoryId === 'vehicles' ? 'bike' : 'gadget');
    showToast('🔊 Playing Walkaround Audio Check (3s)...');
    setTimeout(() => audioEngine.stop(), 3000);
  };

  // ----------------------------------------------------
  // SUBMISSION
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBanned) {
      showToast('🚫 Account is BANNED by Admin. You cannot publish listings.');
      return;
    }

    // Validation 1: Photos
    if (photos.length === 0) {
      showToast('⚠️ Kripya gallery se kam se kam 1 photo select karein!');
      triggerGalleryPicker();
      return;
    }

    // Validation 2: Title
    if (!title.trim()) {
      showToast('⚠️ Kripya Ad ka Title darj karein!');
      return;
    }

    // Validation 3: Price
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      showToast('⚠️ Kripya valid Price (₹) darj karein!');
      return;
    }

    setIsSubmitting(true);

    // Build specs & attributes based on category
    const specsList: { label: string; value: string; verified?: boolean }[] = [];
    const attributesObj: Record<string, string> = {};

    if (selectedCategoryId === 'vehicles') {
      specsList.push(
        { label: 'Category', value: subCategory },
        { label: 'Registration Year', value: regYear },
        { label: 'Odometer', value: kmDriven },
        { label: 'Fuel Type', value: fuelType },
        { label: 'Ownership', value: owners },
        { label: 'RC Status', value: 'Original Smart Card Verified', verified: true }
      );
      attributesObj.odometerKm = kmDriven;
      attributesObj.regYear = regYear;
      attributesObj.fuelType = fuelType;
      attributesObj.owners = owners;
    } else if (selectedCategoryId === 'mobiles') {
      specsList.push(
        { label: 'Brand', value: brand },
        { label: 'Storage', value: storage },
        { label: 'RAM', value: ram },
        { label: 'Battery / Warranty', value: batteryHealth, verified: true }
      );
      attributesObj.brand = brand;
      attributesObj.storage = storage;
      attributesObj.ram = ram;
      attributesObj.batteryHealth = batteryHealth;
    } else if (selectedCategoryId === 'property') {
      specsList.push(
        { label: 'Configuration', value: propType },
        { label: 'Furnishing', value: furnishing },
        { label: 'Carpet Area', value: carpetArea },
        { label: 'Location', value: `${neighborhood}, Rewa` }
      );
      attributesObj.propType = propType;
      attributesObj.furnishing = furnishing;
      attributesObj.carpetArea = carpetArea;
    } else if (selectedCategoryId === 'electronics') {
      specsList.push(
        { label: 'Device Type', value: subCategory || electronicsType },
        { label: 'Brand', value: brand },
        { label: 'Warranty & Bill', value: warrantyStatus, verified: true },
        { label: 'Condition', value: condition }
      );
      attributesObj.brand = brand;
      attributesObj.electronicsType = electronicsType;
      attributesObj.warrantyStatus = warrantyStatus;
    } else if (selectedCategoryId === 'fashion') {
      specsList.push(
        { label: 'Category / Wear', value: subCategory || fashionGender },
        { label: 'Size', value: fashionSize },
        { label: 'Fabric / Material', value: fabricMaterial },
        { label: 'Condition', value: condition }
      );
      attributesObj.fashionSize = fashionSize;
      attributesObj.fashionGender = fashionGender;
      attributesObj.fabricMaterial = fabricMaterial;
    } else if (selectedCategoryId === 'furniture') {
      specsList.push(
        { label: 'Furniture Type', value: subCategory },
        { label: 'Material', value: furnitureMaterial },
        { label: 'Condition', value: condition }
      );
      attributesObj.furnitureMaterial = furnitureMaterial;
    } else if (selectedCategoryId === 'jobs') {
      specsList.push(
        { label: 'Job Role', value: subCategory },
        { label: 'Job Type', value: jobType },
        { label: 'Salary / Pay', value: salaryPeriod, verified: true },
        { label: 'Location', value: `${neighborhood}, Rewa` }
      );
      attributesObj.jobType = jobType;
      attributesObj.salaryPeriod = salaryPeriod;
    } else if (selectedCategoryId === 'agri') {
      specsList.push(
        { label: 'Machinery / Category', value: subCategory || agriMachineType },
        { label: 'Power / Brand', value: agriPower },
        { label: 'Condition', value: condition }
      );
      attributesObj.agriPower = agriPower;
      attributesObj.agriMachineType = agriMachineType;
    } else if (selectedCategoryId === 'pets') {
      specsList.push(
        { label: 'Breed / Animal Type', value: petBreed },
        { label: 'Milk Yield / Age', value: milkCapacity },
        { label: 'Health Status', value: petVaccinated, verified: true }
      );
      attributesObj.petBreed = petBreed;
      attributesObj.milkCapacity = milkCapacity;
      attributesObj.petVaccinated = petVaccinated;
    } else if (selectedCategoryId === 'books') {
      specsList.push(
        { label: 'Subject / Exam', value: examSubject },
        { label: 'Edition', value: bookEdition },
        { label: 'Condition', value: condition }
      );
      attributesObj.examSubject = examSubject;
      attributesObj.bookEdition = bookEdition;
    } else {
      specsList.push(
        { label: 'Category', value: selectedCategoryObj.name },
        { label: 'Condition', value: condition },
        { label: 'Age / Used', value: itemAge }
      );
      attributesObj.itemAge = itemAge;
    }

    const newAd: Listing = {
      id: `listing_user_${Date.now()}`,
      title: title.trim(),
      price: numericPrice,
      originalPrice: Math.round(numericPrice * 1.1),
      negotiable,
      categoryId: selectedCategoryId,
      categoryName: selectedCategoryObj.name,
      subCategory,
      condition,
      images: photos,
      hasVideoReel: (hasWalkaroundVideo || Boolean(videoUrl)) && publishToShorts,
      videoUrl: videoUrl || undefined,
      videoDurationSec: 28,
      videoThumbnail: photos[0],
      videoAudioTitle: `Original Sound - ${sellerName} (${subCategory})`,
      specs: specsList,
      attributes: attributesObj,
      description: [
        description.trim() ||
          `High quality ${title} available for sale in ${neighborhood}, Rewa. Contact for direct inspection and deal.`
      ],
      location: {
        city: 'Rewa',
        state: 'Madhya Pradesh',
        neighborhood,
        distanceKm: 0.8,
        pinCode: '486001',
      },
      seller: {
        id: currentUser.id || 'seller_' + (currentUser.phone ? currentUser.phone.replace(/\D/g, '') : Date.now()),
        name: sellerName.trim() || currentUser.name,
        handle: `@${(sellerName.trim() || currentUser.name).toLowerCase().replace(/\s+/g, '_')}_rewa`,
        avatar: currentUser.avatar,
        verified: true,
        rating: 4.9,
        reviewsCount: 15,
        location: {
          city: 'Rewa',
          state: 'Madhya Pradesh',
          neighborhood,
          distanceKm: 0.8,
        },
        activeAdsCount: (currentUser.activeAds || 0) + 1,
        soldCount: 2,
        followersCount: 840,
        reelViewsCount: '15k',
        memberSince: "Nov '23",
        responseRate: '100%',
        replyTime: '~3m',
        trustScore: 96,
        badges: (currentUser.isAdmin || userRecord?.role === 'admin')
          ? ['👑 Admin Verified', 'Master Admin Post']
          : ['Aadhaar Verified', 'BazaarReels Trusted'],
        phone: phone.trim() || currentUser.phone,
      },
      featured: true,
      verifiedRC: selectedCategoryId === 'vehicles',
      postedAgo: 'Just now',
      createdAt: Date.now(),
      viewsCount: 1,
      favoritesCount: 0,
      reelsViewsCount: publishToShorts ? 1 : undefined,
      status: 'active',
    };

    // If Supabase is connected, attempt sync to PostgreSQL
    if (isSupabaseConfigured) {
      try {
        await supabaseService.createListing(newAd, newAd.seller.id);
      } catch (dbErr) {
        console.warn('Supabase createListing warning (will persist locally):', dbErr);
      }
    }

    // Add to App state and sync with backend
    addNewListing(newAd);
    setIsSubmitting(false);
    audioEngine.playChime();
    showToast('🎉 आपकी पोस्ट लाइव हो गई! यह अब होम स्क्रीन पर सबसे आगे सभी को दिख रही है।');
    navigateTo('home');
  };

  return (
    <div className="pb-28 md:pb-12 max-w-2xl mx-auto bg-[#0b1326] min-h-screen">
      {/* Hidden File Inputs for Gallery & Camera (sr-only ensures element exists in DOM and triggers reliably on mobile) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,image/jpeg,image/png,image/webp,image/jpg,image/heic,image/heif"
        multiple
        onChange={handlePhotoSelect}
        className="sr-only"
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,image/jpeg,image/png,image/webp,image/jpg"
        capture="environment"
        onChange={handlePhotoSelect}
        className="sr-only"
        aria-hidden="true"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*,video/mp4,video/webm,video/quicktime"
        onChange={handleVideoSelect}
        className="sr-only"
        aria-hidden="true"
      />
      <input
        ref={videoCameraInputRef}
        type="file"
        accept="video/*,video/mp4"
        capture="environment"
        onChange={handleVideoSelect}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h2 className="text-sm font-extrabold text-[#dae2fd] flex items-center gap-1.5">
              <span>Post Advertisement</span>
              <span className="text-[10px] bg-[#8083ff]/20 text-[#8083ff] px-2 py-0.5 rounded-full font-bold">
                REWA
              </span>
            </h2>
            <p className="text-[10px] text-[#4edea3] font-semibold">
              Sell Faster with Photos & 30s Walkaround Reel
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSmartFillAi}
          disabled={isAiFilling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8083ff]/30 to-[#4edea3]/30 border border-[#8083ff]/60 text-xs font-bold text-[#dae2fd] hover:scale-105 transition-transform"
        >
          <span className={`material-symbols-outlined text-sm text-[#8083ff] ${isAiFilling ? 'animate-spin' : ''}`}>
            {isAiFilling ? 'progress_activity' : 'auto_awesome'}
          </span>
          <span>{isAiFilling ? 'Filling...' : 'Smart Fill AI'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Account Enforcement Banner */}
        {isBanned && (
          <div className="p-4 rounded-2xl bg-red-500/20 border-2 border-red-500/60 text-red-200 text-xs flex items-start gap-3 shadow-lg">
            <span className="material-symbols-outlined text-2xl text-red-400 shrink-0">block</span>
            <div>
              <h4 className="font-black text-red-300 text-sm">Account Restricted / Banned by Admin</h4>
              <p className="text-[11px] text-red-200/90 mt-0.5">
                Your account is currently suspended for policy violations. You are restricted from posting ads or walkaround reels. Contact <span className="text-white underline">amritarjun11@gmail.com</span> for review.
              </p>
            </div>
          </div>
        )}

        {!isBanned && userRecord?.warningsCount && userRecord.warningsCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-200 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg text-orange-400 shrink-0">warning</span>
            <div>
              <h4 className="font-bold text-orange-300">
                Administrative Warning Notice ({userRecord.warningsCount}/3 strikes)
              </h4>
              <p className="text-[11px] text-orange-200/80 mt-0.5">
                Latest warning: "{userRecord.warningsLog[0]?.reason}". Please ensure all item prices and condition details are 100% genuine.
              </p>
            </div>
          </div>
        )}

        {/* Category Selector (All 10 Categories Available) */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#8083ff]">category</span>
              <div>
                <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block">
                  Select Category * (श्रेणी चुनें)
                </label>
                <span className="text-[10px] text-[#4edea3] font-bold">
                  All 10 Categories Available (सभी 10 श्रेणियां उपलब्ध)
                </span>
              </div>
            </div>
            {/* View Mode Toggle: Grid vs Chips */}
            <div className="flex items-center gap-1 bg-[#131b2e] p-1 rounded-xl border border-[#2d3449]">
              <button
                type="button"
                onClick={() => setCategoryViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  categoryViewMode === 'grid'
                    ? 'bg-[#8083ff] text-[#0b1326] shadow-sm'
                    : 'text-[#908fa0] hover:text-[#dae2fd]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">grid_view</span>
                <span>Grid (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode('chips')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  categoryViewMode === 'chips'
                    ? 'bg-[#8083ff] text-[#0b1326] shadow-sm'
                    : 'text-[#908fa0] hover:text-[#dae2fd]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">view_stream</span>
                <span>Chips</span>
              </button>
            </div>
          </div>

          {/* Direct Category Dropdown (Always visible for fast selection of any category) */}
          <div>
            <label className="text-[10px] text-[#908fa0] uppercase block mb-1 font-semibold">
              Category Dropdown (ड्रॉपडाउन से चुनें - All 10)
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full bg-[#131b2e] border-2 border-[#8083ff]/40 focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] font-bold focus:outline-none transition-colors appearance-none pr-9 cursor-pointer"
              >
                {CATEGORIES.map((cat, index) => {
                  const meta = CATEGORY_HINDI_MAP[cat.id];
                  return (
                    <option key={cat.id} value={cat.id} className="bg-[#131b2e] text-[#dae2fd] py-1 font-medium">
                      {index + 1}. {cat.name} {meta ? `(${meta.hi})` : ''} - {cat.count}+ ads
                    </option>
                  );
                })}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8083ff] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* 10 Categories Grid View */}
          {categoryViewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
              {CATEGORIES.map(cat => {
                const isSelected = cat.id === selectedCategoryId;
                const meta = CATEGORY_HINDI_MAP[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#8083ff]/20 to-[#8083ff]/5 border-[#8083ff] shadow-md shadow-[#8083ff]/20 ring-1 ring-[#8083ff]'
                        : 'bg-[#131b2e] border-[#2d3449] hover:border-[#8083ff]/40 hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#8083ff] text-[#0b1326]'
                            : 'bg-[#222a3d] text-[#c0c1ff] group-hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                      </div>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-sm text-[#4edea3]">check_circle</span>
                      ) : (
                        <span className="text-[9px] text-[#908fa0]">{cat.subcategories?.length || 0} sub</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#8083ff]' : 'text-[#dae2fd]'}`}>
                        {cat.name}
                      </p>
                      {meta && (
                        <p className="text-[10px] text-[#908fa0] leading-tight mt-0.5">
                          {meta.hi}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Category Chips Horizontal Scroll (All 10 Categories!) */
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => {
                const isSelected = cat.id === selectedCategoryId;
                const meta = CATEGORY_HINDI_MAP[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-[#8083ff] text-[#0b1326] border-[#8083ff] shadow-md shadow-[#8083ff]/30 scale-105'
                        : 'bg-[#131b2e] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd] hover:border-[#8083ff]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                    {meta && <span className="opacity-70 text-[10px]">({meta.hi})</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Subcategory Dropdown & Quick Badges */}
          {selectedCategoryObj.subcategories && selectedCategoryObj.subcategories.length > 0 && (
            <div className="pt-2 border-t border-[#222a3d] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#908fa0] uppercase font-bold tracking-wider">
                  Sub-Category for {selectedCategoryObj.name} *
                </label>
                <span className="text-[10px] text-[#8083ff] font-bold">
                  {subCategory}
                </span>
              </div>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3 py-2 text-xs text-[#dae2fd] focus:outline-none"
              >
                {selectedCategoryObj.subcategories.map(sub => (
                  <option key={sub.name} value={sub.name} className="bg-[#131b2e] text-[#dae2fd]">
                    {sub.name} ({sub.count}+ ads)
                  </option>
                ))}
              </select>

              {/* Quick Subcategory Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCategoryObj.subcategories.map(sub => {
                  const isSubSelected = sub.name === subCategory;
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => setSubCategory(sub.name)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSubSelected
                          ? 'bg-[#8083ff]/30 text-[#c0c1ff] border-[#8083ff]'
                          : 'bg-[#131b2e] text-[#908fa0] border-[#2d3449] hover:text-white'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Photos Gallery Section */}
        <div
          className={`bg-[#171f33] border rounded-2xl p-4 transition-colors ${
            photos.length === 0 ? 'border-amber-400/50' : 'border-[#2d3449]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-extrabold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#4edea3]">photo_library</span>
                <span>Product Photos ({photos.length}/8) *</span>
              </h3>
              <p className="text-[10px] text-[#908fa0]">
                {photos.length === 0
                  ? '⚠️ Kripya gallery se kam se kam 1 photo select karein'
                  : 'Pehli photo main cover card banegi (Tap on any photo to set as cover)'}
              </p>
            </div>

            {photos.length === 0 && (
              <button
                type="button"
                onClick={handleUseDemoPhotos}
                className="text-[10px] bg-[#8083ff]/20 text-[#8083ff] hover:bg-[#8083ff]/30 px-2 py-1 rounded-lg font-bold transition-colors"
              >
                Use Demo Photos
              </button>
            )}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
            {photos.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#2d3449] group bg-[#0b1326]"
              >
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover badge */}
                {i === 0 ? (
                  <span className="absolute top-1 left-1 bg-[#4edea3] text-[#0b1326] text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                    COVER PHOTO
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCoverPhoto(i)}
                    className="absolute bottom-1 left-1 bg-black/75 hover:bg-[#8083ff] text-white hover:text-[#0b1326] text-[8px] font-bold px-1.5 py-0.5 rounded transition-colors"
                  >
                    Set Cover
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                  title="Delete Photo"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}

            {/* Uploading Progress Indicator Card */}
            {isUploadingImage && (
              <div className="aspect-square rounded-xl border-2 border-dashed border-[#8083ff]/60 bg-[#8083ff]/10 flex flex-col items-center justify-center gap-1.5 text-[#8083ff] p-2 text-center animate-pulse">
                <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                <span className="text-[10px] font-bold text-white">Adding Photo...</span>
                <span className="text-[8px] text-[#908fa0]">Compressing</span>
              </div>
            )}

            {/* Add Photo Button (Triggers Gallery) */}
            {photos.length < 8 && (
              <button
                type="button"
                onClick={triggerGalleryPicker}
                disabled={isUploadingImage}
                className="aspect-square rounded-xl border-2 border-dashed border-[#8083ff]/50 hover:border-[#8083ff] bg-[#131b2e]/60 hover:bg-[#131b2e] flex flex-col items-center justify-center gap-1 text-[#dae2fd] transition-all group p-2 text-center"
              >
                <span className="material-symbols-outlined text-2xl text-[#8083ff] group-hover:scale-110 transition-transform">
                  add_photo_alternate
                </span>
                <span className="text-[11px] font-bold text-white leading-tight">
                  + Gallery
                </span>
                <span className="text-[9px] text-[#908fa0]">Chunein</span>
              </button>
            )}

            {/* Camera Button (Triggers Device Camera) */}
            {photos.length < 8 && (
              <button
                type="button"
                onClick={triggerCameraPicker}
                disabled={isUploadingImage}
                className="aspect-square rounded-xl border-2 border-dashed border-[#4edea3]/40 hover:border-[#4edea3] bg-[#131b2e]/60 hover:bg-[#131b2e] flex flex-col items-center justify-center gap-1 text-[#dae2fd] transition-all group p-2 text-center"
              >
                <span className="material-symbols-outlined text-2xl text-[#4edea3] group-hover:scale-110 transition-transform">
                  photo_camera
                </span>
                <span className="text-[11px] font-bold text-white leading-tight">
                  📷 Camera
                </span>
                <span className="text-[9px] text-[#908fa0]">Photo lein</span>
              </button>
            )}
          </div>

          {/* Action Helper Bar */}
          <div className="mt-3 pt-3 border-t border-[#222a3d] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={triggerGalleryPicker}
                className="px-3 py-1.5 rounded-lg bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#8083ff] font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">collections</span>
                <span>Gallery se Upload</span>
              </button>
              <button
                type="button"
                onClick={triggerCameraPicker}
                className="px-3 py-1.5 rounded-lg bg-[#4edea3]/20 hover:bg-[#4edea3]/30 text-[#4edea3] font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#c0c1ff] font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                <span>Photo Link (URL)</span>
              </button>
            </div>
            <span className="text-[10px] text-[#908fa0]">
              Supports JPG, PNG, WEBP (Max 8)
            </span>
          </div>
        </div>

        {/* 30s Video Walkaround Reel Card */}
        <div className="bg-gradient-to-br from-[#171f33] to-[#1a233a] border-2 border-[#ffb2b7]/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2b7] animate-ping" />
              <h3 className="text-xs font-black text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
                <span>30s Video Walkaround Reel</span>
                <span className="bg-[#ffb2b7] text-[#67001b] font-black text-[9px] px-1.5 py-0.5 rounded">
                  SHORTS
                </span>
              </h3>
            </div>
            <span className="text-[10px] text-[#4edea3] font-bold">
              {videoUrl ? '✅ Video Attached' : 'Optional (Free Promotion)'}
            </span>
          </div>

          {videoUrl ? (
            <div className="flex items-center gap-3 bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] text-white px-1 rounded font-bold">
                  Reel
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#dae2fd] truncate">
                  {videoName || 'walkaround_reel.mp4'}
                </p>
                <p className="text-[10px] text-[#4edea3] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>Ready for Rewa Shorts feed</span>
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handlePreviewAudio}
                    className="px-2 py-1 rounded bg-[#222a3d] hover:bg-[#8083ff] hover:text-[#0b1326] text-[#c0c1ff] text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">volume_up</span>
                    <span>Sound Check</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[10px] font-bold transition-colors"
                  >
                    Remove Video
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1326] p-3.5 rounded-xl border border-[#2d3449] space-y-2">
              <p className="text-xs text-[#dae2fd]">
                गाड़ी या सामान का 30 सेकंड का छोटा वीडियो जोड़ें — रीवा के खरीदार वीडियो देखकर 3 गुना तेज़ी से खरीदते हैं!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={triggerVideoPicker}
                  className="px-3 py-2 rounded-xl bg-[#8083ff]/20 hover:bg-[#8083ff]/30 text-[#dae2fd] border border-[#8083ff]/50 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-base text-[#8083ff]">video_library</span>
                  <span>Gallery se Video chune</span>
                </button>
                <button
                  type="button"
                  onClick={triggerVideoCameraPicker}
                  className="px-3 py-2 rounded-xl bg-[#ffb2b7]/20 hover:bg-[#ffb2b7]/30 text-[#dae2fd] border border-[#ffb2b7]/50 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-base text-[#ffb2b7]">videocam</span>
                  <span>Video banayein</span>
                </button>
              </div>
            </div>
          )}

          {/* Toggle to publish to Shorts feed */}
          <div className="mt-3 pt-3 border-t border-[#222a3d] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#dae2fd] block">
                Publish to Rewa Shorts Feed
              </span>
              <span className="text-[10px] text-[#908fa0]">
                Free automatic promotion to 45,000+ local buyers in Rewa
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPublishToShorts(!publishToShorts)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                publishToShorts ? 'bg-[#4edea3]' : 'bg-[#2d3449]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#0b1326] transition-transform ${
                  publishToShorts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Ad Title */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Ad Title *
            </label>
            <span className="text-[10px] text-[#908fa0]">{title.length}/70</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={70}
            placeholder={
              selectedCategoryId === 'vehicles'
                ? 'उदा. Honda Shine 125 Disc - 2022 Single Owner'
                : selectedCategoryId === 'mobiles'
                ? 'उदा. iPhone 13 128GB Midnight Blue with Bill Box'
                : selectedCategoryId === 'property'
                ? 'उदा. 2 BHK Modern Flat near APSU Rewa'
                : selectedCategoryId === 'electronics'
                ? 'उदा. LG 43 Inch 4K Smart LED TV with Bill'
                : selectedCategoryId === 'fashion'
                ? 'उदा. Pure Banarasi Silk Saree with Blouse'
                : selectedCategoryId === 'furniture'
                ? 'उदा. Sagwan Teak Wood King Size Double Bed'
                : selectedCategoryId === 'jobs'
                ? 'उदा. Delivery Partner & Driver Wanted in Rewa'
                : selectedCategoryId === 'agri'
                ? 'उदा. Mahindra 575 DI Tractor 45 HP - 2022'
                : selectedCategoryId === 'pets'
                ? 'उदा. Desi Gir Cow (12L Daily Milk) with Calf'
                : selectedCategoryId === 'books'
                ? 'उदा. Complete MPPSC Pre+Mains Notes Combo'
                : 'उदा. Product Title in Mint Condition'
            }
            className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Listing Price */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Listing Price (₹) *
            </label>
            <span className="text-[10px] text-[#4edea3] font-bold">
              Fair Market Price
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-[#908fa0]">
              ₹
            </span>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 75000"
              className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl pl-8 pr-4 py-2.5 text-base font-extrabold text-[#dae2fd] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-bold text-[#dae2fd] block">
                Allow Buyer Price Bargaining (मोल-भाव)
              </span>
              <span className="text-[10px] text-[#908fa0]">
                Buyers can submit counter offers directly in chat
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNegotiable(!negotiable)}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                negotiable ? 'bg-[#8083ff]' : 'bg-[#2d3449]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0b1326] transition-transform ${
                  negotiable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Condition Pills */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4">
          <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block mb-2">
            Item Condition
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Used (Mint Condition)', 'Good (Normal Wear)', 'Brand New'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  condition === c
                    ? 'bg-[#8083ff] text-[#0b1326] shadow'
                    : 'bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] border border-[#2d3449]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Category Attributes */}
        {selectedCategoryId === 'vehicles' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Vehicle Attributes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  KM Driven
                </label>
                <input
                  type="text"
                  value={kmDriven}
                  onChange={e => setKmDriven(e.target.value)}
                  placeholder="e.g. 14,200 km"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Reg Year
                </label>
                <input
                  type="text"
                  value={regYear}
                  onChange={e => setRegYear(e.target.value)}
                  placeholder="e.g. 2022"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Fuel Type
                </label>
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  No. of Owners
                </label>
                <select
                  value={owners}
                  onChange={e => setOwners(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="1st Owner">1st Owner</option>
                  <option value="2nd Owner">2nd Owner</option>
                  <option value="3rd Owner">3rd Owner</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'mobiles' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Mobile Specs
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Apple, OnePlus, Samsung"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Storage
                </label>
                <select
                  value={storage}
                  onChange={e => setStorage(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="64 GB">64 GB</option>
                  <option value="128 GB">128 GB</option>
                  <option value="256 GB">256 GB</option>
                  <option value="512 GB">512 GB</option>
                  <option value="1 TB">1 TB</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Battery Health & Bill Details
                </label>
                <input
                  type="text"
                  value={batteryHealth}
                  onChange={e => setBatteryHealth(e.target.value)}
                  placeholder="e.g. 92% Battery Health, Original Bill & Box"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'property' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Type / BHK
                </label>
                <select
                  value={propType}
                  onChange={e => setPropType(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Shop">Commercial Shop</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={e => setFurnishing(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Carpet Area
                </label>
                <input
                  type="text"
                  value={carpetArea}
                  onChange={e => setCarpetArea(e.target.value)}
                  placeholder="e.g. 1000 sq.ft"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'electronics' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">laptop_mac</span>
              <span>Electronics & Appliance Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Brand / Company
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Samsung, LG, HP, Sony"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Appliance Type
                </label>
                <select
                  value={electronicsType}
                  onChange={e => setElectronicsType(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Smart TVs & Monitors">Smart TVs & Monitors</option>
                  <option value="Laptops & Computers">Laptops & Computers</option>
                  <option value="Refrigerators & ACs">Refrigerators & ACs</option>
                  <option value="Audio Systems & Speakers">Audio Systems & Speakers</option>
                  <option value="Washing Machines">Washing Machines</option>
                  <option value="Cameras & Accessories">Cameras & Accessories</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Warranty & Bill Status
                </label>
                <input
                  type="text"
                  value={warrantyStatus}
                  onChange={e => setWarrantyStatus(e.target.value)}
                  placeholder="e.g. 8 Months Warranty Left, Original Tax Invoice Available"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'fashion' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">checkroom</span>
              <span>Fashion & Apparel Attributes</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Size / Fit
                </label>
                <select
                  value={fashionSize}
                  onChange={e => setFashionSize(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Free Size">Free Size</option>
                  <option value="S (Small)">S (Small)</option>
                  <option value="M (Medium)">M (Medium)</option>
                  <option value="L (Large)">L (Large)</option>
                  <option value="XL (Extra Large)">XL (Extra Large)</option>
                  <option value="XXL">XXL</option>
                  <option value="UK 7 / 8 / 9 (Shoes)">UK 7 / 8 / 9 (Shoes)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Gender / Category
                </label>
                <select
                  value={fashionGender}
                  onChange={e => setFashionGender(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Women Ethnic & Saree">Women Ethnic & Saree</option>
                  <option value="Men Wear">Men Wear</option>
                  <option value="Footwear & Sneakers">Footwear & Sneakers</option>
                  <option value="Watches & Accessories">Watches & Accessories</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={fabricMaterial}
                  onChange={e => setFabricMaterial(e.target.value)}
                  placeholder="e.g. Pure Silk, 100% Cotton, Genuine Leather"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'furniture' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">chair</span>
              <span>Furniture Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Material & Wood Type
                </label>
                <select
                  value={furnitureMaterial}
                  onChange={e => setFurnitureMaterial(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Solid Teak Wood (सागौन)">Solid Teak Wood (सागौन)</option>
                  <option value="Sheesham Wood (शीशम)">Sheesham Wood (शीशम)</option>
                  <option value="Engineered Wood / Plywood">Engineered Wood / Plywood</option>
                  <option value="Steel / Iron Frame">Steel / Iron Frame</option>
                  <option value="Fabric & Leatherette Sofa">Fabric & Leatherette Sofa</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Item Age / Usage
                </label>
                <input
                  type="text"
                  value={itemAge}
                  onChange={e => setItemAge(e.target.value)}
                  placeholder="e.g. 1 Year Old, Sparingly used in guest room"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'jobs' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">work</span>
              <span>Job Vacancy / Service Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Employment Type
                </label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract / Freelance">Contract / Freelance</option>
                  <option value="Urgent Requirement">Urgent Requirement</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Salary / Compensation
                </label>
                <input
                  type="text"
                  value={salaryPeriod}
                  onChange={e => setSalaryPeriod(e.target.value)}
                  placeholder="e.g. ₹15,000 - ₹22,000 / Month"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'agri' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">agriculture</span>
              <span>Agriculture & Farming Attributes</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Equipment Category
                </label>
                <select
                  value={agriMachineType}
                  onChange={e => setAgriMachineType(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                >
                  <option value="Tractors & Farm Machines">Tractors & Farm Machines</option>
                  <option value="Trolleys & Cultivators">Trolleys & Cultivators</option>
                  <option value="Solar Pumps & Irrigation">Solar Pumps & Irrigation</option>
                  <option value="Seeds & Organic Fertilizers">Seeds & Organic Fertilizers</option>
                  <option value="Harvester & Thresher">Harvester & Thresher</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Power / HP / Brand
                </label>
                <input
                  type="text"
                  value={agriPower}
                  onChange={e => setAgriPower(e.target.value)}
                  placeholder="e.g. 45 HP Mahindra DI / Swaraj"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'pets' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">pets</span>
              <span>Animals & Dairy Livestock Attributes</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Breed / Animal Type
                </label>
                <input
                  type="text"
                  value={petBreed}
                  onChange={e => setPetBreed(e.target.value)}
                  placeholder="e.g. Desi Gir Cow, Murrah Buffalo, GSD Puppy"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Daily Milk Yield / Age
                </label>
                <input
                  type="text"
                  value={milkCapacity}
                  onChange={e => setMilkCapacity(e.target.value)}
                  placeholder="e.g. 12 - 14 Litres / Day"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Veterinary / Health Status
                </label>
                <input
                  type="text"
                  value={petVaccinated}
                  onChange={e => setPetVaccinated(e.target.value)}
                  placeholder="e.g. Fully Vaccinated, Dewormed & Checked by Rewa Vet"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategoryId === 'books' && (
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#8083ff]">sports_cricket</span>
              <span>Books, Coaching & Sports Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Subject / Examination
                </label>
                <input
                  type="text"
                  value={examSubject}
                  onChange={e => setExamSubject(e.target.value)}
                  placeholder="e.g. MPPSC, MP Police, NEET, UPSC"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                  Edition / Condition
                </label>
                <input
                  type="text"
                  value={bookEdition}
                  onChange={e => setBookEdition(e.target.value)}
                  placeholder="e.g. 2024 Latest Edition (Complete Notes)"
                  className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Description */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              Detailed Description *
            </label>
            <button
              type="button"
              onClick={handleSmartFillAi}
              className="text-[10px] text-[#8083ff] font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">auto_fix_high</span>
              <span>Enhance with AI</span>
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="सामान की स्थिति, सर्विस रिकॉर्ड, बिल, वारंटी और मिलने की जगह का पूरा विवरण यहाँ लिखें..."
            className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl p-3 text-xs text-[#dae2fd] focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Location & Seller Contact */}
        <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-4 space-y-3">
          <label className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider block">
            Seller & Rewa Location Details
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                Seller Name
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="Aapka Naam"
                className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                Phone / WhatsApp Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98270 XXXXX"
                className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-[#908fa0] uppercase block mb-1">
                Rewa Neighborhood / Area
              </label>
              <select
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl px-3 py-2 text-xs text-[#dae2fd]"
              >
                {REWA_NEIGHBORHOODS.map(n => (
                  <option key={n} value={n} className="bg-[#131b2e] text-[#dae2fd]">
                    {n}, Rewa (MP)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[10px] text-[#908fa0] flex items-center gap-1 pt-1">
            <span className="material-symbols-outlined text-xs text-[#4edea3]">
              verified_user
            </span>
            <span>Home address is kept private. Only neighborhood is shown to buyers for safety.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 py-3 rounded-2xl bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-bold text-[#dae2fd] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-[#8083ff] via-[#4edea3] to-[#8083ff] text-[#0b1326] text-xs font-black tracking-wide shadow-xl shadow-[#8083ff]/30 flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isSubmitting ? 'hourglass_top' : 'rocket_launch'}
            </span>
            <span>{isSubmitting ? 'Publishing...' : 'Publish Ad + Reel'}</span>
          </button>
        </div>
      </form>

      {/* Add Photo via URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0b1326] border border-[#2d3449] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8083ff]">link</span>
                <span>Add Photo via Image URL / Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#171f33] text-[#908fa0] hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#908fa0]">
              Yahan kisi bhi image ka online direct link (https://...) paste karein ya sample photo chunein:
            </p>

            <form onSubmit={handleAddImageUrl} className="space-y-3">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImageUrl}
                onChange={e => setCustomImageUrl(e.target.value)}
                autoFocus
                className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#8083ff] rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] focus:outline-none"
              />

              {/* Quick sample pickers */}
              <div className="space-y-1">
                <span className="text-[10px] text-[#908fa0] uppercase font-bold">Quick Sample Photos:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SAMPLE_DEMO_PHOTOS.map((sampleUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomImageUrl(sampleUrl)}
                      className="w-12 h-12 rounded-lg overflow-hidden border border-[#2d3449] hover:border-[#8083ff] shrink-0"
                    >
                      <img src={sampleUrl} alt="Sample" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#171f33] text-xs font-bold text-[#908fa0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customImageUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-[#8083ff] hover:bg-[#8083ff]/90 text-[#0b1326] text-xs font-bold disabled:opacity-50"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
