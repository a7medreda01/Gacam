import { Injectable, signal, computed } from '@angular/core';

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    'NAV.HOME': 'الرئيسية',
    'NAV.ABOUT': 'من نحن',
    'NAV.SERVICES': 'الخدمات المهنية',
    'NAV.ACCREDITATION': 'الاعتماد الإعلامي',
    'NAV.VOLUNTEER': 'التطوع والمساندة',
    'NAV.TRAINING': 'البرامج التدريبية',
    'NAV.NEWS': 'الأخبار والبيانات الصحفية',
    'NAV.CONTACT': 'تواصل معنا',
    'NAV.ADMIN': 'لوحة تسيير الإدارة',
    'NAV.PROFILE': 'ملفي الشخصي',
    'NAV.LOGOUT': 'تسجيل الخروج',
    'NAV.LOGIN': 'تسجيل الدخول',
    'NAV.REGISTER': 'إنشاء حساب جديد',

    'COMMON.EMAIL': 'البريد الإلكتروني',
    'COMMON.PASSWORD': 'كلمة المرور',
    'COMMON.FULL_NAME': 'الاسم الكامل',
    'COMMON.PHONE': 'رقم الهاتف والتواصل',
    'COMMON.SUBMIT': 'إرسال واستكمال الطلب',
    'COMMON.SAVE': 'حفظ التعديلات المحدثة',
    'COMMON.DELETE': 'حذف السجل',
    'COMMON.EDIT': 'تعديل الخصائص',
    'COMMON.VIEW': 'عرض التفاصيل',
    'COMMON.BACK': 'رجوع للخلف',
    'COMMON.STATUS': 'الحالة الحالية',
    'COMMON.ACTIONS': 'الإجراءات والعمليات',
    'COMMON.DATE': 'التاريخ والموعد',
    'COMMON.AMOUNT': 'المبلغ المستحق',
    'COMMON.REF_NUMBER': 'رقم التحويل (Reference Number)',
    'COMMON.NOTES': 'ملاحظات إضافية',
    'COMMON.UPLOAD_RECP': 'رفع إثبات الدفع (إيصال الحوالة)',
    'COMMON.UPLOAD_CV': 'رفع السيرة الذاتية (CV)',
    'COMMON.UPLOAD_PHOTO': 'رفع الصورة الشخصية الرسمية للبطاقة',
    'COMMON.REQUIRED': 'هذا الحقل إجباري',
    'COMMON.ORGANIZATION': 'المؤسسة الإعلامية أو الموقع',
    'COMMON.JOB_TITLE': 'المسمى الوظيفي للصحفي',
    'COMMON.NATIONAL_ID': 'رقم الهوية الوطنية أو جواز السفر',
    'COMMON.SEARCH': 'بحث وتصفية...',
    'COMMON.FILTER': 'تصفية حسب الحالة',
    'COMMON.ALL': 'عرض الكل',
    'COMMON.SUCCESS': 'تمت العملية بنجاح!',
    'COMMON.ERROR': 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً',
    'COMMON.CAD': 'دولار كندي (CAD)',
    'COMMON.CURRENCY': 'CAD',

    'HOME.HERO_TITLE': 'الهيئة العامة للإعلام المرئي والمسموع الخليجي والعربي بكندا',
    'HOME.HERO_SUB': 'نعمل على دعم وتمكين الإعلاميين وصناع المحتوى وتعزيز الممارسات الإعلامية المسؤولة والنزيهة تطلعاً لبناء منظومة مهنية متميزة في كندا.',
    'HOME.LEARN_MORE': 'تعرف على خدمات الهيئة',
    'HOME.SERVICES_TITLE': 'خدماتنا الرسمية والمعتمدة',
    'HOME.SERVICES_SUB': 'باقة متكاملة من التراخيص المهنية للصحفيين والنشاط التدريبي المتميز وإصدار بطاقات العضوية والاعتمادات.',
    'HOME.STATS_ACC': 'صحفي وإعلامي معتمد',
    'HOME.STATS_COURSES': 'برنامج تدريبي وتأهيلي',
    'HOME.STATS_PARTNERS': 'شريك إعلامي وثقافي',
    'HOME.STATS_EVENTS': 'فعالية ومؤتمر وطني',
    'HOME.LATEST_NEWS': 'أحدث الأخبار والبيانات الصحفية المعتمدة',
    'HOME.VIEW_ALL_NEWS': 'تصفح كافة الأخبار والبيانات',
    'HOME.ABOUT_TITLE': 'عن الهيئة وأهدافها الاستراتيجية',

    'AUTH.TITLE': 'بوابة تسجيل الدخول الآمن',
    'AUTH.NO_ACCOUNT': 'ليس لديك حساب معنا؟ سجل الآن',
    'AUTH.ALREADY_ACCOUNT': 'لديك حساب بالفعل؟ سجل دخولك',
    'AUTH.REGISTER_SUB': 'املأ البيانات بشكل دقيق للحصول على صلاحيات التقديم على المنصة',

    'VOLUNTEER.TITLE': 'طلب الانضمام لفرق التطوع والمساندة',
    'VOLUNTEER.SKILLS': 'المهارات والخبرات الإعلامية التقنية',
    'VOLUNTEER.NOTES': 'لماذا ترغب في التطوع لدينا؟',
    'VOLUNTEER.SUBMITTED': 'لديك طلب تطوع مقدم مسبقاً',

    'ACCREDITATION.APPLY': 'طلب الحصول على بطاقة الاعتماد الإعلامي الرسمي',
    'ACCREDITATION.SUBMITTED': 'طلب الاعتماد الخاص بك',
    'ACCREDITATION.STATUS_DESC': 'يتم مراجعة طلبك وإثباتات الدفع يدويًا من قبل الإدارة وسيتم تحديث الحالة فور التقييم.',
    
    'PAYMENT.PROMPT': 'إرسال إثبات وسداد رسوم المعاملات (حوالة بنكية)',
    'PAYMENT.DESC': 'يرجى تحويل رسوم المعاملة لحساب الهيئة الرسمي عبر البريد الإلكتروني المعتمد: Info@gacam.media ومن ثم تدوين رقم العملية ورفع الإيصال في النموذج أدناه.',
    
    'CERT.VERIFY_TITLE': 'نظام التحقق الإلكتروني من صحة وصلاحية الشهادات',
    'CERT.VERIFY_DESC': 'أدخل رقم الشهادة الفريد أو قم برفع ملف الـ PDF الأصلي للتأكد من الموثوقية.',
    'CERT.VERIFY_INPUT': 'أدخل رقم الشهادة أو الرابط كاملاً',
    'CERT.CHECK': 'تحقق الآن',
    'CERT.DROP_OR_CLICK': 'اسحب وأسقط ملف الشهادة هنا أو انقر لتحديد الملف للتحقق التلقائي',
    'CERT.IS_VALID': 'شهادة معتمدة وصحيحة بنسبة 100%',
    'CERT.IS_INVALID': 'تعذر التحقق! المستند غير مسجل أو منتهي الصلاحية',

    'ADMIN.TITLE': 'لوحة الإشراف الإداري للـ GACAM',
    'ADMIN.SUBTITLE': 'التحكم باللوائح، مراجعة طلبات الصحفيين والاعتمادات، معالجة الدفع السريع والشهادات الفورية والتقارير المالية.',
    'ADMIN.TOTAL_USERS': 'إجمالي الأعضاء',
    'ADMIN.PENDING_ACCREDITATIONS': 'طلبات الاعتماد المعلقة',
    'ADMIN.PENDING_VOLUNTEERS': 'طلبات التطوع المعلقة',
    'ADMIN.PENDING_PAYMENTS': 'حوالات الدفع المرتقبة',
    'ADMIN.PAGE_CMS': 'إدارة محتوى الصفحات الـ 19',
    'ADMIN.ACCREDITATIONS': 'إدارة الاعتمادات والبطاقات',
    'ADMIN.VOLUNTEERS': 'إدارة المتطوعين وسيرهم',
    'ADMIN.STUDENTS': 'إدارة طلاب الكورسات والقبول',
    'ADMIN.PAYMENTS': 'إدارة الدفع والحوالات المالية',
    'ADMIN.COURSES': 'إدارة تصنيفات الدورات',
    'ADMIN.CERTIFICATE_SETTINGS': 'تصميم قوالب الشهادات الرسمية',
    'ADMIN.EXPORT_REPORTS': 'تصدير تقارير Excel الإدارية',
    'ADMIN.AUDIT_LOGS': 'سجل العمليات الإدارية الكامل (Audit Log)',
    'ADMIN.PARTNERS': 'إدارة الشركاء واللوغوهات',
    'ADMIN.NEWS': 'إدارة المواد الإعلامية والبيانات',
    'ADMIN.METRICS_HEALTH': 'مؤشرات الأداء وصحة النظام',
    'ADMIN.SIDE_OVERVIEW': '📊 نظرة عامة ومؤشرات الحركة',
    'ADMIN.SIDE_ACCREDITATIONS': '🪪 طلبات الاعتمادات الصحفية',
    'ADMIN.SIDE_VOLUNTEERS': '🤝 المتطوعون والمساندة المجتمعية',
    'ADMIN.SIDE_ACADEMY': '🎓 أكاديمية ودورات التدريب',
    'ADMIN.SIDE_PAYMENTS': '💰 الحوالات والدفع المصرفي',
    'ADMIN.SIDE_CMS': '📄 محتوى الصفحات الديناميكي',
    'ADMIN.SIDE_AUDIT': '📜 سجلات الأمان والعمليات',
    'ADMIN.SIDE_ACADEMY_ENROLLMENTS': '🎓 سجلات التسجيل في الأكاديمية',
    'ADMIN.SIDE_NEWS': '📰 إدارة الأخبار والمواد الإعلامية',
    'ADMIN.SIDE_SETTINGS': '⚙️ المعايير وإعدادات الشهادة'
  },
  en: {
    'NAV.HOME': 'Home',
    'NAV.ABOUT': 'About Us',
    'NAV.SERVICES': 'Services',
    'NAV.ACCREDITATION': 'Accreditation',
    'NAV.VOLUNTEER': 'Volunteer',
    'NAV.TRAINING': 'Training Programs',
    'NAV.NEWS': 'News & Media',
    'NAV.CONTACT': 'Contact Us',
    'NAV.ADMIN': 'Admin Dashboard',
    'NAV.PROFILE': 'My Profile',
    'NAV.LOGOUT': 'Log Out',
    'NAV.LOGIN': 'Log In',
    'NAV.REGISTER': 'Create Account',

    'COMMON.EMAIL': 'Email Address',
    'COMMON.PASSWORD': 'Password',
    'COMMON.FULL_NAME': 'Full Human Name',
    'COMMON.PHONE': 'Phone / Contact Number',
    'COMMON.SUBMIT': 'Submit Information',
    'COMMON.SAVE': 'Save Updates',
    'COMMON.DELETE': 'Delete Record',
    'COMMON.EDIT': 'Edit Properties',
    'COMMON.VIEW': 'View Details',
    'COMMON.BACK': 'Back',
    'COMMON.STATUS': 'Status',
    'COMMON.ACTIONS': 'Actions',
    'COMMON.DATE': 'Date & Time',
    'COMMON.AMOUNT': 'Amount Due',
    'COMMON.REF_NUMBER': 'Reference ID (Interac / Swift)',
    'COMMON.NOTES': 'Additional Notes',
    'COMMON.UPLOAD_RECP': 'Upload Receipt (Photo/PDF)',
    'COMMON.UPLOAD_CV': 'Upload Curriculum Vitae (CV)',
    'COMMON.UPLOAD_PHOTO': 'Upload Official Face Photo for Card',
    'COMMON.REQUIRED': 'This field is required',
    'COMMON.ORGANIZATION': 'Media Organization / Press Agency',
    'COMMON.JOB_TITLE': 'Professional Job Title',
    'COMMON.NATIONAL_ID': 'National ID or Passport Number',
    'COMMON.SEARCH': 'Search and filter...',
    'COMMON.FILTER': 'Filter by Status',
    'COMMON.ALL': 'View All',
    'COMMON.SUCCESS': 'Operation succeeded!',
    'COMMON.ERROR': 'An error occurred, please try again.',
    'COMMON.CAD': 'Canadian Dollars (CAD)',
    'COMMON.CURRENCY': 'CAD',

    'HOME.HERO_TITLE': 'Gulf & Arab General Commission for Audiovisual Media in Canada',
    'HOME.HERO_SUB': 'Dedicated to supporting and advancing Gulf and Arab media within Canada by promoting ethical reporting, professional competence, and objective journalistic leadership.',
    'HOME.LEARN_MORE': 'Explore GACAM Services',
    'HOME.SERVICES_TITLE': 'Official Certified Services',
    'HOME.SERVICES_SUB': 'A comprehensive suite of media accreditations, training development, and secure verified identification cards.',
    'HOME.STATS_ACC': 'Accredited Media Members',
    'HOME.STATS_COURSES': 'Professional Courses',
    'HOME.STATS_PARTNERS': 'Corporate & Media Partners',
    'HOME.STATS_EVENTS': 'Workshops & Forums',
    'HOME.LATEST_NEWS': 'Latest Strategic News & Press Statements',
    'HOME.VIEW_ALL_NEWS': 'View All News & PR Archives',
    'HOME.ABOUT_TITLE': 'About GACAM & Strategic Objectives',

    'AUTH.TITLE': 'Secure Member Portal Login',
    'AUTH.NO_ACCOUNT': "Don't have an account? Sign up now",
    'AUTH.ALREADY_ACCOUNT': 'Already have an account? Log in here',
    'AUTH.REGISTER_SUB': 'Fill the details carefully to ensure appropriate clearance on our systems.',

    'VOLUNTEER.TITLE': 'Join GACAM Volunteer & Assistance Teams',
    'VOLUNTEER.SKILLS': 'Technical & Professional Media Skills',
    'VOLUNTEER.NOTES': 'Why do you wish to join GACAM Volunteer Team?',
    'VOLUNTEER.SUBMITTED': 'You have an active volunteer registration',

    'ACCREDITATION.APPLY': 'Request Official Media Accreditation & Press Card',
    'ACCREDITATION.SUBMITTED': 'Your Active Accreditation Case',
    'ACCREDITATION.STATUS_DESC': 'Your dossier is currently under formal manual evaluation by GACAM registry office. Status updates reflect here instantly.',
    
    'PAYMENT.PROMPT': 'Submit Bank Transfer Proof & Service Fees',
    'PAYMENT.DESC': 'Please send the required transaction amount via Interac Email Transfer to our central office at: Info@gacam.media. Once sent, upload the receipt below.',
    
    'CERT.VERIFY_TITLE': 'Centralized E-Certificate Validation Platform',
    'CERT.VERIFY_DESC': 'Enter the unique GACAM serial credential or upload the original digital PDF to prove legitimacy.',
    'CERT.VERIFY_INPUT': 'Enter serial number or full link',
    'CERT.CHECK': 'Verify Legitimacy',
    'CERT.DROP_OR_CLICK': 'Drop original digital PDF / screenshot here, or click to browse for auto-read verification',
    'CERT.IS_VALID': '100% Legit & Legitimate GACAM Document',
    'CERT.IS_INVALID': 'Verification failed! Invalid Serial or altered document cache.',

    'ADMIN.TITLE': 'GACAM Operations Management Command',
    'ADMIN.SUBTITLE': 'Full-scale administrative authority over training modules, payments validations, registrations, certificate customizers, and MS Excel logs export.',
    'ADMIN.TOTAL_USERS': 'Registered Members',
    'ADMIN.PENDING_ACCREDITATIONS': 'Pending Card Dossiers',
    'ADMIN.PENDING_VOLUNTEERS': 'Pending Volunteer Forms',
    'ADMIN.PENDING_PAYMENTS': 'Awaiting Payment Proofs',
    'ADMIN.PAGE_CMS': 'Manage GACAM 19 Bilingual Pages',
    'ADMIN.ACCREDITATIONS': 'Review Accreditations & Press Cards',
    'ADMIN.VOLUNTEERS': 'Volunteer Records & CVs',
    'ADMIN.STUDENTS': 'Enrollment & Academy Registrar',
    'ADMIN.PAYMENTS': 'Audit Interac Transfer Slips',
    'ADMIN.COURSES': 'Education Curriculum Builder',
    'ADMIN.CERTIFICATE_SETTINGS': 'Design Certificate Templates',
    'ADMIN.EXPORT_REPORTS': 'Extract Global Excel Statistics',
    'ADMIN.AUDIT_LOGS': 'Full Institutional Audit logs',
    'ADMIN.PARTNERS': 'Commission Partner Directory',
    'ADMIN.NEWS': 'Editorial Desk & Press Releases',
    'ADMIN.METRICS_HEALTH': 'Metrics & Health Indicators',
    'ADMIN.SIDE_OVERVIEW': '📊 Overview & Health Dashboard',
    'ADMIN.SIDE_ACCREDITATIONS': '🪪 Press Accreditations',
    'ADMIN.SIDE_VOLUNTEERS': '🤝 Community Volunteers',
    'ADMIN.SIDE_ACADEMY': '🎓 Training Classes & Academy',
    'ADMIN.SIDE_PAYMENTS': '💰 Bank & Interac Deposits',
    'ADMIN.SIDE_CMS': '📄 Dynamic CMS Editor',
    'ADMIN.SIDE_AUDIT': '📜 Audit Tracking Records',
    'ADMIN.SIDE_ACADEMY_ENROLLMENTS': '🎓 Academy Enrollments',
    'ADMIN.SIDE_NEWS': '📰 Management News & Media',
    'ADMIN.SIDE_SETTINGS': '⚙️ Global Site Parameters'
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  lang = signal<'ar' | 'en'>('ar');
  dir = computed(() => this.lang() === 'ar' ? 'rtl' : 'ltr');

  constructor() {
    this.detectLanguage();
  }

  detectLanguage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gacam_lang');
      if (saved === 'ar' || saved === 'en') {
        this.lang.set(saved);
        this.applyDirection(saved);
        return;
      }
      // Simple fallback browser detection
      const browserLang = navigator.language || '';
      if (browserLang.toLowerCase().startsWith('ar')) {
        this.lang.set('ar');
        this.applyDirection('ar');
      } else {
        this.lang.set('en');
        this.applyDirection('en');
      }
    }
  }

  setLanguage(language: 'ar' | 'en') {
    this.lang.set(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gacam_lang', language);
    }
    this.applyDirection(language);
  }

  private applyDirection(language: 'ar' | 'en') {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.setAttribute('lang', language);
      html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }
  }

  translate(key: string): string {
    const currentLang = this.lang();
    const dictionary = TRANSLATIONS[currentLang];
    return dictionary[key] || key;
  }
}
