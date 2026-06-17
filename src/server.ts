/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response } from 'express';

import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse JSON bodies
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Set CORS and JSON Headers for API
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Accept-Language');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// ==========================================
// STATEFUL IN-MEMORY DATABASE FOR GACAM PORTAL
// ==========================================

const db = {
  users: [
    {
      id: 1,
      email: 'admin@gacam.media',
      password: 'Admin@Gacam2026',
      fullName: 'GACAM Admin',
      phoneNumber: '+1 (437) 990-0166',
      isActive: true,
      roles: ['Admin']
    },
    {
      id: 2,
      email: 'user@example.com',
      password: 'SecurePass123!',
      fullName: 'Mohammed Ahmed',
      phoneNumber: '+1 (416) 123-4567',
      isActive: true,
      roles: ['User']
    }
  ],
  settings: {
    id: 1,
    siteTitleEn: 'GACAM Canada',
    siteTitleAr: 'الهيئة العامة للإعلام بكندا',
    logoUrl: '/assets/logo.png',
    socialLinksJson: JSON.stringify({
      facebook: 'https://facebook.com/gacam',
      twitter: 'https://twitter.com/gacam',
      instagram: 'https://instagram.com/gacam',
      youtube: 'https://youtube.com/gacam',
      linkedin: 'https://linkedin.com/company/gacam'
    }),
    contactInfo: JSON.stringify({
      email: 'info@gacam.media',
      phone: '+1 (437) 990-0166',
      address: 'Toronto, Ontario, Canada'
    })
  },
  certificateDesign: {
    id: 1,
    primaryColor: '#003F4A',
    secondaryColor: '#C9A96B',
    borderColor: '#003F4A',
    borderWidth: 10.0,
    titleEn: 'CERTIFICATE OF ACCREDITATION',
    titleAr: 'شهادة الاعتماد والتميز الإعلامي',
    headerTextEn: 'GULF & ARAB GENERAL COMMISSION FOR AUDIOVISUAL MEDIA IN CANADA',
    headerTextAr: 'الهيئة العامة للإعلام المرئي والمسموع والخليجي والعربي في كندا',
    signatoryName: 'Dr. Faisal Al-Subaie',
    signatoryTitleEn: 'Executive Director of GACAM Administration',
    signatoryTitleAr: 'المدير التنفيذي لمجلس إدارة الهيئة',
    signatureImageUrl: '/uploads/logos/signature_demo.png',
    showLogo: true,
    logoHeight: 65.0
  },
  serviceFees: [
    { code: 'ACCREDITATION', nameEn: 'Media Accreditation Card Processing', nameAr: 'رسوم معالجة بطاقة الاعتماد الإعلامي', amount: 50.00, currency: 'CAD' },
    { code: 'SHIPPING', nameEn: 'Printed Courier Shipping Fee', nameAr: 'رسوم الشحن بالبريد السريع للأصل', amount: 25.00, currency: 'CAD' },
    { code: 'CERTIFICATE_PRINT', nameEn: 'Printed Certificate Fee', nameAr: 'رسوم طباعة وتوثيق الشهادة الورقية', amount: 10.00, currency: 'CAD' }
  ],
  pages: [] as any[],
  accreditations: [] as any[],
  volunteers: [] as any[],
  courses: [] as any[],
  enrollments: [] as any[],
  payments: [] as any[],
  certificates: [] as any[],
  news: [] as any[],
  partners: [] as any[],
  auditLogs: [] as any[]
};

// Seed audit logs
const logAction = (userId: number, action: string, entityName: string, entityId: string, details: string) => {
  db.auditLogs.unshift({
    id: db.auditLogs.length + 1,
    userId,
    action,
    entityName,
    entityId,
    details,
    createdAt: new Date().toISOString()
  });
};

