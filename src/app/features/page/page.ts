import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { TranslatePipe } from '../../shared/pipes/translate';

interface PageDataModel {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <main class="min-h-screen bg-light-ivory py-16">
      <div class="container-gacam max-w-5xl">
        
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 animate-pulse">
            <mat-icon class="text-4xl text-royal-teal animate-spin mb-4">hourglass_empty</mat-icon>
            <p class="text-xs text-deep-teal/60 font-sans">
              {{ langService.lang() === 'ar' ? 'جاري تحميل تفاصيل الصفحة...' : 'Loading page details...' }}
            </p>
          </div>
        } @else if (pageData(); as data) {
          @if (data.slug === 'leadership-board-of-directors') {
            <!-- Static GACAM Leadership Board page -->
            @if (langService.lang() === 'ar') {
              <!-- 🇸🇦 ARABIC STATIC VIEW 🇸🇦 -->
              <div class="flex flex-col gap-12 text-start" dir="rtl">
                
                <!-- Page Title / Banner -->
                <div class="bg-gradient-to-r from-royal-teal to-deep-teal p-8 md:p-12 border-b border-champagne-gold/20 rounded-3xl text-right">
                  <div class="flex items-center gap-3 mb-2 justify-start rtl:flex-row">
                    <div class="h-8 w-8 rounded-full bg-champagne-gold/20 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold">
                      <mat-icon class="text-sm">groups</mat-icon>
                    </div>
                    <span class="text-sm font-bold uppercase tracking-widest text-champagne-gold">قيادة الهيئة</span>
                  </div>
                  <h1 class="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight">
                    أعضاء مجلس الإدارة والقيادة
                  </h1>
                  <p class="text-sm text-white/80 font-sans mt-2 leading-relaxed">
                    تعرف على أعضاء مجلس الإدارة والقيادات التنفيذية والاستشاريين الذين يساهمون بخبراتهم الريادية في صك وتنظيم استراتيجيات الهيئة.
                  </p>
                </div>

                <!-- 1. مجلس الإدارة Group -->
                <div class="flex flex-col gap-6">
                  <h2 class="text-2xl font-bold text-royal-teal border-b border-champagne-gold/20 pb-2 flex items-center gap-2">
                    <mat-icon class="text-champagne-gold">account_balance</mat-icon>
                    <span>مجلس الإدارة والقيادة التنفيذية</span>
                  </h2>

                  <div class="flex flex-col gap-6">
                    <!-- Member 1: Ayat Al Rebeh -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <!-- Mobile: stacked layout with side accent bar -->
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <!-- Image row on mobile: full-width banner style -->
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ayat.jpeg" alt="آيات ال ربح" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden text-right flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">آيات ال ربح</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">المؤسِّسة</span>
                            </div>
                          </div>
                        </div>
                        <!-- Text content -->
                        <div class="flex flex-col gap-3 flex-grow text-right p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">آيات ال ربح</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">المؤسِّسة</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            آيات ال ربح هي مؤسِّسة الجمعية الخليجية والعربية للثقافة والفنون في كندا، ومؤسِّسة الهيئة الخليجية والعربية للإعلام المرئي والمسموع والفنون البصرية والسمعية. تمتلك خبرة تتجاوز عشر سنوات في المسرح والإعلام وإدارة الفعاليات، ودرست الإعلام في دولة الإمارات العربية المتحدة، كما حصلت على تدريب احترافي في التعليق الصوتي في مملكة البحرين، إلى جانب العديد من الدراسات المتخصصة في المجال.أسست "Arab Event" عام 2016 لتصبح مرجعًا موثوقًا للفنانين والمبدعين في الخليج. واليوم تقود مبادرات ثقافية وإعلامية في كندا تعزز الحضور الخليجي والعربي وتدعم التبادل الثقافي. عضويتها المهنية في جهات إعلامية وطنية ودولية مرموقة تعكس مكانتها الاجتماعية والتزامها بالإعلام المستقل والممارسة الأخلاقية والحوار الثقافي.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 2: Ali Khalaf -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ali.jpeg" alt="علي خلف" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden text-right flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">علي خلف</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">الرئيس التنفيذي</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-right p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">علي خلف</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">الرئيس التنفيذي</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            علي خلف إعلامي متمرس يتمتع بخبرة واسعة في الصحافة والبرامج الثقافية والإنتاج الإعلامي. عُرف بمصداقيته وحضوره الميداني القوي، وبناء سمعة مهنية قائمة على نقل القصص بموثوقية والتفاعل مع مختلف فئات الجمهور.
                            بصفته الرئيس التنفيذي للهيئة الخليجية والعربية للإعلام المرئي والمسموع والفنون البصرية والسمعية، يقود الاستراتيجية الإعلامية للهيئة، ويعزز حضورها المؤسسي، ويدعم رسالتها في تطوير الإعلام، وتعزيز الحوار الثقافي، وتمكين الإبداع. كما يُعرف بكونه شخصية إعلامية معتمدة مهنيًا من جهات مرموقة، مما يعكس مكانته الاجتماعية والتزامه بالصحافة الأخلاقية والإعلام المستقل وخدمة المجتمع.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 3: Mohammed Al Rashid -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/mohamed.jpeg" alt="محمد الراشد" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden text-right flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">محمد الراشد</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">مشرف الفعاليات</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-right p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">محمد الراشد</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">مشرف الفعاليات</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            محمد الراشد مشرف فعاليات يتميز بالدقة العالية والقدرة على التنسيق والاهتمام بالتفاصيل. يُعد اليد التي تصنع الصورة الكاملة لكل فعالية، من خلال ضمان التنفيذ السلس وتقديم تجربة نهائية متقنة.يمتلك قدرة قوية على إدارة اللوجستيات وتوجيه الفرق والحفاظ على معايير عالية، مما يجعله عنصرًا أساسيًا في تقديم فعاليات احترافية وناجحة. بفضل حسه التنظيمي وحرصه على الجودة، يضمن أن تتحول الأفكار إلى واقع متكامل يرفع مستوى كل فعالية.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 4: Jafar Sarab -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/jafar.jpeg" alt="جعفر سراب" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden text-right flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">جعفر سراب</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">المشرف العام</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-right p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">جعفر سراب</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">المشرف العام</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            جعفر سراب شخصية شبابية مؤثرة وصانع محتوى معروف يمتلك جمهورًا واسعًا ومتفاعلًا. حضوره الإعلامي القوي يمكّنه من التواصل مع الشباب وتقديم محتوى يعكس اهتماماتهم ويعبّر عن صوتهم. إلى جانب تأثيره الرقمي، يمتلك خبرة عملية كرجل أعمال ومطور مشاريع في كندا، مما يضيف بُعدًا استراتيجيًا وعمليًا لعمله. يجمع بين الإبداع والقدرة على تحويل الأفكار إلى إنجازات حقيقية، مما يجعله عنصرًا مهمًا في تعزيز حضور الهيئة وتوسيع وصولها إلى مختلف الفئات داخل كندا وخارجها. بصفته المشرف العام، يلعب دورًا محوريًا في توجيه المبادرات ودعم تنسيق الفرق وتعزيز أثر الأنشطة الثقافية والإعلامية للهيئة.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. مجلس الدعم Group -->
                <div class="flex flex-col gap-6">
                  <h2 class="text-2xl font-bold text-royal-teal border-b border-champagne-gold/20 pb-2 flex items-center gap-2">
                    <mat-icon class="text-champagne-gold">handshake</mat-icon>
                    <span>مجلس الدعم</span>
                  </h2>
                  <p class="text-sm text-deep-teal/60 font-sans -mt-3">مجموعة من المتعاولين والمستشارين والداعمين الفنيين.</p>

                  <div class="flex flex-col gap-6">
                    <!-- Member 5: Ahmed Dagher -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ahmed.jpeg" alt="أحمد داغر" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden text-right flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">أحمد داغر</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">عضو مجلس الدعم - رجل أعمال</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-right p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">أحمد داغر</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">عضو مجلس الدعم - رجل أعمال</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            أحمد داغر رجل أعمال عراقي مقيم في كندا، وهو من النماذج الناجحة للمهاجرين الذين استطاعوا بناء مشاريع مؤثرة في المجتمع الكندي. و استطاع من خلالها خلق فرص عمل وتقديم نموذج ناجح لريادة الأعمال القائمة على الإصرار والعمل الجاد. يعرف أحمد بحضوره الاجتماعي القوي وقدرته على تطوير المشاريع وإدارتها بكفاءة. 
                            أحمد من أوائل المنضمين والداعمين لمجلس الدعم، مما يعكس ثقته بالهيئة وإيمانه برسالتها الإعلامية والثقافية. يمثل وجوده قيمة مضافة لما يمتلكه من خبرة عملية ورؤية تجارية تساعد في تعزيز حضور الهيئة وتوسيع شبكاتها داخل كندا.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. الحوكمة والامتثال Group -->
                <div class="bg-white rounded-3xl border border-champagne-gold/15 shadow-sm p-8 md:p-10 flex flex-col gap-8 text-right">
                  <div class="border-b border-light-ivory pb-4">
                    <h2 class="text-2xl font-bold text-royal-teal flex items-center gap-2 justify-start">
                      <mat-icon class="text-champagne-gold">gavel</mat-icon>
                      <span>الحوكمة والامتثال التنظيمي</span>
                    </h2>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Section 1 & 2 -->
                    <div class="flex flex-col gap-6">
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">١– الالتزام بالشفافية</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          تلتزم الهيئة بأعلى معايير الشفافية في جميع عملياتها، بما في ذلك نشر السياسات بوضوح، والحفاظ على تواصل مفتوح مع أصحاب المصلحة، وضمان أن تكون القرارات والإجراءات والممارسات الإعلامية مفهومة ومتاحة للجمهور. تعزز الشفافية الثقة وتنسجم مع معايير الحوكمة الإعلامية المسؤولة.
                        </p>
                      </div>
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">٢– إطار اتخاذ القرار</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          تتبع الهيئة إطارًا منظمًا وموثوقًا لاتخاذ القرارات يضمن العدالة والاتساق والمهنية. تُبنى القرارات على سياسات واضحة ومعايير إعلامية أخلاقية، وبالتشاور مع مجلس الإدارة. يضمن هذا الإطار أن تكون القرارات الاستراتيجية والتشغيلية والتحريرية داعمة لرسالة الهيئة ومتوافقة مع متطلبات الحوكمة المعترف بها.
                        </p>
                      </div>
                    </div>

                    <!-- Section 3 & 4 -->
                    <div class="flex flex-col gap-6">
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">٣– دور المجالس</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          تقوم المجالس بدور أساسي في الإشراف والتوجيه الاستراتيجي وضمان المساءلة المؤسسية.
                          يقود مجلس الإدارة الحوكمة ويشرف على الوظائف الأساسية ويضمن توافق العمل مع أهداف الهيئة.
                          أما مجلس الدعم فيقدم خبرات استشارية تعزز التطوير والتواصل والفعالية التشغيلية.
                          معًا يضمنان قيادة مسؤولة وسلوكًا مهنيًا وأداءً مؤسسيًا قويًا.
                        </p>
                      </div>
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">٤– الامتثال للوائح الإعلام الكندية</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          تعمل الهيئة وفق الامتثال الكامل للقوانين واللوائح الإعلامية في كندا، بما في ذلك مبادئ الصحافة الأخلاقية، وحماية الخصوصية، والممارسات المسؤولة في إدارة المحتوى. يضمن الامتثال توافق عمل الهيئة مع المعايير المطلوبة من المؤسسات الكندية والجهات المعتمِدة في المجال الإعلامي.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Back link -->
                <div class="bg-light-ivory/40 px-8 py-4 border-t border-champagne-gold/10 flex justify-end items-center text-sm rounded-2xl">
                  <a routerLink="/" class="flex items-center gap-1.5 font-bold text-royal-teal hover:text-champagne-gold duration-150">
                    <mat-icon class="text-sm">home</mat-icon>
                    <span>الرجوع للرئيسية</span>
                  </a>
                </div>
              </div>
            } @else {
              <!-- 🇬🇧 ENGLISH STATIC VIEW 🇬🇧 -->
              <div class="flex flex-col gap-12 text-start" dir="ltr">
                
                <!-- Page Title / Banner -->
                <div class="bg-gradient-to-r from-royal-teal to-deep-teal p-8 md:p-12 border-b border-champagne-gold/20 rounded-3xl text-left">
                  <div class="flex items-center gap-3 mb-2 justify-start">
                    <div class="h-8 w-8 rounded-full bg-champagne-gold/20 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold">
                      <mat-icon class="text-sm">groups</mat-icon>
                    </div>
                    <span class="text-sm font-bold uppercase tracking-widest text-champagne-gold">GACAM Leadership</span>
                  </div>
                  <h1 class="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight">
                    Board of Directors & Leadership
                  </h1>
                  <p class="text-sm text-white/80 font-sans mt-2 leading-relaxed">
                    Meet GACAM's leading council, directors, advisors, administrative managers, and steering committee members navigating our vision.
                  </p>
                </div>

                <!-- 1. Board of Directors Group -->
                <div class="flex flex-col gap-6">
                  <h2 class="text-2xl font-bold text-royal-teal border-b border-champagne-gold/20 pb-2 flex items-center gap-2">
                    <mat-icon class="text-champagne-gold">account_balance</mat-icon>
                    <span>Board of Directors & Executive Leadership</span>
                  </h2>

                  <div class="flex flex-col gap-6">
                    <!-- Member 1: Ayat Al Rebeh -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ayat.jpeg" alt="Ayat Al Rebeh" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">Ayat Al Rebeh</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Founder</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-left p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">Ayat Al Rebeh</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Founder</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            Ayat Al Rebeh is the founder of the Gulf & Arab Culture & Arts Association in Canada and the founder of the Gulf & Arab General Commission for Audiovisual Media, Visual and Auditory Arts. She has over ten years of experience in theater, media, and event management. She studied media in the United Arab Emirates and received professional training in voiceover in the Kingdom of Bahrain, in addition to several specialized studies in the field. She established 'Arab Event' in 2016 to become a trusted reference for artists and creators in the Gulf. Today, she leads cultural and media initiatives in Canada that strengthen the Gulf and Arab presence and support cultural exchange. Her professional membership in prestigious national and international media organizations reflects her social status and commitment to independent media, ethical practice, and cultural dialogue.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 2: Ali Khalaf -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ali.jpeg" alt="Ali Khalaf" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">Ali Khalaf</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Chief Executive Officer</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-left p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">Ali Khalaf</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Chief Executive Officer</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            Ali Khalaf is an experienced media professional with extensive background in journalism, cultural programs, and media production. He is known for his credibility, strong field presence, and building a professional reputation based on reporting stories with reliability and engaging with various audiences. As the Chief Executive Officer of the Gulf & Arab General Commission for Audiovisual Media, Visual and Auditory Arts, he leads the Commission's media strategy, enhances its institutional presence, and supports its mission to develop media, promote cultural dialogue, and empower creativity. He is also recognized as a professionally certified media figure by prestigious bodies, reflecting his social standing and commitment to ethical journalism, independent media, and community service.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 3: Mohammed Al Rashid -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/mohamed.jpeg" alt="Mohammed Al Rashid" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">Mohammed Al Rashid</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Event Supervisor</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-left p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">Mohammed Al Rashid</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Event Supervisor</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            Mohammed Al Rashid is an event supervisor characterized by high precision, coordination skills, and attention to detail. He is the hand that crafts the complete picture of every event, ensuring smooth execution and delivering a polished final experience. He possesses a strong capability in managing logistics, directing teams, and maintaining high standards, making him an essential element in delivering professional and successful events. Thanks to his organizational sense and commitment to quality, he ensures that ideas transform into an integrated reality that elevates the level of every event.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Member 4: Jafar Sarab -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/jafar.jpeg" alt="Jafar Sarab" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">Jafar Sarab</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">General Supervisor</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-left p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">Jafar Sarab</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">General Supervisor</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            Jafar Sarab is an influential youth figure and a well-known content creator with a large, engaged audience. His strong media presence enables him to connect with youth, presenting content that reflects their interests and voices their concerns. Alongside his digital influence, he has practical experience as a businessman and project developer in Canada, adding a strategic and practical dimension to his work. He combines creativity with the ability to turn ideas into tangible achievements, making him an important asset in strengthening the Commission's presence and expanding its reach to various groups inside and outside Canada. As General Supervisor, he plays a pivotal role in guiding initiatives, supporting team coordination, and enhancing the impact of the Commission's cultural and media activities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. Support Board Group -->
                <div class="flex flex-col gap-6">
                  <h2 class="text-2xl font-bold text-royal-teal border-b border-champagne-gold/20 pb-2 flex items-center gap-2">
                    <mat-icon class="text-champagne-gold">handshake</mat-icon>
                    <span>Support Board</span>
                  </h2>
                  <p class="text-sm text-deep-teal/60 font-sans -mt-3">A group of collaborators, advisors, and technical supporters.</p>

                  <div class="flex flex-col gap-6">
                    <!-- Member 5: Ahmed Dagher -->
                    <div class="bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div class="flex flex-col md:flex-row md:items-start md:gap-6 md:p-8">
                        <div class="md:shrink-0 md:w-44 md:h-44 md:rounded-2xl md:overflow-hidden md:border-2 md:border-champagne-gold/30">
                          <div class="flex items-center gap-4 p-4 md:p-0 border-b border-champagne-gold/10 md:border-none bg-gradient-to-r from-royal-teal/5 to-transparent md:bg-none">
                            <div class="w-20 h-20 md:w-full md:h-full rounded-xl md:rounded-none overflow-hidden border-2 border-champagne-gold/30 shrink-0 shadow-sm">
                              <img src="/ahmed.jpeg" alt="Ahmed Dagher" class="w-full h-full object-cover object-top" />
                            </div>
                            <div class="flex flex-col gap-1 md:hidden flex-grow">
                              <h3 class="text-lg font-bold text-royal-teal">Ahmed Dagher</h3>
                              <span class="px-2.5 py-0.5 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Support Board Member - Businessman</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3 flex-grow text-left p-4 md:p-0 pt-3 md:pt-0">
                          <div class="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-ivory pb-2">
                            <h3 class="text-xl md:text-2xl font-bold text-royal-teal">Ahmed Dagher</h3>
                            <span class="px-3 py-1 text-sm font-bold bg-royal-teal/5 text-champagne-gold border border-champagne-gold/20 rounded-full w-fit">Support Board Member - Businessman</span>
                          </div>
                          <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                            Ahmed Dagher is an Iraqi businessman residing in Canada, representing a successful model of immigrants who have built impactful projects in Canadian society. Through his ventures, he has created jobs and presented a successful model of entrepreneurship built on determination and hard work. Ahmed is known for his strong social presence and his ability to develop and manage projects efficiently.
                            Ahmed is one of the early members and supporters of the Support Board, reflecting his confidence in the Commission and belief in its media and cultural mission. His presence represents a value addition given his practical experience and business vision that helps strengthen the Commission's presence and expand its networks within Canada.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. Governance & Compliance Group -->
                <div class="bg-white rounded-3xl border border-champagne-gold/15 shadow-sm p-8 md:p-10 flex flex-col gap-8 text-left">
                  <div class="border-b border-light-ivory pb-4">
                    <h2 class="text-2xl font-bold text-royal-teal flex items-center gap-2 justify-start">
                      <mat-icon class="text-champagne-gold">gavel</mat-icon>
                      <span>Governance & Regulatory Compliance</span>
                    </h2>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Section 1 & 2 -->
                    <div class="flex flex-col gap-6">
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">1. Commitment to Transparency</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          The Commission is committed to the highest standards of transparency in all its operations, including publishing policies clearly, maintaining open communication with stakeholders, and ensuring that decisions, procedures, and media practices are understandable and accessible to the public. Transparency fosters trust and aligns with responsible media governance standards.
                        </p>
                      </div>
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">2. Decision-Making Framework</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          The Commission follows a structured and reliable framework for decision-making that ensures fairness, consistency, and professionalism. Decisions are based on clear policies and ethical media standards, in consultation with the Board of Directors. This framework ensures that strategic, operational, and editorial decisions support the Commission's mission and comply with recognized governance requirements.
                        </p>
                      </div>
                    </div>

                    <!-- Section 3 & 4 -->
                    <div class="flex flex-col gap-6">
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">3. Role of the Boards</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          The boards play a fundamental role in strategic oversight, guidance, and institutional accountability. The Board of Directors leads governance, oversees core functions, and ensures work aligns with the Commission's goals. The Support Board provides advisory expertise that enhances development, communication, and operational effectiveness. Together, they ensure responsible leadership, professional conduct, and strong institutional performance.
                        </p>
                      </div>
                      <div>
                        <h4 class="text-base font-extrabold text-royal-teal mb-2">4. Compliance with Canadian Media Regulations</h4>
                        <p class="text-sm sm:text-base text-deep-teal/80 font-sans leading-relaxed">
                          The Commission operates in full compliance with media laws and regulations in Canada, including principles of ethical journalism, privacy protection, and responsible content management. Compliance ensures GACAM's work aligns with the standards required by Canadian institutions and accrediting bodies in the media field.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Back link -->
                <div class="bg-light-ivory/40 px-8 py-4 border-t border-champagne-gold/10 flex justify-end items-center text-sm rounded-2xl">
                  <a routerLink="/" class="flex items-center gap-1.5 font-bold text-royal-teal hover:text-champagne-gold duration-150">
                    <mat-icon class="text-sm">home</mat-icon>
                    <span>Back to Home</span>
                  </a>
                </div>
              </div>
            }
          } @else {
            <article class="bg-white rounded-3xl border border-champagne-gold/15 shadow-md overflow-hidden animate-fade-in">
              
              <!-- Hero banner if imageUrl is NOT null/empty -->
              @if (data.imageUrl) {
                <div class="relative h-64 md:h-80 w-full overflow-hidden border-b border-champagne-gold/25">
                  <img 
                    [src]="data.imageUrl" 
                    [alt]="langService.lang() === 'ar' ? data.titleAr : data.titleEn"
                    class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    referrerpolicy="no-referrer"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8">
                    <div class="text-white text-start">
                      <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold mb-2 block">GACAM Dynamic Node</span>
                      <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        {{ langService.lang() === 'ar' ? data.titleAr : data.titleEn }}
                      </h1>
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Standard clean header without Image -->
                <div class="bg-gradient-to-r from-royal-teal to-deep-teal p-8 md:p-12 text-start border-b border-champagne-gold/20">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="h-8 w-8 rounded-full bg-champagne-gold/20 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold">
                      <mat-icon class="text-sm">description</mat-icon>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold">GACAM Information Node</span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {{ langService.lang() === 'ar' ? data.titleAr : data.titleEn }}
                  </h1>
                </div>
              }

              <!-- Body Content Section -->
              <div class="p-8 sm:p-12 text-start">
                <div class="text-xs sm:text-sm text-deep-teal/85 leading-relaxed font-sans whitespace-pre-line prose max-w-none">
                  {{ langService.lang() === 'ar' ? data.contentAr : data.contentEn }}
                </div>
              </div>

              <!-- Bottom Back navigation -->
              <div class="bg-light-ivory/40 px-8 py-4 border-t border-champagne-gold/10 flex justify-end items-center text-xs">
                <a routerLink="/" class="flex items-center gap-1.5 font-bold text-royal-teal hover:text-champagne-gold duration-150">
                  <mat-icon class="text-sm">home</mat-icon>
                  <span>{{ langService.lang() === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home' }}</span>
                </a>
              </div>

            </article>
          }
        } @else {
          <!-- Page Not Found fallback -->
          <div class="bg-white rounded-3xl border border-champagne-gold/15 p-12 shadow-sm text-center">
            <mat-icon class="text-4xl text-champagne-gold mb-3">error_outline</mat-icon>
            <h2 class="text-lg font-bold text-royal-teal mb-2">
              {{ langService.lang() === 'ar' ? 'الصفحة غير متوفرة حالياً' : 'Page Not Found' }}
            </h2>
            <p class="text-xs text-deep-teal/60 mb-6 font-sans">
              {{ langService.lang() === 'ar' ? 'الصفحة المطلوبة لم يتم العثور عليها أو تم تعليق محتواها مؤقتاً.' : 'The requested node is not initialized or does not exist.' }}
            </p>
            <a routerLink="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-teal text-white border border-champagne-gold/20 text-xs font-bold rounded-lg hover:bg-champagne-gold hover:text-royal-teal duration-150">
              <mat-icon class="text-sm">arrow_back</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'الرجوع للرئيسية' : 'Return Home' }}</span>
            </a>
          </div>
        }

      </div>
    </main>
  `
})
export class PageComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(GacamApiService);
  langService = inject(LanguageService);

  pageData = signal<PageDataModel | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchPage(slug);
      }
    });
  }

  fetchPage(slug: string) {
    this.loading.set(true);
    this.apiService.getPage(slug).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.pageData.set(null);
        this.loading.set(false);
      }
    });
  }
}