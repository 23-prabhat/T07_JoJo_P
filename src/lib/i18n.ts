export type Lang = "en" | "hi" | "mr";

export const translations = {
  en: {
    nav: {
      howItWorks: "How It Works",
      features: "Features",
      channels: "Channels",
    },
    hero: {
      badge: "Financial document protection",
      headline1: "Understand before",
      headline2: "you",
      headline3: "agree",
      subtitle:
        "Upload any financial document — loans, contracts, terms & conditions — and get a plain-language risk assessment before you sign.",
      trust: "Your documents are analyzed securely and never stored.",
    },
    upload: {
      drag: "Drag & drop your document",
      dragActive: "Drop your file here",
      browse: "browse files",
      hint: "PDF or TXT, up to 10MB",
      analyze: "Analyze Document",
      analyzing: "Analyzing...",
      errorType: "Only PDF and TXT files are supported.",
      errorSize: "File must be under 10MB.",
    },
    howItWorks: {
      label: "How it works",
      headline: "Three steps to informed consent",
      steps: [
        {
          num: "01",
          title: "Upload your document",
          desc: "Drop a PDF or text file — loan agreements, insurance terms, consent forms, or any financial document you need to sign.",
        },
        {
          num: "02",
          title: "AI decodes the fine print",
          desc: "Our AI reads every clause, flags hidden risks, and rewrites the document in plain language at your reading level.",
        },
        {
          num: "03",
          title: "Know your risk score",
          desc: "Get a clear risk assessment, a list of what you're actually agreeing to, and a short quiz to make sure you understand.",
        },
      ],
    },
    features: {
      label: "Features",
      headline: "Everything you need to consent safely",
      items: [
        {
          title: "Risk Meter",
          desc: "A visual 0–100 risk gauge that instantly shows how risky a document is — color-coded from green to red.",
        },
        {
          title: "Plain-Language Summary",
          desc: "Complex legalese rewritten in simple words. Choose your reading level from ELI5 to expert.",
        },
        {
          title: "Flagged Clauses",
          desc: "Hidden auto-renewals, data sharing terms, and arbitration clauses highlighted with clear explanations.",
        },
        {
          title: "Comprehension Quiz",
          desc: "Three quick questions to ensure you truly understand what you're agreeing to before giving consent.",
        },
        {
          title: "Multi-Language",
          desc: "Get analysis in your preferred language — English, Hindi, Marathi, and more. No barriers to understanding.",
        },
        {
          title: "Key Obligations",
          desc: "A clear bullet-point list of exactly what you're committing to — no more guessing or glossing over.",
        },
      ],
    },
    channels: {
      label: "Available everywhere",
      headline: "Meet users where they are",
      subtitle:
        "Same AI analysis engine, three different ways to access it — whichever is most comfortable for you.",
      items: [
        {
          title: "Web App",
          desc: "Upload documents directly in your browser for a full risk assessment with interactive results.",
          tag: "You're here",
        },
        {
          title: "Browser Extension",
          desc: "Analyze terms & conditions on any website in real time — right where you encounter them.",
          tag: "Chrome",
        },
        {
          title: "Chat Bots",
          desc: "Send a PDF via Telegram or WhatsApp and get your risk analysis right in the conversation.",
          tag: "Telegram & WhatsApp",
        },
      ],
    },
    cta: {
      headline: "Don't sign blind",
      subtitle:
        "Upload your document now and understand every clause, every risk, every obligation — in plain language.",
      button: "Get started",
    },
    footer: {
      tagline: "Read the fine print. Protect your rights.",
      built: "Built for MIT Hack for Impact 2026",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "Telegram",
      },
    },
  },

  hi: {
    nav: {
      howItWorks: "यह कैसे काम करता है",
      features: "विशेषताएं",
      channels: "चैनल",
    },
    hero: {
      badge: "वित्तीय दस्तावेज़ सुरक्षा",
      headline1: "सहमति से पहले",
      headline2: "समझें",
      headline3: "ज़रूर",
      subtitle:
        "कोई भी वित्तीय दस्तावेज़ अपलोड करें — ऋण, अनुबंध, नियम और शर्तें — और हस्ताक्षर करने से पहले सरल भाषा में जोखिम मूल्यांकन प्राप्त करें।",
      trust: "आपके दस्तावेज़ सुरक्षित रूप से विश्लेषित होते हैं और कभी संग्रहीत नहीं किए जाते।",
    },
    upload: {
      drag: "अपना दस्तावेज़ यहाँ छोड़ें",
      dragActive: "फ़ाइल यहाँ छोड़ें",
      browse: "फ़ाइलें ब्राउज़ करें",
      hint: "PDF या TXT, 10MB तक",
      analyze: "दस्तावेज़ विश्लेषण करें",
      analyzing: "विश्लेषण हो रहा है...",
      errorType: "केवल PDF और TXT फ़ाइलें समर्थित हैं।",
      errorSize: "फ़ाइल 10MB से कम होनी चाहिए।",
    },
    howItWorks: {
      label: "कैसे काम करता है",
      headline: "सूचित सहमति के तीन चरण",
      steps: [
        {
          num: "01",
          title: "अपना दस्तावेज़ अपलोड करें",
          desc: "PDF या टेक्स्ट फ़ाइल डालें — ऋण समझौते, बीमा शर्तें, सहमति फ़ॉर्म, या कोई भी वित्तीय दस्तावेज़।",
        },
        {
          num: "02",
          title: "AI बारीक प्रिंट पढ़ता है",
          desc: "हमारा AI हर खंड पढ़ता है, छिपे जोखिमों को चिह्नित करता है, और दस्तावेज़ को सरल भाषा में फिर से लिखता है।",
        },
        {
          num: "03",
          title: "जोखिम स्कोर जानें",
          desc: "स्पष्ट जोखिम मूल्यांकन, आप जिससे सहमत हो रहे हैं उसकी सूची, और एक छोटी प्रश्नोत्तरी प्राप्त करें।",
        },
      ],
    },
    features: {
      label: "विशेषताएं",
      headline: "सुरक्षित सहमति के लिए सब कुछ",
      items: [
        {
          title: "जोखिम मीटर",
          desc: "एक दृश्य 0–100 जोखिम गेज जो तुरंत दिखाता है कि दस्तावेज़ कितना जोखिम भरा है।",
        },
        {
          title: "सरल भाषा सारांश",
          desc: "जटिल कानूनी भाषा को सरल शब्दों में फिर से लिखा गया। ELI5 से विशेषज्ञ तक अपना स्तर चुनें।",
        },
        {
          title: "चिह्नित खंड",
          desc: "छिपे ऑटो-नवीनीकरण, डेटा साझाकरण शर्तें, और मध्यस्थता खंड स्पष्ट स्पष्टीकरण के साथ।",
        },
        {
          title: "समझ परीक्षण",
          desc: "तीन त्वरित प्रश्न यह सुनिश्चित करने के लिए कि आप सहमति देने से पहले वास्तव में समझते हैं।",
        },
        {
          title: "बहुभाषी",
          desc: "अपनी पसंदीदा भाषा में विश्लेषण प्राप्त करें — हिंदी, मराठी, अंग्रेजी और अधिक।",
        },
        {
          title: "मुख्य दायित्व",
          desc: "आप जो वचन दे रहे हैं उसकी स्पष्ट बुलेट-पॉइंट सूची — अब अनुमान नहीं।",
        },
      ],
    },
    channels: {
      label: "हर जगह उपलब्ध",
      headline: "उपयोगकर्ताओं से जहाँ वे हैं मिलें",
      subtitle:
        "एक ही AI विश्लेषण इंजन, तीन अलग-अलग तरीके — जो भी आपके लिए सबसे आरामदायक हो।",
      items: [
        {
          title: "वेब ऐप",
          desc: "इंटरैक्टिव परिणामों के साथ पूर्ण जोखिम मूल्यांकन के लिए अपने ब्राउज़र में सीधे दस्तावेज़ अपलोड करें।",
          tag: "आप यहाँ हैं",
        },
        {
          title: "ब्राउज़र एक्सटेंशन",
          desc: "किसी भी वेबसाइट पर नियम और शर्तों का वास्तविक समय में विश्लेषण करें।",
          tag: "Chrome",
        },
        {
          title: "चैट बॉट",
          desc: "Telegram या WhatsApp के माध्यम से PDF भेजें और बातचीत में ही जोखिम विश्लेषण प्राप्त करें।",
          tag: "Telegram & WhatsApp",
        },
      ],
    },
    cta: {
      headline: "अंधे होकर हस्ताक्षर मत करें",
      subtitle:
        "अभी अपना दस्तावेज़ अपलोड करें और हर खंड, हर जोखिम, हर दायित्व को सरल भाषा में समझें।",
      button: "शुरू करें",
    },
    footer: {
      tagline: "बारीक प्रिंट पढ़ें। अपने अधिकार सुरक्षित रखें।",
      built: "MIT Hack for Impact 2026 के लिए बनाया गया",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "Telegram",
      },
    },
  },

  mr: {
    nav: {
      howItWorks: "हे कसे काम करते",
      features: "वैशिष्ट्ये",
      channels: "चॅनेल",
    },
    hero: {
      badge: "आर्थिक दस्तऐवज संरक्षण",
      headline1: "संमती देण्यापूर्वी",
      headline2: "समजून",
      headline3: "घ्या",
      subtitle:
        "कोणताही आर्थिक दस्तऐवज अपलोड करा — कर्ज, करार, अटी व शर्ती — आणि स्वाक्षरी करण्यापूर्वी सोप्या भाषेत धोका मूल्यांकन मिळवा।",
      trust: "तुमचे दस्तऐवज सुरक्षितपणे विश्लेषित केले जातात आणि कधीही संग्रहित केले जात नाहीत।",
    },
    upload: {
      drag: "तुमचा दस्तऐवज इथे टाका",
      dragActive: "फाइल इथे सोडा",
      browse: "फाइल्स ब्राउझ करा",
      hint: "PDF किंवा TXT, 10MB पर्यंत",
      analyze: "दस्तऐवज विश्लेषण करा",
      analyzing: "विश्लेषण होत आहे...",
      errorType: "फक्त PDF आणि TXT फाइल्स समर्थित आहेत।",
      errorSize: "फाइल 10MB पेक्षा कमी असणे आवश्यक आहे।",
    },
    howItWorks: {
      label: "हे कसे काम करते",
      headline: "माहितीपूर्ण संमतीचे तीन टप्पे",
      steps: [
        {
          num: "01",
          title: "तुमचा दस्तऐवज अपलोड करा",
          desc: "PDF किंवा टेक्स्ट फाइल टाका — कर्ज करार, विमा अटी, संमती फॉर्म, किंवा कोणताही आर्थिक दस्तऐवज।",
        },
        {
          num: "02",
          title: "AI बारीक मजकूर वाचतो",
          desc: "आमचा AI प्रत्येक कलम वाचतो, छुपे धोके चिन्हांकित करतो, आणि दस्तऐवज सोप्या भाषेत पुन्हा लिहितो।",
        },
        {
          num: "03",
          title: "धोका स्कोअर जाणून घ्या",
          desc: "स्पष्ट धोका मूल्यांकन, तुम्ही खरोखर काय मान्य करत आहात याची यादी, आणि एक छोटी चाचणी मिळवा।",
        },
      ],
    },
    features: {
      label: "वैशिष्ट्ये",
      headline: "सुरक्षित संमतीसाठी सर्व काही",
      items: [
        {
          title: "धोका मीटर",
          desc: "एक दृश्य 0–100 धोका गेज जो लगेच दाखवतो की दस्तऐवज किती धोकादायक आहे।",
        },
        {
          title: "सोप्या भाषेचा सारांश",
          desc: "गुंतागुंतीची कायदेशीर भाषा सोप्या शब्दांत पुन्हा लिहिली जाते। तुमचा वाचन स्तर निवडा।",
        },
        {
          title: "चिन्हांकित कलम",
          desc: "छुपे ऑटो-नूतनीकरण, डेटा शेअरिंग अटी, आणि लवाद कलम स्पष्ट स्पष्टीकरणासह.",
        },
        {
          title: "आकलन चाचणी",
          desc: "तीन जलद प्रश्न हे सुनिश्चित करण्यासाठी की संमती देण्यापूर्वी तुम्हाला खरोखर समजले आहे।",
        },
        {
          title: "बहुभाषिक",
          desc: "तुमच्या पसंतीच्या भाषेत विश्लेषण मिळवा — मराठी, हिंदी, इंग्रजी आणि अधिक।",
        },
        {
          title: "मुख्य जबाबदाऱ्या",
          desc: "तुम्ही नक्की काय वचन देत आहात याची स्पष्ट यादी — आता अंदाज नाही.",
        },
      ],
    },
    channels: {
      label: "सर्वत्र उपलब्ध",
      headline: "वापरकर्त्यांना जिथे आहेत तिथे भेटा",
      subtitle:
        "तोच AI विश्लेषण इंजिन, तीन वेगळ्या प्रकारे — तुम्हाला जे सर्वात सोयीचे असेल ते.",
      items: [
        {
          title: "वेब ॲप",
          desc: "संवादात्मक निकालांसह पूर्ण धोका मूल्यांकनासाठी थेट तुमच्या ब्राउझरमध्ये दस्तऐवज अपलोड करा।",
          tag: "तुम्ही इथे आहात",
        },
        {
          title: "ब्राउझर एक्स्टेंशन",
          desc: "कोणत्याही वेबसाइटवर अटी व शर्तींचे रिअल टाइममध्ये विश्लेषण करा.",
          tag: "Chrome",
        },
        {
          title: "चॅट बॉट",
          desc: "Telegram किंवा WhatsApp द्वारे PDF पाठवा आणि संभाषणातच धोका विश्लेषण मिळवा.",
          tag: "Telegram & WhatsApp",
        },
      ],
    },
    cta: {
      headline: "आंधळेपणाने स्वाक्षरी करू नका",
      subtitle:
        "आत्ता तुमचा दस्तऐवज अपलोड करा आणि प्रत्येक कलम, प्रत्येक धोका, प्रत्येक जबाबदारी सोप्या भाषेत समजून घ्या.",
      button: "सुरू करा",
    },
    footer: {
      tagline: "बारीक मजकूर वाचा. तुमचे हक्क सुरक्षित ठेवा.",
      built: "MIT Hack for Impact 2026 साठी बनवले",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "Telegram",
      },
    },
  },
};

export type Translations = (typeof translations)["en"];