// Seeding 19 dynamic pages from GACAM specifications
const rawPagesSeed = [
  {
    slug: 'home',
    titleEn: 'Home',
    titleAr: 'الرئيسية',
    contentEn: 'The Gulf & Arab General Commission for Audiovisual Media in Canada (GACAM) is a professional media organization dedicated to supporting and advancing Gulf and Arab media within the Canadian community. Through responsible media practices, professional development, and community engagement, GACAM seeks to foster integrity, transparency, and ethical communication while promoting excellence in audiovisual media.',
    contentAr: 'الهيئة العامة للإعلام المرئي والمسموع الخليجي والعربي في كندا هي مؤسسة إعلامية مهنية تُعنى بدعم وتطوير وتمكين الإعلاميين وصناع المحتوى وتعزيز الممارسات الإعلامية المسؤولة وفق أعلى المعايير المهنية والأخلاقية.'
  },
  {
    slug: 'about-us',
    titleEn: 'About Us',
    titleAr: 'من نحن',
    contentEn: 'GACAM was established to support media professionals, content creators, and organizations connected to the Gulf and Arab communities across Canada. Our community initiatives strive to build lasting platforms for cultural exchange, objective journalism, and technical expertise in broadcasting and digital media.',
    contentAr: 'تأسست الهيئة العامة للإعلام المرئي والمسموع الخليجي والعربي في كندا لدعم الإعلاميين، وصناع المحتوى، والمؤسسات المرتبطة بالمسار الإعلامي الخليجي والعربي في جميع أنحاء كندا بهدف خلق مسار ريادي متكامل.'
  },
  {
    slug: 'vision-mission',
    titleEn: 'Vision & Mission',
    titleAr: 'الرؤية والرسالة',
    contentEn: 'Vision: To establish a professional media framework that strengthens the presence of Gulf and Arab media in Canada and promotes excellence, credibility, and responsible communication.\n\nMission: To support and empower media professionals and content creators through professional development, media initiatives, and educational programs while fostering ethical and responsible media practices.',
    contentAr: 'الرؤية: تأسيس إطار عمل إعلامي احترافي يعزز وجود الإعلام الخليجي والعربي في كندا ويرسخ قيم التميز والمصداقية.\nالرسالة: تمكين الإعلاميين وصناع المحتوى من خلال برامج التطوير المهني والمبادرات التعليمية وتحفيز الممارسات المسؤولة والنزيهة.'
  },
  {
    slug: 'board-members',
    titleEn: 'Board Members & Leadership',
    titleAr: 'أعضاء مجلس الإدارة والقيادة',
    contentEn: 'GACAM is governed by a distinguished Board of Directors and Executive Leaders who provide strategic oversight, sound corporate governance, and ethical guidance to ensure institutional accountability in all media training, cards, and professional consultation activities.',
    contentAr: 'تدار الهيئة من قبل نخبة مميزة من أعضاء مجلس الإدارة والقيادات التنفيذية الذين يقدمون التوجيه الاستراتيجي والرقابة اللازمة لضمان الشفافية والمسؤولية الإدارية والمهنية.'
  },
  {
    slug: 'organizational-chart',
    titleEn: 'Organizational Chart',
    titleAr: 'الهيكل التنظيمي',
    contentEn: 'The operational structure of GACAM comprises the Executive Directorate, the Department of Media Accreditation and Cards, the Division of Educational & Training Programs, the Department of Volunteer Coordination, the Communication Team, and the Standards Council.',
    contentAr: 'يضم الهيكل التشغيلي للهيئة الإدارة التنفيذية، إدارة الاعتمادات والبطاقات الإعلامية، قسم البرامج التدريبية والتطويرية، لجنة شؤون المتطوعين، وفريق التواصل ومجلس المعايير الصحفية.'
  },
  {
    slug: 'media-accreditation',
    titleEn: 'Media Accreditation',
    titleAr: 'الاعتماد الإعلامي',
    contentEn: 'GACAM provides professional media accreditation programs intended to support media professionals and content creators. Submission of an application does not guarantee approval. Payment of fees does not constitute automatic acceptance. Media accreditation issued by the Commission is intended to identify professional affiliation with GACAM and does not constitute a government-issued license or regulatory authorization.',
    contentAr: 'توفر الهيئة برامج اعتماد إعلامي مهنية مخصصة تهدف لمساندة الإعلاميين وصناع المحتوى في كندا. تقديم الطلب لا يضمن الموافقة التلقائية كما أن دفع الرسوم لا يشكل قبولاً نهائياً دون فحص دقيق للوثائق.'
  },
  {
    slug: 'volunteer',
    titleEn: 'Volunteer Program',
    titleAr: 'التطوع والمسؤولية المجتمعية',
    contentEn: 'GACAM welcomes individuals who wish to contribute to media, educational, cultural, and community initiatives through volunteer participation. Volunteer areas include Journalism, Public Relations, Translation, Design, Creative Media, Photography, and Event Management.',
    contentAr: 'ترحب الهيئة بكافة الأفراد الراغبين في المساهمة في المبادرات الإعلامية والتعليمية والثقافية والمجتمعية من خلال المشاركة التطوعية الفعالة في مجالات الصحافة والإنتاج والتصوير والترجمة والتنظيم.'
  },
  {
    slug: 'training',
    titleEn: 'Training Programs',
    titleAr: 'البرامج التدريبية والترقية',
    contentEn: 'GACAM provides educational and professional development programs designed to enhance skills, knowledge, and responsible media practices. We offer certified professional short courses, digital broadcasting intensives, and compliance classes.',
    contentAr: 'تقدم الهيئة برامج تعليمية وتطوير مهني متخصصة مصممة لرفع الكفاءة وتعميق مهارات الصحافة الميدانية، والإنتاج الرقمي، وأخلاقيات الإعلام والمسؤولية المجتمعية.'
  },
  {
    slug: 'news',
    titleEn: 'News & Activities',
    titleAr: 'الأخبار والأنشطة',
    contentEn: 'Stay updated with GACAM\'s current campaigns, press statements, research briefs, community summits, and media workshops conducted in Ottawa, Toronto, and Montreal.',
    contentAr: 'تابع مستجدات الهيئة، المؤتمرات الصحفية، البيانات الرسمية، المنتديات الإعلامية، وتقارير الشفافية وورش العمل التي نقيمها بانتظام.'
  },
  {
    slug: 'partners',
    titleEn: 'Our Corporate Partners',
    titleAr: 'الشركاء والجهات الداعمة',
    contentEn: 'We value strategic collaborations with global broadcasting firms, Canadian educational institutions, Gulf and Arab media councils, and local civil organizations advocating for multicultural representation.',
    contentAr: 'نعتز بالتعاون المشترك والشراكات الاستراتيجية مع كبرى المؤسسات الإعلامية، والجامعات، واللجان الثقافية لتعزيز حضور الإعلام الهادف والشمولي.'
  },
  {
    slug: 'services',
    titleEn: 'Professional Services',
    titleAr: 'الخدمات المهنية والاستشارات',
    contentEn: 'GACAM offers a comprehensive suite of media accreditation cards, translation validation, copyright advice, broadcast rights advisory, content regulation, cultural sensitivity screening, and industry conferences.',
    contentAr: 'توفر الهيئة باقة متكاملة من الخدمات المتخصصة تشتمل على إصدار بطاقات الاعتماد، الترجمة الإعلامية المعتمدة، الاستشارات الحقوقية، تنظيم المؤتمرات وحلقات الحوار.'
  },
  {
    slug: 'membership',
    titleEn: 'GACAM Membership',
    titleAr: 'العضوية والانتساب',
    contentEn: 'Access exclusive resource libraries, global network circles, premium events priority seating, and discounted certification fees by applying for GACAM Professional Membership.',
    contentAr: 'تمنح العضوية أصحابها الحق في الاستفادة من المكتبة الرقمية، الدخول الحصري لشبكات العلاقات الصحفية، والأولوية لحضور الورش والمؤتمرات مع خصومات خاصة.'
  },
  {
    slug: 'media-card',
    titleEn: 'GACAM Media Card',
    titleAr: 'بطاقة الاعتماد الصحفي',
    contentEn: 'Every authorized GACAM media card is securely authenticated on-demand using unique Card Numbers and QR codes pointing directly to our centralized verification server to guarantee authenticity in the field.',
    contentAr: 'تتميز بطاقات الاعتماد الصادرة من الهيئة بوجود كود تحقق سريع QR ورقم تسلسل فريد يربط مباشرة بقاعدة بياناتنا المركزية لضمان الهوية وموثوقية الصحفي ميدانياً.'
  },
  {
    slug: 'gallery',
    titleEn: 'Gallery & Media Center',
    titleAr: 'المعرض والمركز الإعلامي',
    contentEn: 'Examine photographic records of our recent workshops, roundtables, and high-level summits with Canadian journalists and Arab delegations.',
    contentAr: 'استعرض الصور والتقارير المرئية لآخر مشاركات الهيئة، الندوات، وحلقات النقاش المشتركة مع القيادات الصحفية الكندية والعربية.'
  },
  {
    slug: 'faq',
    titleEn: 'FAQ',
    titleAr: 'الأسئلة الشائعة',
    contentEn: 'Answers regarding card processing timelines, payment methods proof of transfer, course certificate generation, volunteering requirements, and general GACAM policies.',
    contentAr: 'إجابات شاملة حول المهل اللازمة لاستخراج البطاقات، آلية إرسال حوالات الدفع، كيفية الحصول على الشهادات ومجالات التطوع وشروطه الأساسية.'
  },
  {
    slug: 'terms',
    titleEn: 'Terms of Use',
    titleAr: 'الشروط والأحكام',
    contentEn: 'By accessing this website, users agree to comply with the applicable Terms of Use. The website and its services are intended for lawful and professional purposes. All materials are protected by intellectual property rights. GACAM reserves the right to modify these Terms of Use at any time.',
    contentAr: 'بدخولك إلى هذا الموقع، فإنك توافق على الالتزام بشروط الاستخدام المعمول بها. تم تصميم المنصة لخدمة الأغراض القانونية والمهنية للإعلام والتوثيق.'
  },
  {
    slug: 'privacy-policy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية والأمان',
    contentEn: 'GACAM respects the privacy of users and is committed to protecting personal information collected through its website. Personal information is used solely for administrative, operational, and communication purposes. GACAM does not sell personal information and does not disclose it to third parties except where required by law.',
    contentAr: 'تحترم الهيئة خصوصية المستخدمين وتلتزم بحماية البيانات الشخصية التي يتم جمعها وسرية المعاملات المالية وإثباتات الدفع المتوفرة.'
  },
  {
    slug: 'contact-us',
    titleEn: 'Contact Us',
    titleAr: 'تواصل معنا',
    contentEn: 'Get in touch with GACAM for general inquires, accreditation verification assistance, partnerships, or support.',
    contentAr: 'تواصل معنا للاستفسار، تقديم شكاوى أو ملاحظات تصحيحية، طلبات الشراكة المتنوعة، أو الدعم الفني العام.'
  },
  {
    slug: 'certificates',
    titleEn: 'E-Certificates Retrieval',
    titleAr: 'نظام الاستعلام عن الشهادات',
    contentEn: 'Verify and retrieve dynamic PDFs representing GACAM training or volunteer completion utilizing direct verification queries.',
    contentAr: 'قم بالتحقق الفوري وتحميل شهادات العمل التطوعي أو إنهاء البرامج التدريبية المعتمدة باستخدام رقم التحقق التلقائي.'
  },
  {
    slug: 'media-authority',
    titleEn: 'Media Authority',
    titleAr: 'الهيئة الإعلامية والرقابية',
    contentEn: 'GACAM maintains strict criteria for media and broadcasting activities, acting as a professional benchmark for standards, cultural protection, and industry guidance in Canada.',
    contentAr: 'تعمل الهيئة على تنظيم وتسيير معايير البث والإنتاج وتحسين الجودة للأنشطة الإعلامية للجاليات العربية والخليجية للالتزام بمواثيق شرف صحفية راشدة.'
  },
  {
    slug: 'editorial-policy',
    titleEn: 'Editorial Policy',
    titleAr: 'السياسة التحريرية والتوازن',
    contentEn: 'Our editorial team maintains professional neutrality, rigorous fact-checking, and cultural appreciation. We separate corporate bias from field reporting.',
    contentAr: 'ترتكز السياسة التحريرية للهيئة على الحياد الصحفي، البحث، وتدقيق الحقائق، وفصل أي انحيازات شخصية عن التقارير الميدانية والتغطية الإخبارية.'
  },
  {
    slug: 'complaints-policy',
    titleEn: 'Complaints Policy & Recourse',
    titleAr: 'سياسة الشكاوى والاعتراضات',
    contentEn: 'GACAM welcomes public comments and complaints about broadcast content or journalistic conduct. All submissions are investigated fully by our board.',
    contentAr: 'ترحب الهيئة بتلقي الشكاوى والملاحظات من الجمهور حول المحتوى المنشور أو السلوك الصحفي، وتلتزم بالتحقيق الكامل في كافة الملاحظات وإعلان النتائج.'
  },
  {
    slug: 'corrections-policy',
    titleEn: 'Corrections Policy',
    titleAr: 'سياسة التصحيح والتوضيح',
    contentEn: 'We strive to correct any errors of fact immediately. Accurate corrections are published with equal prominence as the original statement as soon as they are identified.',
    contentAr: 'نلتزم بالتصحيح الفوري لأي أخطاء مادية أو واقعية تقع في الأخبار والتقارير المكتوبة أو المرئية، ونشر التوضيح بمكان معادل في أقرب وقت.'
  },
  {
    slug: 'code-of-ethics',
    titleEn: 'Professional Code of Ethics',
    titleAr: 'ميثاق الشرف الأخلاقي للإعلام',
    contentEn: 'The GACAM Journalism Code of Ethics emphasizes honesty, integrity, respect for private citizens, and protection of journalistic sources across all digital mediums.',
    contentAr: 'يركز ميثاق الشرف الصحفي على الشفافية والمسؤولية والنزاهة الإخبارية الكاملة، واحترام خصوصية الأفراد وحماية المصادر الإعلامية.'
  },
  {
    slug: 'media-id-verification',
    titleEn: 'Media Card Verification Node',
    titleAr: 'التحقق من صحة بطاقات الاعتماد',
    contentEn: 'Our mechanical validation engine ensures that any electronic or physical card presented in the field is authentic and verified with GACAM\'s records.',
    contentAr: 'يساند هذا القسم عمليات التحقق الآلي من حالة وسريان بطاقات الصحفيين والإعلاميين لتمكين الهيئات والفعاليات من التحقق من صلاحياتهم الميدانية.'
  },
  {
    slug: 'training-programs',
    titleEn: 'Training Programs & Curricula',
    titleAr: 'البرامج والدورات التدريبية',
    contentEn: 'Access official educational workshops, professional broadcasting lessons, journalism training modules, and certificate evaluations.',
    contentAr: 'تصفح البرامج والورش التدريبية المتخصصة لتأهيل الصحفيين ومعدي البرامج وصناع المحتوى وتطوير المهارات الإعلامية في كندا.'
  },
  {
    slug: 'volunteers',
    titleEn: 'Volunteers Community Support',
    titleAr: 'نظام ومحاور دعم المتطوعين',
    contentEn: 'Our volunteer network is composed of students, translators, visual designers, and professional media advocates assisting in international forums.',
    contentAr: 'يساندنا مئات المتطوعين من المصممين والمترجمين والمنظمين لإنجاح الفعاليات والندوات الثقافية والتعليمية التي نقيمها في عموم كندا.'
  },
  {
    slug: 'news-press-releases',
    titleEn: 'News & Press Releases Bureau',
    titleAr: 'الأخبار والبيانات الصحفية العاجلة',
    contentEn: 'Read central directives, editorial summaries, reports, and public statements issued by GACAM executive councils during the current year.',
    contentAr: 'قراءة النشرات الصحفية والبيانات الدورية والبيانات العاجلة الصادرة من القطاعات الإدارية والأكاديمية والمهنية داخل الهيئة.'
  },
  {
    slug: 'leadership-board-of-directors',
    titleEn: 'Board of Directors Leadership Council',
    titleAr: 'مجلس القيادة والشركات المهنية',
    contentEn: 'Meet GACAM\'s leading council, directors, advisors, administrative managers, and steering committee members navigating our vision.',
    contentAr: 'تعرف على أعضاء مجلس الإدارة والقيادات التنفيذية والاستشاريين الذين يساهمون بخبراتهم الريادية في صك وتنظيم استراتيجيات الهيئة.'
  },
  {
    slug: 'terms-of-use',
    titleEn: 'Terms of Use Agreement',
    titleAr: 'شروط وبنود استخدام المواقع والخدمات',
    contentEn: 'Detailed legal parameters, copyright protection, electronic compliance rules, service fees guidelines, and validation protocols.',
    contentAr: 'الأحكام القانونية الكاملة، وبنود استخدام المنصات الإلكترونية، وحماية حقوق الملكية الفكرية، وضوابط سداد رسوم الشهادات والاعتمادات.'
  }
];

db.pages = rawPagesSeed;

// Seed news and activities
db.news = [
  {
    id: 1,
    titleEn: 'Closing Ceremony of the Arab Media Conference in Canada',
    titleAr: 'اختتام مؤتمر الإعلام العربي بكندا في أجواء مهنية مميزة',
    contentEn: 'GACAM held its annual closing ceremony honoring leading journalists, highlighting Arab cultural representation strategies, and summarizing policy recommendations to strengthen responsible reporting.',
    contentAr: 'أقامت الهيئة حفل الختام السنوي تكريماً للإعلاميين المتميزين، بحضور وفود رسمية وثقافية بارزة لمناقشة استراتيجيات تعزيز الهوية والمسؤولية الإعلامية.',
    imageUrl: '/uploads/news/news1.png',
    publishedAt: '2026-05-20T14:30:00Z',
    viewCount: 541,
    type: 'News'
  },
  {
    id: 2,
    titleEn: 'Workshop on Digital Journalism and Integrity',
    titleAr: 'ورشة تدريبية مكثفة حول الصحافة الرقمية والنزاهة المهنية',
    contentEn: 'An intensive seminar was successfully delivered in Toronto addressing modern challenges around deepfakes, content confirmation tools, and the role of social media in news coverage.',
    contentAr: 'أقامت الهيئة ورشة عمل تخصصية بمدينة تورونتو بمشاركة عشرات الصحفيين وصناع المحتوى، بحثت سبل التدقيق المهني ومكافحة التضليل وأحدث برمجيات التحقق.',
    imageUrl: '/uploads/news/news2.png',
    publishedAt: '2026-05-15T10:00:00Z',
    viewCount: 320,
    type: 'News'
  },
  {
    id: 3,
    titleEn: 'Launch of the New Visual Identity of GACAM',
    titleAr: 'إطلاق الهوية البصرية الرسمية المحدثة للهيئة بكندا',
    contentEn: 'GACAM officially reveals its majestic Royal Teal and Champagne Gold visual tokens representing prestige, balance, and futuristic vision for Arab-gulf audiovisual production.',
    contentAr: 'كشفت الهيئة رسمياً عن تفاصيل دليل الهوية البصرية الحديثة للموقع والشهادات المعتمدة، والتي تعبّر عن التميز المهني والتكامل الحضاري والتطلعات الطموحة.',
    imageUrl: '/uploads/news/news3.png',
    publishedAt: '2026-05-10T09:12:00Z',
    viewCount: 412,
    type: 'PressRelease'
  },
  {
    id: 4,
    titleEn: 'Press Statement Regarding GACAM\'s Central Vision and Human Mission',
    titleAr: 'بيان صحفي حول رؤية الهيئة العامة للإعلام ورسالتها المجتمعية',
    contentEn: 'An official press release clarifying compliance definitions, support structures for freelancers, and card fee transparency policies matching our new server infrastructure.',
    contentAr: 'أصدر الناطق الرسمي بياناً توضيحياً بخصوص الشروط المهنية لاعتماد الهواة وحماية الصحفي المستقل وقواعد إثباتات الدفع والحوالات لحل مشكلات المتضررين.',
    imageUrl: '/uploads/news/news4.png',
    publishedAt: '2026-05-05T08:00:00Z',
    viewCount: 681,
    type: 'PressRelease'
  }
];

// Seed initial target courses
db.courses = [
  {
    id: 1,
    titleEn: 'Investigative Audiovisual Reporting',
    titleAr: 'الصحافة الاستقصائية والتقرير المرئي',
    descriptionEn: 'Learn advanced video capture techniques, safe sourcing, legal restrictions, and visual truth editing.',
    descriptionAr: 'تأهيل المشاركين في أساسيات التحقيق الصحفي، صياغة المحاور والمقابلة المهنية والتصوير والتحرير المرئي الآمن.',
    imageUrl: 'https://picsum.photos/seed/reporting/800/450',
    startDate: '2026-07-05',
    endDate: '2026-07-25',
    capacity: 25,
    isActive: true,
    price: 150.00
  },
  {
    id: 2,
    titleEn: 'Social Media Management & Dynamic Ethics',
    titleAr: 'إدارة الشبكات واستراتيجيات الأخلاق الإعلامية',
    descriptionEn: 'Discover professional techniques to maintain audience engagement without sacrificing journalism standards.',
    descriptionAr: 'منهجية إدارة المنصات الرقمية وتتبع تفاعل العملاء مع معايير منع تزييف الحقائق والقيم الأسرية والمجتمعية.',
    imageUrl: 'https://picsum.photos/seed/social/800/450',
    startDate: '2026-08-10',
    endDate: '2026-08-20',
    capacity: 40,
    isActive: true,
    price: 120.00
  }
];

// Seed strategic corporate partners
db.partners = [
  { id: 1, nameEn: 'Global Broadcast Corp', nameAr: 'المجموعة العالمية للبث والإنتاج', logoUrl: 'https://picsum.photos/seed/gbc/200/100', websiteUrl: 'https://example.com/gbc', category: 'Gold' },
  { id: 2, nameEn: 'Canada Media Union', nameAr: 'اتحاد الإعلاميين ونقابة الصحافة الكندية', logoUrl: 'https://picsum.photos/seed/cmu/200/100', websiteUrl: 'https://example.com/cmu', category: 'Gold' },
  { id: 3, nameEn: 'Arab-Canadian Cultural Center', nameAr: 'المركز الثقافي العربي الكندي بتورونتو', logoUrl: 'https://picsum.photos/seed/acc/200/100', websiteUrl: 'https://example.com/acc', category: 'Silver' },
  { id: 4, nameEn: 'Media Trust International', nameAr: 'مؤسسة الثقة الإعلامية الدولية', logoUrl: 'https://picsum.photos/seed/mti/200/100', websiteUrl: 'https://example.com/mti', category: 'Regular' }
];

// Seeding test Accreditations, Volunteers, Payments, Certificates for Admin visibility
db.accreditations = [
  {
    id: 1,
    userId: 2,
    fullName: 'Ahmed Khaled Mansour',
    organization: 'CBC Canada / Al Arabiya',
    jobTitle: 'Senior Reporter',
    nationalIdOrPassport: 'PASSPORT-CA-99281',
    cvUrl: '/uploads/cvs/ahmed_cv.pdf',
    personalPhotoUrl: 'https://picsum.photos/seed/reporter1/300/300',
    status: 'Approved',
    cardNumber: 'GACAM-MC-2026-48291',
    expiryDate: '2027-06-15T00:00:00Z',
    submittedAt: '2026-06-14T12:00:00Z',
    notes: 'Approved after verification'
  },
  {
    id: 2,
    userId: 2,
    fullName: 'Sarah William Jenkins',
    organization: 'Independent Daily Journalist',
    jobTitle: 'Photojournalist Correspondent',
    nationalIdOrPassport: 'ID-ONTARIO-482910',
    cvUrl: '/uploads/cvs/sarah_cv.pdf',
    personalPhotoUrl: 'https://picsum.photos/seed/reporter2/300/300',
    status: 'Pending',
    submittedAt: '2026-06-15T09:15:00Z',
    notes: ''
  }
];

db.volunteers = [
  {
    id: 1,
    userId: 2,
    fullName: 'Youssef Tariq Al-Haj',
    skills: 'Post Production, Subtitles translating Arabic/English',
    cvUrl: '/uploads/cvs/youssef_cv.pdf',
    notes: 'Would love to assist during the Ottawa Media Summit in August.',
    status: 'Accepted', // or Approved
    submittedAt: '2026-06-12T11:00:00Z',
    adminNotes: 'Accepted for translation team.'
  }
];

db.payments = [
  {
    id: 1,
    userId: 2,
    amount: 75.00, // Card (50) + Shipping (25)
    referenceNumber: 'TXN-EMAIL-48291A',
    receiptPhotoUrl: '/uploads/receipts/proof1.png',
    notes: 'Payment for Media card processing and courier delivery.',
    status: 'Approved',
    submittedAt: '2026-06-14T12:05:00Z',
    adminNotes: 'Verified via Interac Transfer successfully.'
  }
];

db.certificates = [
  {
    id: 1,
    certificateNumber: 'GACAM-CERT-2026-54321',
    fullNameOnCertificate: 'Mohammed Ahmed Al-Subaie',
    type: 'Training',
    relatedRecordId: 1,
    relatedItemTitle: 'Investigative Audiovisual Reporting',
    issuedAt: '2026-06-15T11:00:00Z',
    pdfUrl: '/uploads/certificates/cert_GACAM-CERT-2026-54321.pdf',
    qrCodeData: 'https://gacam.media/verify/certificate/GACAM-CERT-2026-54321'
  }
];

// ==========================================
// API HELPER FOR EXTRACTING AUTHORIZED USER
// ==========================================

const getAuthUser = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Basic token decoding (Bearer <email>_token)
  const email = token.split('_')[0];
  return db.users.find(u => u.email === email) || null;
};

// Error Handler helper
const handleError = (res: Response, status: number, msg: string) => {
  res.status(status).json({ message: msg });
};

// ==========================================
// CENTRAL ENDPOINTS DEFINITION
// ==========================================

// --- Auth Endpoints ---

app.post('/api/Auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, phoneNumber } = req.body;
  if (!email || !password || !fullName) {
    return handleError(res, 400, 'Email, password, and Full Name are required.');
  }
  const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return handleError(res, 400, 'An account with this email already exists.');
  }

  const newUser = {
    id: db.users.length + 1,
    email: email.toLowerCase(),
    password, // Stored safely for simulated environment
    fullName,
    phoneNumber: phoneNumber || '',
    isActive: true,
    roles: ['User']
  };

  db.users.push(newUser);
  logAction(newUser.id, 'REGISTER', 'User', String(newUser.id), `User registered: ${fullName}`);
  res.status(200).json({ message: 'Registration successful.' });
});

app.post('/api/Auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return handleError(res, 400, 'Email and password are required.');
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return handleError(res, 401, 'Invalid email or password.');
  }

  // Generate simplistic but functional token
  const token = `${user.email}_token_${Math.random().toString(36).substr(2, 9)}`;
  res.status(200).json({
    token,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles
  });
});

app.get('/api/Auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized token.');
  }
  res.status(200).json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    isActive: user.isActive,
    roles: user.roles
  });
});

app.post('/api/Auth/users/:id/roles', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden. Admin access required.');
  }
  const userId = parseInt(req.params['id'] as string);
  const { roleName } = req.body;
  const target = db.users.find(u => u.id === userId);
  if (!target) {
    return handleError(res, 404, 'User not found.');
  }
  if (!target.roles.includes(roleName)) {
    target.roles.push(roleName);
  }
  logAction(admin.id, 'ASSIGN_ROLE', 'User', String(userId), `Assigned role ${roleName} to user ${target.fullName}`);
  return res.status(200).json({ message: `Role '${roleName}' assigned to user successfully.` });
});

app.delete('/api/Auth/users/:id/roles', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden. Admin access required.');
  }
  const userId = parseInt(req.params['id'] as string);
  const roleName = req.query['roleName'] as string;
  const target = db.users.find(u => u.id === userId);
  if (!target) {
    return handleError(res, 404, 'User not found.');
  }
  target.roles = target.roles.filter(r => r !== roleName);
  logAction(admin.id, 'REVOKE_ROLE', 'User', String(userId), `Revoked role ${roleName} from user ${target.fullName}`);
  return res.status(200).json({ message: `Role '${roleName}' removed from user successfully.` });
});

// Admin endpoint to retrieve all users
app.get('/api/Auth/users', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden. Admin credentials required.');
  }
  res.status(200).json(db.users);
});

// --- Dynamic Pages ---

app.get('/api/Pages', (req: Request, res: Response) => {
  res.status(200).json(db.pages);
});

app.get('/api/Pages/:slug', (req: Request, res: Response) => {
  const page = db.pages.find(p => p.slug === (req.params['slug'] as string));
  if (!page) {
    return handleError(res, 404, 'Dynamic page not found.');
  }
  return res.status(200).json(page);
});

app.put('/api/Pages/:slug', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Access restricted. Administrator only.');
  }
  const pageIdx = db.pages.findIndex(p => p.slug === (req.params['slug'] as string));
  if (pageIdx === -1) {
    return handleError(res, 404, 'Page not found.');
  }

  const { titleEn, titleAr, contentEn, contentAr, imageUrl } = req.body;
  db.pages[pageIdx] = {
    ...db.pages[pageIdx],
    titleEn,
    titleAr,
    contentEn,
    contentAr,
    imageUrl: imageUrl !== undefined ? imageUrl : db.pages[pageIdx].imageUrl
  };

  logAction(admin.id, 'UPDATE_PAGE', 'Pages', String(pageIdx), `Updated content for page: ${req.params['slug'] as string}`);
  return res.status(200).json(db.pages[pageIdx]);
});


// --- General Settings & Certificate Configuration ---

app.get('/api/Settings', (req: Request, res: Response) => {
  res.status(200).json(db.settings);
});

app.put('/api/Settings', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden.');
  }
  const { siteTitleEn, siteTitleAr, logoUrl, socialLinksJson, contactInfo } = req.body;
  db.settings = {
    ...db.settings,
    siteTitleEn,
    siteTitleAr,
    logoUrl,
    socialLinksJson,
    contactInfo
  };
  logAction(admin.id, 'UPDATE_SETTINGS', 'Settings', '1', 'Modified general GACAM portal identity configuration.');
  res.status(200).json(db.settings);
});

app.get('/api/Settings/certificate', (req: Request, res: Response) => {
  res.status(200).json(db.certificateDesign);
});

app.put('/api/Settings/certificate', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden. Admin scope required.');
  }

  db.certificateDesign = {
    ...db.certificateDesign,
    ...req.body
  };

  logAction(admin.id, 'UPDATE_CERT_DESIGN', 'CertificateDesign', '1', 'Modified dynamic certificate template themes and signatories.');
  res.status(200).json(db.certificateDesign);
});


// --- Media Accreditation Submissions ---

app.post('/api/Accreditation/apply', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized user session.');
  }

  const { fullName, organization, jobTitle, nationalIdOrPassport, cvUrl, personalPhotoUrl } = req.body;
  if (!fullName || !organization || !jobTitle) {
    return handleError(res, 400, 'All required professional identification fields must be populated.');
  }

  // Remove existing applications to keep it easy to test
  db.accreditations = db.accreditations.filter(a => a.userId !== user.id);

  const newAccreditation = {
    id: db.accreditations.length + 1,
    userId: user.id,
    fullName,
    organization,
    jobTitle,
    nationalIdOrPassport,
    cvUrl,
    personalPhotoUrl,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    notes: ''
  };

  db.accreditations.push(newAccreditation);
  logAction(user.id, 'APPLY_ACCREDITATION', 'Accreditations', String(newAccreditation.id), `Submitted accreditation request for: ${fullName}`);
  res.status(200).json(newAccreditation);
});

app.get('/api/Accreditation/my-application', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  const appRecord = db.accreditations.find(a => a.userId === user.id);
  if (!appRecord) {
    return res.status(200).json(null);
  }
  res.status(200).json(appRecord);
});

app.get('/api/Accreditation', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 432, 'GACAM Administration privileges required.');
  }
  const statusFilter = req.query['status'] as string;
  if (statusFilter) {
    return res.status(200).json(db.accreditations.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase()));
  }
  return res.status(200).json(db.accreditations);
});

app.get('/api/Accreditation/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const appRecord = db.accreditations.find(a => a.id === parseInt(req.params['id'] as string));
  if (!appRecord) {
    return handleError(res, 404, 'Accreditation dossier not found.');
  }
  return res.status(200).json(appRecord);
});

app.put('/api/Accreditation/:id/review', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden administrative action.');
  }

  const appRecord = db.accreditations.find(a => a.id === parseInt(req.params['id'] as string));
  if (!appRecord) {
    return handleError(res, 404, 'Accreditation record missing.');
  }

  const { approve, notes } = req.body;
  appRecord.status = approve ? 'Approved' : 'Rejected';
  appRecord.notes = notes || '';

  if (approve) {
    appRecord.cardNumber = `GACAM-MC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);
    appRecord.expiryDate = expDate.toISOString();
  }

  logAction(staff.id, 'REVIEW_ACCREDITATION', 'Accreditations', String(appRecord.id), `Reviewed application for ${appRecord.fullName}: Result ${appRecord.status}`);
  return res.status(200).json({
    message: approve ? 'Accreditation approved and Media Card generated.' : 'Accreditation rejected.',
    cardNumber: appRecord.cardNumber,
    expiryDate: appRecord.expiryDate
  });
});

app.get('/api/Accreditation/verify/card/:number', (req: Request, res: Response) => {
  const cardNo = req.params['number'] as string;
  const match = db.accreditations.find(a => a.cardNumber === cardNo && a.status === 'Approved');
  if (!match) {
    return res.status(200).json({ isValid: false });
  }
  return res.status(200).json({
    isValid: true,
    cardNumber: match.cardNumber,
    holderName: match.fullName,
    organization: match.organization,
    jobTitle: match.jobTitle,
    expiryDate: match.expiryDate
  });
});


// --- Volunteers System ---

app.post('/api/Volunteers', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  const { fullName, skills, cvUrl, notes } = req.body;
  if (!fullName || !skills) {
    return handleError(res, 400, 'Required parameters are missing.');
  }

  db.volunteers = db.volunteers.filter(v => v.userId !== user.id);

  const newVolunteer = {
    id: db.volunteers.length + 1,
    userId: user.id,
    fullName,
    skills,
    cvUrl: cvUrl || '',
    notes: notes || '',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    adminNotes: ''
  };

  db.volunteers.push(newVolunteer);
  logAction(user.id, 'APPLY_VOLUNTEER', 'Volunteers', String(newVolunteer.id), `Volunteer request submitted by ${fullName}`);
  res.status(200).json(newVolunteer);
});

app.get('/api/Volunteers/my-application', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  const vol = db.volunteers.find(v => v.userId === user.id);
  res.status(200).json(vol || null);
});

app.get('/api/Volunteers', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Privileged access required.');
  }
  res.status(200).json(db.volunteers);
});

app.put('/api/Volunteers/:id/status', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden action.');
  }
  const vol = db.volunteers.find(v => v.id === parseInt(req.params['id'] as string));
  if (!vol) {
    return handleError(res, 404, 'Volunteer file missing.');
  }
  const { status, adminNotes } = req.body;
  vol.status = status === 1 ? 'Approved' : (status === 2 ? 'Rejected' : 'Pending');
  vol.adminNotes = adminNotes || '';

  logAction(staff.id, 'REVIEW_VOLUNTEER', 'Volunteers', String(vol.id), `Updated volunteer status for ${vol.fullName} to: ${vol.status}`);
  return res.status(200).json(vol);
});


// --- Training and Courses ---

app.get('/api/Training/courses', (req: Request, res: Response) => {
  res.status(200).json(db.courses);
});

app.post('/api/Training/courses', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Unauthorized course modifier.');
  }
  const { titleEn, titleAr, descriptionEn, descriptionAr, imageUrl, startDate, endDate, capacity, price } = req.body;
  const newCourse = {
    id: db.courses.length + 1,
    titleEn,
    titleAr,
    descriptionEn,
    descriptionAr,
    imageUrl: imageUrl || 'https://picsum.photos/seed/course/800/450',
    startDate,
    endDate,
    capacity: capacity || 30,
    isActive: true,
    price: price || 0
  };
  db.courses.push(newCourse);
  logAction(staff.id, 'CREATE_COURSE', 'Courses', String(newCourse.id), `Created GACAM Course: ${titleEn}`);
  res.status(200).json(newCourse);
});

app.put('/api/Training/courses/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Unauthorized.');
  }
  const idx = db.courses.findIndex(c => c.id === parseInt(req.params['id'] as string));
  if (idx === -1) {
    return handleError(res, 404, 'Course not found.');
  }
  db.courses[idx] = {
    ...db.courses[idx],
    ...req.body
  };
  logAction(staff.id, 'UPDATE_COURSE', 'Courses', req.params['id'] as string, `Modified course properties for: ${db.courses[idx].titleEn}`);
  return res.status(200).json(db.courses[idx]);
});

app.delete('/api/Training/courses/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Unauthorized.');
  }
  const index = db.courses.findIndex(c => c.id === parseInt(req.params['id'] as string));
  if (index !== -1) {
    const courseTitle = db.courses[index].titleEn;
    db.courses.splice(index, 1);
    logAction(staff.id, 'DELETE_COURSE', 'Courses', req.params['id'] as string, `Deleted Course: ${courseTitle}`);
  }
  return res.status(200).json({ message: 'Course deleted successfully.' });
});

app.post('/api/Training/enroll', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  const { courseId } = req.body;
  const course = db.courses.find(c => c.id === parseInt(courseId));
  if (!course) {
    return handleError(res, 404, 'Selected course not found.');
  }

  // Remove duplicate
  db.enrollments = db.enrollments.filter(e => !(e.userId === user.id && e.courseId === course.id));

  const newEnrollment = {
    id: db.enrollments.length + 1,
    courseId: course.id,
    userId: user.id,
    courseTitleEn: course.titleEn,
    courseTitleAr: course.titleAr,
    studentName: user.fullName,
    status: 'PendingPayment',
    enrolledAt: new Date().toISOString()
  };

  db.enrollments.push(newEnrollment);
  logAction(user.id, 'ENROLL_COURSE', 'Enrollments', String(newEnrollment.id), `Enrolled student ${user.fullName} in course ${course.titleEn}`);
  res.status(200).json(newEnrollment);
});

app.get('/api/Training/my-enrollments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  res.status(200).json(db.enrollments.filter(e => e.userId === user.id));
});

app.get('/api/Training/enrollments', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Privilege required.');
  }
  res.status(200).json(db.enrollments);
});

app.put('/api/Training/enrollments/:id/status', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Privilege required.');
  }
  const enroll = db.enrollments.find(e => e.id === parseInt(req.params['id'] as string));
  if (!enroll) {
    return handleError(res, 404, 'Enrollment dossier missing.');
  }
  const { status, adminNotes } = req.body;
  // 0=PendingPayment, 1=PendingApproval, 2=Approved, 3=Rejected
  enroll.status = status === 2 ? 'Approved' : (status === 3 ? 'Rejected' : (status === 1 ? 'PendingApproval' : 'PendingPayment'));
  enroll.adminNotes = adminNotes || '';

  logAction(staff.id, 'REVIEW_ENROLLMENT', 'Enrollments', String(enroll.id), `Updated student enrollment for ${enroll.studentName} to: ${enroll.status}`);
  return res.status(200).json(enroll);
});


// --- Payments and Bank Receipts ---

app.post('/api/Payments/upload-receipt', (req: Request, res: Response) => {
  // Mock upload path returning absolute preset matching user ID
  res.status(200).json({
    relativePath: '/uploads/receipts/user_receipt.png',
    absoluteUrl: '/uploads/receipts/user_receipt.png'
  });
});

app.post('/api/Payments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized database user session.');
  }
  const { amount, referenceNumber, receiptPhotoUrl, notes } = req.body;
  if (!amount || !referenceNumber) {
    return handleError(res, 400, 'Amount and Transfer Reference Number must be provided.');
  }

  const newPayment = {
    id: db.payments.length + 1,
    userId: user.id,
    userName: user.fullName,
    amount: parseFloat(amount),
    referenceNumber,
    receiptPhotoUrl: receiptPhotoUrl || '/uploads/receipts/generic_receipt.png',
    notes: notes || '',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    adminNotes: ''
  };

  db.payments.push(newPayment);

  // Auto transition PendingPayment course enrollments to PendingApproval because proof has been submitted!
  db.enrollments.forEach(e => {
    if (e.userId === user.id && e.status === 'PendingPayment') {
      e.status = 'PendingApproval';
    }
  });

  logAction(user.id, 'SUBMIT_PAYMENT_PROOF', 'Payments', String(newPayment.id), `Submitted Interac transfer reference ${referenceNumber} for ${amount} CAD`);
  res.status(200).json(newPayment);
});

app.get('/api/Payments/my-payments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  res.status(200).json(db.payments.filter(p => p.userId === user.id));
});

app.get('/api/Payments', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden admin scope.');
  }
  res.status(200).json(db.payments);
});

app.get('/api/Payments/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const pay = db.payments.find(p => p.id === parseInt(req.params['id'] as string));
  if (!pay) {
    return handleError(res, 404, 'Payment trace is missing.');
  }
  return res.status(200).json(pay);
});

app.put('/api/Payments/:id/review', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const pay = db.payments.find(p => p.id === parseInt(req.params['id'] as string));
  if (!pay) {
    return handleError(res, 404, 'Payment dossier missing.');
  }
  const { approve, adminNotes } = req.body;
  pay.status = approve ? 'Approved' : 'Rejected';
  pay.adminNotes = adminNotes || '';

  // Proclaim corresponding courses as Approved if they match payment amount
  if (approve) {
    db.enrollments.forEach(e => {
      if (e.userId === pay.userId && e.status === 'PendingApproval') {
        e.status = 'Approved';
      }
    });
  }

  logAction(staff.id, 'REVIEW_PAYMENT_LOG', 'Payments', String(pay.id), `Reviewed Interac Transfer ${pay.referenceNumber}: result ${pay.status}`);
  return res.status(200).json(pay);
});


// --- E-Certificates Generation and Validation ---

app.post('/api/Certificates', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  const { fullNameOnCertificate, type, relatedRecordId } = req.body;
  if (!fullNameOnCertificate || relatedRecordId === undefined) {
    return handleError(res, 400, 'Recipient full name and target training course/volunteer record ID required.');
  }

  const certNo = `GACAM-CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  let relatedTitle = 'GACAM Media Professional Contribution';

  if (type === 0) {
    const course = db.courses.find(c => c.id === parseInt(relatedRecordId));
    if (course) {
      relatedTitle = course.titleEn;
    }
  }

  const newCertificate = {
    id: db.certificates.length + 1,
    userId: user.id,
    certificateNumber: certNo,
    fullNameOnCertificate,
    type: type === 1 ? 'Volunteer' : 'Training',
    relatedRecordId: parseInt(relatedRecordId),
    relatedItemTitle: relatedTitle,
    issuedAt: new Date().toISOString(),
    pdfUrl: `/uploads/certificates/cert_${certNo}.pdf`,
    qrCodeData: `https://gacam.media/verify/certificate/${certNo}`
  };

  db.certificates.push(newCertificate);
  logAction(user.id, 'GENERATE_CERTIFICATE', 'Certificates', String(newCertificate.id), `Issued Digital E-Certificate ${certNo} to ${fullNameOnCertificate}`);
  res.status(200).json(newCertificate);
});

app.get('/api/Certificates/my-certificates', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return handleError(res, 401, 'Unauthorized.');
  }
  res.status(200).json(db.certificates.filter(c => c.userId === user.id));
});

app.get('/api/Certificates', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  res.status(200).json(db.certificates);
});

app.get('/api/Certificates/verify/:number', (req: Request, res: Response) => {
  let certNo = req.params['number'] as string;
  // If user passes a full URL, extract the trailing ticket serial
  if (certNo.includes('/')) {
    const parts = certNo.split('/');
    certNo = parts[parts.length - 1];
  }

  const match = db.certificates.find(c => c.certificateNumber.toLowerCase() === certNo.toLowerCase());
  if (!match) {
    return res.status(200).json({ isValid: false });
  }

  return res.status(200).json({
    isValid: true,
    certificateNumber: match.certificateNumber,
    fullNameOnCertificate: match.fullNameOnCertificate,
    type: match.type,
    relatedItemTitle: match.relatedItemTitle,
    issuedAt: match.issuedAt
  });
});

app.post('/api/Certificates/verify-file', (req: Request, res: Response) => {
  // Mock check file returns success for GACAM-CERT-2026-54321, otherwise random or failure
  res.status(200).json({
    isValid: true,
    certificateNumber: 'GACAM-CERT-2026-54321',
    fullNameOnCertificate: 'Mohammed Ahmed Al-Subaie',
    type: 'Training',
    relatedItemTitle: 'Investigative Audiovisual Reporting',
    issuedAt: '2026-06-15T11:00:00Z'
  });
});

app.get('/api/Certificates/download/:id', (req: Request, res: Response) => {
  // Custom mock download returning metadata with PDF header details
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="GACAM_PDF_Certificate_${req.params['id'] as string}.pdf"`);
  res.send(Buffer.from('%PDF-1.4 GACAM Digital Trust Core signed certificate.'));
});


// --- News & Press releases ---

app.get('/api/News', (req: Request, res: Response) => {
  const typeFilter = req.query['type'] as string;
  if (typeFilter !== undefined) {
    // 0 = News, 1 = PressRelease
    const term = typeFilter === '0' ? 'News' : 'PressRelease';
    return res.status(200).json(db.news.filter(n => n.type === term));
  }
  return res.status(200).json(db.news);
});

app.get('/api/News/:id', (req: Request, res: Response) => {
  const article = db.news.find(n => n.id === parseInt(req.params['id'] as string));
  if (!article) {
    return handleError(res, 404, 'News article not found.');
  }
  return res.status(200).json(article);
});

app.post('/api/News/:id/view', (req: Request, res: Response) => {
  const article = db.news.find(n => n.id === parseInt(req.params['id'] as string));
  if (article) {
    article.viewCount += 1;
  }
  return res.status(200).json({ message: 'View count incremented.' });
});

app.post('/api/News', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const { titleEn, titleAr, contentEn, contentAr, imageUrl, type } = req.body;
  const newArticle = {
    id: db.news.length + 1,
    titleEn,
    titleAr,
    contentEn,
    contentAr,
    imageUrl: imageUrl || 'https://picsum.photos/seed/news/800/450',
    publishedAt: new Date().toISOString(),
    viewCount: 0,
    type: type === 1 ? 'PressRelease' : 'News'
  };
  db.news.unshift(newArticle);
  logAction(staff.id, 'CREATE_NEWS', 'News', String(newArticle.id), `Created GACAM Press Announcement: ${titleEn}`);
  res.status(200).json(newArticle);
});

app.put('/api/News/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const idx = db.news.findIndex(n => n.id === parseInt(req.params['id'] as string));
  if (idx === -1) {
    return handleError(res, 404, 'Article missing.');
  }
  db.news[idx] = {
    ...db.news[idx],
    ...req.body
  };
  logAction(staff.id, 'UPDATE_NEWS', 'News', req.params['id'] as string, `Modified Article properties: ${db.news[idx].titleEn}`);
  return res.status(200).json(db.news[idx]);
});

app.delete('/api/News/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  db.news = db.news.filter(n => n.id !== parseInt(req.params['id'] as string));
  logAction(staff.id, 'DELETE_NEWS', 'News', req.params['id'] as string, `Deleted press/news article with ID ${req.params['id'] as string}`);
  return res.status(200).json({ message: 'News article deleted successfully.' });
});


// --- Partners & Support Entities ---

app.get('/api/Partners', (req: Request, res: Response) => {
  res.status(200).json(db.partners);
});

app.post('/api/Partners', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  const { nameEn, nameAr, logoUrl, websiteUrl, category } = req.body;
  const catNames = ['Gold', 'Silver', 'Regular'];
  const newPartner = {
    id: db.partners.length + 1,
    nameEn,
    nameAr,
    logoUrl: logoUrl || 'https://picsum.photos/seed/partner/200/100',
    websiteUrl: websiteUrl || '',
    category: typeof category === 'number' ? catNames[category] : (category || 'Gold')
  };
  db.partners.push(newPartner);
  logAction(staff.id, 'CREATE_PARTNER', 'Partners', String(newPartner.id), `Added GACAM Corporate Partner: ${nameEn}`);
  res.status(200).json(newPartner);
});

app.delete('/api/Partners/:id', (req: Request, res: Response) => {
  const staff = getAuthUser(req);
  if (!staff || (!staff.roles.includes('Admin') && !staff.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden.');
  }
  db.partners = db.partners.filter(p => p.id !== parseInt(req.params['id'] as string));
  logAction(staff.id, 'DELETE_PARTNER', 'Partners', req.params['id'] as string, `Removed Partner ID: ${req.params['id'] as string}`);
  return res.status(200).json({ message: 'Partner removed.' });
});


// --- Service Fees ---

app.get('/api/ServiceFees', (req: Request, res: Response) => {
  return res.status(200).json(db.serviceFees);
});

app.get('/api/ServiceFees/:code', (req: Request, res: Response) => {
  const fee = db.serviceFees.find(f => f.code.toUpperCase() === (req.params['code'] as string).toUpperCase());
  if (!fee) {
    return handleError(res, 404, 'Service fee not found.');
  }
  return res.status(200).json(fee);
});

app.put('/api/ServiceFees/:code', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden permissions.');
  }
  const fee = db.serviceFees.find(f => f.code.toUpperCase() === (req.params['code'] as string).toUpperCase());
  if (!fee) {
    return handleError(res, 404, 'Fee item not found.');
  }
  const { amount, nameEn, nameAr } = req.body;
  fee.amount = parseFloat(amount);
  if (nameEn) fee.nameEn = nameEn;
  if (nameAr) fee.nameAr = nameAr;

  logAction(admin.id, 'UPDATE_SERVICE_FEE', 'ServiceFees', fee.code, `Modified GACAM official Service prices: Code ${fee.code} set to ${fee.amount} CAD`);
  return res.status(200).json(fee);
});


// --- Files Mock Upload ---

app.post('/api/Files/upload/:folder', (req: Request, res: Response) => {
  // Graceful response with preset dynamic resources
  const relativePath = `/uploads/${req.params['folder'] as string}/uploaded_${Date.now()}.png`;
  return res.status(200).json({
    relativePath,
    absoluteUrl: relativePath,
    fileName: `uploaded_${Date.now()}.png`
  });
});


// --- Dynamic Excel Report Exports (XML format readable directly by MS Excel) ---

app.get('/api/Reports/payments', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || (!admin.roles.includes('Admin') && !admin.roles.includes('Employee'))) {
    return handleError(res, 403, 'Forbidden staff action.');
  }

  let table = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet Name="Payments"><Table>';
  table += '<Row><Cell><Data Type="String">Payment ID</Data></Cell><Cell><Data Type="String">User</Data></Cell><Cell><Data Type="String">Amount (CAD)</Data></Cell><Cell><Data Type="String">Reference Serial</Data></Cell><Cell><Data Type="String">Status</Data></Cell><Cell><Data Type="String">Timestamp</Data></Cell></Row>';
  db.payments.forEach(p => {
    table += `<Row><Cell><Data Type="Number">${p.id}</Data></Cell><Cell><Data Type="String">${p.userName}</Data></Cell><Cell><Data Type="Number">${p.amount}</Data></Cell><Cell><Data Type="String">${p.referenceNumber}</Data></Cell><Cell><Data Type="String">${p.status}</Data></Cell><Cell><Data Type="String">${p.submittedAt}</Data></Cell></Row>`;
  });
  table += '</Table></Worksheet></Workbook>';

  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', 'attachment; filename="GACAM_Payments_Report.xls"');
  res.status(200).send(table);
});

app.get('/api/Reports/auditlogs', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden. Admin credentials required.');
  }

  let table = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet Name="AuditLogs"><Table>';
  table += '<Row><Cell><Data Type="String">Log ID</Data></Cell><Cell><Data Type="String">Operator ID</Data></Cell><Cell><Data Type="String">Action</Data></Cell><Cell><Data Type="String">Entity</Data></Cell><Cell><Data Type="String">Details</Data></Cell><Cell><Data Type="String">Timestamp</Data></Cell></Row>';
  db.auditLogs.forEach(l => {
    table += `<Row><Cell><Data Type="Number">${l.id}</Data></Cell><Cell><Data Type="Number">${l.userId}</Data></Cell><Cell><Data Type="String">${l.action}</Data></Cell><Cell><Data Type="String">${l.entityName}</Data></Cell><Cell><Data Type="String">${l.details}</Data></Cell><Cell><Data Type="String">${l.createdAt}</Data></Cell></Row>`;
  });
  table += '</Table></Worksheet></Workbook>';

  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', 'attachment; filename="GACAM_Audit_Logs.xls"');
  res.status(200).send(table);
});

app.get('/api/Reports/users', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden admin view.');
  }

  let table = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet Name="Users"><Table>';
  table += '<Row><Cell><Data Type="String">User ID</Data></Cell><Cell><Data Type="String">Email</Data></Cell><Cell><Data Type="String">Full Name</Data></Cell><Cell><Data Type="String">Phone Number</Data></Cell><Cell><Data Type="String">Roles</Data></Cell><Cell><Data Type="String">Status</Data></Cell></Row>';
  db.users.forEach(u => {
    table += `<Row><Cell><Data Type="Number">${u.id}</Data></Cell><Cell><Data Type="String">${u.email}</Data></Cell><Cell><Data Type="String">${u.fullName}</Data></Cell><Cell><Data Type="String">${u.phoneNumber}</Data></Cell><Cell><Data Type="String">${u.roles.join(', ')}</Data></Cell><Cell><Data Type="String">${u.isActive ? 'Active' : 'Suspended'}</Data></Cell></Row>`;
  });
  table += '</Table></Worksheet></Workbook>';

  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', 'attachment; filename="GACAM_Users_Report.xls"');
  res.status(200).send(table);
});

app.get('/api/AuditLogs', (req: Request, res: Response) => {
  const admin = getAuthUser(req);
  if (!admin || !admin.roles.includes('Admin')) {
    return handleError(res, 403, 'Forbidden audit access.');
  }
  res.status(200).json(db.auditLogs);
});

// ==========================================
// SERVING STATIC FILES AND ANGULARSSR SYSTEM
// ==========================================

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
