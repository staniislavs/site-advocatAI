import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  uk: {
    translation: {
      navbar: {
        name: "Дар'я Богдашкіна",
        role: "Ваш Захист - З Адвокатом",
        links: {
          services: "Послуги",
          about: "Про мене",
          blog: "Блог",
          contacts: "Контакти",
          faq: "FAQ"
        },
        consultation: "Консультація"
      },
      hero: {
        role: "Адвокат · Київ · {{years}} років практики",
        title_1: "Захист ваших прав —",
        title_2_italic: "з досвідом і турботою",
        description: "Дар'я Богдашкіна — адвокат з цивільного права. Вирішую найскладніші справи щодо розлучень, аліментів та поділу майна з 2014 року.",
        img_alt: "Адвокат Дар'я Богдашкіна - спеціаліст із цивільного права у Києві",
        cta_free: "Безкоштовна консультація",
        stats: {
          practice: "років практики",
          practice_val: "{{years}}+",
          won: "виграних справ",
          won_val: "90%",
          response: "час відповіді",
          response_val: "24г",
          offices: "офіс у Києві",
          offices_val: "1"
        },
        badge: {
          cert: "ЗП 001001",
          since: "Адвокат з 2014 року"
        },
        scroll: "Гортайте"
      },
      services: {
        tag: "Компетенції",
        title: "На чому я ",
        title_italic: "спеціалізуюся",
        description: "Глибока експертиза у цивільному праві, що базується на {{years}}-річній практиці та сотнях успішних справ.",
        more: "Дізнатися більше",
        cta_title: "Маєте питання?",
        cta_desc: "Опишіть вашу проблему, ми допоможемо.",
        cta_button: "Консультація",
        items: {
          divorce: { 
            name: "Шлюб і розлучення", 
            desc: "Професійний супровід процедури розірвання шлюбу. Допомога у вирішенні спорів через суд та позасудовий порядок.",
            content: "Адвокат зі шлюборозлучних справ спеціалізується на цивільному праві. Ця сфера може бути сповнена емоцій та рішень, що змінюють життя. Тому адвокат зі шлюборозлучних процесів повинен делікатно, але справедливо займатися широким спектром питань сімейного права: від розлучення, анулювання шлюбу та юридичного поділу до опіки над дітьми, аліментів та прав на побачення. Їх також називають адвокатами зі шлюборозлучних процесів або адвокатами сімейної практики.\n\nПроцес розлучення може тривати від трьох до дванадцяти місяців. Однак це залежить від того, як саме подано документи на розлучення. Велика кількість юридичних питань та конфліктних ситуацій безпосередньо впливають на терміни розгляду справи.",
            details: [
              "Консультації щодо процедури розірвання шлюбу",
              "Підготовка позовних заяв про розірвання шлюбу",
              "Представництво інтересів у суді без присутності клієнта",
              "Визнання шлюбу недійсним",
              "Встановлення режиму окремого проживання"
            ]
          },
          alimony: { 
            name: "Аліменти", 
            desc: "Захист прав дитини та забезпечення її фінансового благополуччя. Стягнення та перегляд розміру виплат.",
            content: "Аліменти будуть одним із найбільш обговорюваних питань у ваших переговорах про розлучення. Аліменти, які також називають подружньою підтримкою, — це кошти, що виплачуються одним із колишнього подружжя іншому після розлучення.\n\nМета полягає в тому, щоб обоє з подружжя, незалежно від рівня доходу, могли підтримувати рівень життя після розлучення, подібний до того, який був під час шлюбу. Крім того, така підтримка допомагає тому з подружжя, хто займався вихованням дітей та домашнім господарством, не залишитися без засобів до існування.\n\nІснують різні види угод про подружню підтримку, які може розглянути пара, що розлучається. Якщо ви хочете дізнатися, який варіант найкращий для вас, зверніться до кваліфікованого адвоката за консультацією.",
            details: [
              "Стягнення аліментів у твердій сумі або частці від доходу",
              "Стягнення додаткових витрат на дитину",
              "Зменшення або збільшення розміру аліментів",
              "Стягнення аліментів на утримання одного з подружжя",
              "Притягнення до відповідальності за несплату аліментів"
            ]
          },
          property: { 
            name: "Поділ майна", 
            desc: "Справедливий розподіл спільно нажитого майна подружжя, захист прав власності на житло та бізнес.",
            content: "Коли відбувається розірвання шлюбу, існує широкий спектр правових рішень, які приймаються щодо майна пари. А саме, визначення таких речей, як їх майно має бути розділене, і, як наслідок, те, що вважається сімейним майном. Це може бути заплутаним і складним процесом для залучених сторін.\n\nКоли це відбувається — або, бажано, до того, як це станеться, — вам слід звернутися до досвідченого адвоката зі шлюборозлучних процесів!\n\nПереконайтеся, що ваші потреби і ваші права належним чином представлені в суді з самого початку, і зверніться за допомогою до досвідченого адвоката, який буде тісно співпрацювати з вами для забезпечення належного розгляду вашої справи.",
            details: [
              "Поділ нерухомості (квартир, будинків, земельних ділянок)",
              "Поділ транспортних засобів та спільного бізнесу",
              "Спори щодо поділу кредитних зобов'язань та боргів",
              "Визнання майна особистою приватною власністю",
              "Укладення договорів про поділ майна"
            ]
          },
          children: { 
            name: "Опіка та діти", 
            desc: "Вирішення найскладніших питань щодо виховання та проживання дітей з урахуванням їх найкращих інтересів.",
            content: "Розчаровані спробою довести, що ви найкращий батько чи мати в очах суду? Розуміння стандарту “кращих інтересів дитини” і того, що дійсно шукають суди, допоможе вам домогтися опіки над дітьми в суді і позбавить вас від стресу, викликаного вашою нинішньою ситуацією.\n\nБатьки, які сподіваються виграти опіку над дітьми, повинні спочатку ознайомитися з законами про опіку над дітьми в їх юрисдикції і підготуватися, щоб показати себе в суді з найкращого боку. Однак також важливо розуміти, що єдина мета суду — найкращі інтереси дитини, що може включати або не включати визначення одноосібної опіки.",
            details: [
              "Визначення місця проживання дитини",
              "Встановлення графіка спілкування та участі у вихованні",
              "Позбавлення та поновлення батьківських прав",
              "Отримання дозволу на виїзд дитини за кордон",
              "Усунення перешкод у спілкуванні з дитиною"
            ]
          },
          inheritance: { 
            name: "Спадкування", 
            desc: "Юридична допомога в оформленні спадщини та вирішенні спадкових спорів у судовому порядку.",
            content: "Якщо вас неправомірно виключили із заповіту або якщо ваша законна спадщина опинилася під загрозою через дії інших осіб, ви маєте право на захист. Важливо діяти швидко, оскільки існують чіткі терміни, які не можна пропускати для захисту чи повернення спадщини.\n\nПерший крок — звернутися до мене для оцінки вашої ситуації. Досвідчений адвокат у справах спадкування допоможе захистити ваші права власності.",
            details: [
              "Оформлення спадщини за законом та заповітом",
              "Поновлення строків для прийняття спадщини",
              "Визнання права власності в порядку спадкування",
              "Оспорювання заповітів у суді",
              "Визначення додаткового строку для подання заяви про прийняття спадщини"
            ]
          },
          domestic_violence: { 
            name: "Домашнє насильство", 
            desc: "Терміновий правовий захист постраждалих від домашнього насильства. Отримання захисних приписів.",
            content: "Закон про протидію насильству в сім’ї сфокусований на сферах захисту від насильства в сім’ї та партнерами. У ньому передбачені кримінально-правові та адміністративні заходи покарання тих, хто заподіює емоційну або фізичну шкоду особам, з якими у них спільні сім’ї або інші близькі стосунки.",
            details: [
              "Отримання обмежувального припису щодо кривдника",
              "Захист інтересів у справах про адміністративні правопорушення",
              "Представництво в поліції та правоохоронних органах",
              "Юридичний супровід процедури притягнення до відповідальності"
            ]
          },
          housing: { 
            name: "Житлові спори", 
            desc: "Захист прав на користування житлом, вирішення конфліктів щодо реєстрації та виселення.",
            details: [
              "Виселення або вселення в житлове приміщення",
              "Визнання особи такою, що втратила право користування житлом",
              "Спори щодо порядку користування житловим приміщенням",
              "Усунення перешкод у користуванні власністю"
            ]
          },
          adoption: { 
            name: "Усиновлення", 
            desc: "Повний супровід процедури усиновлення. Допомога у підготовці документів для органів опіки.",
            details: [
              "Юридичні консультації з питань усиновлення",
              "Підготовка пакету документів для подання до суду",
              "Представництво в органах опіки та піклування",
              "Усиновлення дитини одним із подружжя (вітчимом/мачухою)"
            ]
          },
          property_rights: {
            name: "Право власності",
            desc: "Захист та оформлення права власності на нерухомість та інше цінне майно.",
            content: "Юридичне визначення власності – це “все, що належить фізичній або юридичній особі”. Власність може бути матеріальним або нематеріальним об’єктом або, в деяких випадках, ідеєю, якою володіє хтось. Право власності на майно дає власнику право володіти і використовувати майно, а також право виключати будь-які інші права на володіння і використання даного майна.\n\nПрава власності та особиста свобода взаємопов’язані, місія адвоката з прав власності полягає в тому, щоб неухильно захищати права власності клієнтів від державних і приватних зловживань.",
            details: [
              "Захист права власності у судовому порядку",
              "Визнання права власності на новобудови та самочинне будівництво",
              "Оформлення документів на нерухомість",
              "Супровід угод з нерухомістю"
            ]
          }
        }
      },
      about: {
        tag: "Про мене",
        title: "Адвокат, якому можна довіряти",
        p1: "Я — Богдашкіна Дар'я Олександрівна, адвокат з {{years}}-річним досвідом у цивільному праві. Мій підхід базується не лише на сухому законодавстві, а й на емпатії.",
        p2: "Я розумію, що цивільні спори — це завжди емоційне випробування. Кожен клієнт отримує мою особисту увагу та чесну оцінку ситуації. ",
        p3: "Я не прагну взяти в роботу сотні справ одночасно. Моя філософія — глибоке занурення в кожну окрему історію, щоб знайти рішення, яке максимально захистить ваші інтереси.",
        highlights: {
          licensed: { title: "Ліцензований адвокат України", sub: "Свідоцтво ЗП 001001 від 28.02.2014" },
          offices: { title: "Офіс у Києві", sub: "вул. Басейна 23" },
          quick: { title: "Відповідаю особисто", sub: "+38 095 909 89 80 · Швидкий зв'язок" }
        },
        cta: "Безкоштовна консультація"
      },
      process: {
        tag: "Процес",
        title_1: "Чотири кроки від",
        title_2: "першого дзвінка до ",
        title_italic: "результату.",
        subtitle: "№ 04 · ПРОЦЕС",
        items: [
          { id: "01", name: "Перша розмова", desc: "30 хвилин у Zoom або в офісі. Безкоштовно. Розповідаєте ситуацію — я кажу, що з нею робити." },
          { id: "02", name: "Стратегія", desc: "Письмова правова позиція з реалістичними сценаріями, термінами та бюджетом. Без сюрпризів." },
          { id: "03", name: "Документи", desc: "Готую позов, докази, клопотання. Ви підписуєте. Я подаю та веду справу далі." },
          { id: "04", name: "Суд та виконання", desc: "Представництво на всіх засіданнях. Контроль виконання рішення до фактичного результату." }
        ]
      },
      reviews: {
        tag: "Відгуки",
        title: "Що кажуть ",
        title_italic: "клієнти",
        stat: "відгуків",
        items: [
          { name: "Олена Савченко", date: "Березень 2024", text: "Зверталась за допомогою у справі про аліменти. Результат перевершив очікування — рішення за 2 засідання. Дуже вдячна за чіткість та підтримку." },
          { name: "Михайло Ткаченко", date: "Грудень 2023", text: "Розлучення з розподілом майна пройшло набагато спокійніше, ніж я очікував. Дар'я Олександрівна — справжній професіонал, який знає, як захистити інтереси клієнта." },
          { name: "Ірина Коваленко", date: "Серпень 2024", text: "Боролись за опіку над дитиною. Дар'я Олександрівна була на зв'язку майже 24/7. Її впевненість у суді додавала сил мені. Результат позитивний!" }
        ]
      },
      faq: {
        tag: "Часті запитання",
        title: "Потрібні ",
        title_italic: "відповіді?",
        items: [
          { q: "Скільки коштує перша консультація?", a: "Перша консультація є безкоштовною. Під час неї ми знайомимося, я аналізую вашу ситуацію та пропоную стратегію захисту. Жодних зобов'язань після першої розмови." },
          { q: "Як швидко можна призначити зустріч?", a: "Зазвичай зустріч (офлайн або онлайн) призначається протягом 24 годин з моменту звернення. У екстрених ситуаціях — протягом кількох годин." },
          { q: "Чи обов'язкова моя присутність на засіданнях?", a: "У більшості справ (розлучення, поділ майна) я можу представляти ваші інтереси повністю самостійно. Ваша присутність не є обов'язковою, якщо ми оформимо відповідне представництво." },
          { q: "Як довго триває процес розлучення?", a: "Через ДРАЦС — 1 місяць. Через суд — від 2 до 6 місяців, залежно від наявності спорів щодо дітей чи майна. Я завжди намагаюся максимально прискорити процес." }
        ]
      },
      contacts: {
        tag: "Зв'язок",
        title: "Розкажіть про ",
        title_italic: "вашу ситуацію",
        description: "Перша консультація безкоштовна та конфіденційна. Оберіть зручний спосіб зв'язку або заповніть форму — я відповім протягом 24 годин.",
        phone: "Телефон",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        form: {
          name: "Ваше ім'я *",
          name_placeholder: "Ярослав Мудрий",
          phone: "Номер телефону *",
          phone_placeholder: "+38 0__ ___ __ __",
          type: "Тип справи",
          type_placeholder: "Оберіть категорію",
          description: "Короткий опис",
          desc_placeholder: "Опишіть вашу проблему основною інформацією...",
          submit: "Надіслати запит",
          agreement: "Натискаючи на кнопку, ви погоджуєтеся на обробку персональних даних. Конфіденційність гарантована.",
          required_field: "Будь ласка, заповніть це поле",
          success: "Дякуємо! Ваш запит надіслано. Я зв'яжуся з вами найближчим часом.",
          captcha_label: "Перевірка: {{num1}} + {{num2}} = ?",
          captcha_placeholder: "Ваша відповідь",
          captcha_error: "Невірна відповідь на перевірку. Спробуйте ще раз.",
          bot_error: "Вибачте, ви схожі на бота.",
          types: {
            divorce: "Розлучення",
            alimony: "Аліменти",
            property: "Поділ майна",
            children: "Опіка над дітьми",
            custody: "Опіка над дітьми",
            inheritance: "Спадкування",
            other: "Інше"
          },
          theme: {
            ai: "AI:",
            light: "Адаптовано під денне світло",
            dark: "Адаптовано під нічний режим"
          }
        }
      },
      footer: {
        desc: "Професійний правовий захист у цивільних справах. Працюємо на результат з 2014 року.",
        nav_tag: "Навігація",
        loc_tag: "Локації",
        kyiv: "Київ",
        kyiv_addr: "вул. Басейна 23, офіс 25",
        legal_tag: "Юридична інформація",
        legal_text: "Свідоцтво адвоката ЗП 001001 від 28.02.2014 Видане Радою адвокатів Запорізької області",
        rights: "Всі права захищено",
        privacy: "Політика конфіденційності",
        terms: "Умови використання"
      },
      blog: {
        tag: "Блог",
        title: "Останні ",
        title_italic: "публікації",
        read_more: "Читати далі",
        no_posts: "Публікацій поки немає.",
        back: "Назад до списку",
        admin: {
          title: "Управління блогом",
          login: "Вхід для автора",
          logout: "Вийти",
          new_post: "Новий запис",
          edit: "Редагувати",
          delete: "Видалити",
          save: "Зберегти",
          cancel: "Скасувати",
          publish: "Опублікувати",
          draft: "Чернетка",
          fields: {
            title: "Заголовок",
            excerpt: "Короткий опис",
            content: "Зміст",
            contentType: "Тип контенту",
            image: "URL зображення",
            category: "Рубрика",
            slug: "Slug (URL)",
            tags: "Теги (через кому)"
          }
        },
        hero: {
          title: "Юридичний блог",
          subtitle: "Поради адвоката з цивільного права: розлучення, аліменти, поділ майна.",
          search: "Пошук по блогу...",
          find: "Знайти"
        },
        categories: {
          tag: "Рубрики",
          all: "Всі статті",
          posts_count: "{{count}} статей",
          items: {
            rozluchennya: "Шлюб і розлучення",
            "podil-mayna": "Поділ майна",
            alimony: "Аліменти",
            opika: "Опіка та діти",
            spadkuvannya: "Спадкування",
            nasylstvo: "Домашнє насильство",
            "zhytlovi-spory": "Житлові спори",
            usynovlennya: "Усиновлення",
            "pravo-vlasnosti": "Право власності",
            general: "Загальні теми"
          }
        },
        post: {
          updated: "Дата оновлення",
          reading_time: "{{min}} хв читання",
          toc: "Зміст",
          share: "Поділитися",
          next_posts: "Схожі статті",
          cta_sidebar: {
            title: "Безкоштовна оцінка справи",
            subtitle: "За 15 хвилин — відповідь по вашій ситуації",
            button: "Отримати консультацію"
          }
        }
      },
      preloader: {
        slogan: "Ваш захист З Адвокатом",
        initials_1: "Д",
        initials_2: "Б"
      }
    }
  },
  en: {
    translation: {
      navbar: {
        name: "Darya Bogdashkina",
        role: "Your Protection - With an Attorney",
        links: {
          services: "Services",
          about: "About",
          blog: "Blog",
          contacts: "Contacts",
          faq: "FAQ"
        },
        consultation: "Consultation"
      },
      hero: {
        role: "Attorney · Kyiv · {{years}} years of practice",
        title_1: "Protecting your rights —",
        title_2_italic: "with experience and care",
        description: "Darya Bogdashkina — professional civil law attorney. Solving complex cases involving divorce, alimony and property division since 2014.",
        img_alt: "Attorney Darya Bogdashkina - civil law specialist in Kyiv",
        cta_free: "Free Consultation",
        stats: {
          practice: "years of practice",
          practice_val: "{{years}}+",
          won: "cases won",
          won_val: "90%",
          response: "response time",
          response_val: "24h",
          offices: "office in Kyiv",
          offices_val: "1"
        },
        badge: {
          cert: "ZP 001001",
          since: "Attorney since 2014"
        },
        scroll: "Scroll"
      },
      services: {
        tag: "Competencies",
        title: "What I ",
        title_italic: "specialize in",
        description: "Deep expertise in civil law, based on {{years}} years of practice and hundreds of successful cases.",
        more: "Learn More",
        cta_title: "Have questions?",
        cta_desc: "Describe your problem, and we will help.",
        cta_button: "Consultation",
        items: {
          divorce: { 
            name: "Marriage and Divorce", 
            desc: "Professional support for marriage dissolution. Assistance in court and out-of-court settlements.",
            details: [
              "Consultations on divorce procedures",
              "Preparation of divorce claims",
              "Representation in court without client presence",
              "Marriage annulment",
              "Establishment of separate residence regime"
            ]
          },
          alimony: { 
            name: "Alimony", 
            desc: "Protection of child rights and ensuring financial well-being. Collection and review of payments.",
            details: [
              "Collection of alimony in fixed amount or share of income",
              "Collection of additional expenses for the child",
              "Reduction or increase of alimony amount",
              "Spousal support collection",
              "Enforcement of alimony payment responsibility"
            ]
          },
          property: { 
            name: "Property Division", 
            desc: "Fair distribution of jointly acquired marital property, protection of rights to housing and business.",
            details: [
              "Division of real estate (apartments, houses, land plots)",
              "Division of vehicles and shared business",
              "Disputes over joint credit obligations and debts",
              "Recognition of property as personal private property",
              "Execution of property division agreements"
            ]
          },
          children: { 
            name: "Custody and Children", 
            desc: "Solving complex issues of child upbringing and residence with their best interests in mind.",
            details: [
              "Determination of child's place of residence",
              "Establishment of communication and upbringing schedule",
              "Deprivation and restoration of parental rights",
              "Obtaining permission for child's travel abroad",
              "Removal of obstacles in communication with the child"
            ]
          },
          inheritance: { 
            name: "Inheritance", 
            desc: "Legal assistance in heritage registration and resolution of inheritance disputes in court.",
            details: [
              "Registration of inheritance by law and by will",
              "Restoration of terms for inheritance acceptance",
              "Recognition of ownership through inheritance",
              "Contesting wills in court",
              "Determination of additional term for inheritance application"
            ]
          },
          domestic_violence: { 
            name: "Domestic Violence", 
            desc: "Urgent legal protection for victims of domestic violence. Obtaining protection orders.",
            details: [
              "Obtaining a restrictive order against the offender",
              "Defense in administrative offense cases",
              "Representation in police and law enforcement",
              "Legal support for responsibility procedures"
            ]
          },
          housing: { 
            name: "Housing Disputes", 
            desc: "Protection of rights to use housing, resolution of registration and eviction conflicts.",
            details: [
              "Eviction or move-in to housing premises",
              "Recognition of a person as having lost the right to use housing",
              "Disputes over the procedure for using housing premises",
              "Removal of obstacles to the use of property"
            ]
          },
          adoption: { 
            name: "Adoption", 
            desc: "Full support for the adoption process. Help in preparing documents for guardianship authorities.",
            details: [
              "Legal consultations on adoption issues",
              "Preparation of document package for court submission",
              "Representation in guardianship and trusteeship authorities",
              "Child adoption by one spouse (stepparent)"
            ]
          },
          property_rights: {
            name: "Property Rights",
            desc: "Protection and registration of ownership rights for real estate and other valuable property.",
            details: [
              "Protection of ownership rights in court",
              "Recognition of ownership for new buildings and unauthorized construction",
              "Registration of real estate documents",
              "Support for real estate transactions"
            ]
          }
        }
      },
      about: {
        tag: "About me",
        title: "An attorney you can trust",
        p1: "I am Darya Oleksandrivna Bogdashkina, an attorney with {{years}} years of experience in civil law. My approach is based not only on dry legislation but also on empathy.",
        p2: "I understand that civil disputes are always an emotional trial. Each client receives my personal attention and honest assessment of the situation.",
        p3: "I don't strive to take on hundreds of cases at once. My philosophy is a deep immersion into each separate story to find a solution that protects your interests to the maximum.",
        highlights: {
          licensed: { title: "Licensed Ukrainian Attorney", sub: "Certificate ZP 001001 from 28.02.2014" },
          offices: { title: "Office in Kyiv", sub: "23 Baseina St, Office 25" },
          quick: { title: "I answer personally", sub: "+38 095 909 89 80 · Quick contact" }
        },
        cta: "Free Consultation"
      },
      process: {
        tag: "Process",
        title_1: "Four steps from",
        title_2: "the first call to ",
        title_italic: "the result.",
        subtitle: "№ 04 · PROCESS",
        items: [
          { id: "01", name: "First Call", desc: "30 minutes on Zoom or in the office. Free of charge. You explain the situation — I tell you what to do with it." },
          { id: "02", name: "Strategy", desc: "Written legal position with realistic scenarios, deadlines, and budget. No surprises." },
          { id: "03", name: "Documents", desc: "I prepare the claim, evidence, motions. You sign. I file and conduct the case further." },
          { id: "04", name: "Court & Execution", desc: "Representation at all hearings. Control of the decision enforcement until the actual result." }
        ]
      },
      reviews: {
        tag: "Reviews",
        title: "What ",
        title_italic: "clients say",
        stat: "reviews",
        items: [
          { name: "Olena Savchenko", date: "March 2024", text: "Asked for help in an alimony case. The result exceeded expectations — decision in 2 hearings. Extremely grateful for clarity and support." },
          { name: "Mykhailo Tkachenko", date: "December 2023", text: "Divorce with property division went much smoother than I expected. Darya Oleksandrivna is a true professional who knows how to protect the client's interests." },
          { name: "Iryna Kovalenko", date: "August 2024", text: "Fought for child custody. Darya Oleksandrivna was available almost 24/7. Her confidence in court gave me strength. Positive result!" }
        ]
      },
      faq: {
        tag: "Frequently Asked Questions",
        title: "Need ",
        title_italic: "answers?",
        items: [
          { q: "How much does the first consultation cost?", a: "The first consultation is free. During it, we get to know each other, I analyze your situation and propose a defense strategy. No obligations after the first conversation." },
          { q: "How quickly can an appointment be scheduled?", a: "An appointment (offline or online) is usually scheduled within 24 hours of contact. In urgent situations — within a few hours." },
          { q: "Is my presence mandatory at hearings?", a: "In most cases (divorce, property division), I can represent your interests entirely independently. Your presence is not mandatory if we issue appropriate representation." },
          { q: "How long does a divorce process take?", a: "Through the registry office — 1 month. Through court — from 2 to 6 months, depending on disputes regarding children or property. I always try to speed up the process as much as possible." }
        ]
      },
      contacts: {
        tag: "Contact",
        title: "Tell me about ",
        title_italic: "your situation",
        description: "The first consultation is free and confidential. Choose a convenient way to contact or fill out the form — I will respond within 24 hours.",
        phone: "Phone",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        form: {
          name: "Your name *",
          name_placeholder: "Yaroslav the Wise",
          phone: "Phone number *",
          phone_placeholder: "+38 0__ ___ __ __",
          type: "Type of case",
          type_placeholder: "Select category",
          description: "Short description",
          desc_placeholder: "Describe your problem with basic information...",
          submit: "Submit",
          agreement: "By clicking the button, you agree to the processing of personal data. Confidentiality guaranteed.",
          required_field: "Please fill out this field",
          success: "Thank you! Your request has been sent. I will contact you shortly.",
          captcha_label: "Verification: {{num1}} + {{num2}} = ?",
          captcha_placeholder: "Your answer",
          captcha_error: "Incorrect verification answer. Please try again.",
          bot_error: "Sorry, you seem like a bot.",
          types: {
            divorce: "Divorce",
            alimony: "Alimony",
            property: "Property Division",
            children: "Custody",
            custody: "Custody",
            inheritance: "Inheritance",
            other: "Other"
          },
          theme: {
            ai: "AI:",
            light: "Adapted for daylight",
            dark: "Adapted for night mode"
          }
        }
      },
      footer: {
        desc: "Professional legal protection in civil matters. Working for results since 2014.",
        nav_tag: "Navigation",
        loc_tag: "Locations",
        kyiv: "Kyiv",
        kyiv_addr: "23 Baseina St, Office 25",
        legal_tag: "Legal Information",
        legal_text: "Attorney certificate ZP 001001 from 28.02.2014 issued by the Bar Council of Zaporizhzhia region",
        rights: "All rights reserved",
        privacy: "Privacy Policy",
        terms: "Terms of Use"
      },
      blog: {
        tag: "Blog",
        title: "Latest ",
        title_italic: "publications",
        read_more: "Read more",
        no_posts: "No publications yet.",
        back: "Back to list",
        admin: {
          title: "Blog Management",
          login: "Author Login",
          logout: "Logout",
          new_post: "New Post",
          edit: "Edit",
          delete: "Delete",
          save: "Save",
          cancel: "Cancel",
          publish: "Publish",
          draft: "Draft",
          fields: {
            title: "Title",
            excerpt: "Excerpt",
            content: "Content",
            contentType: "Content Type",
            image: "Image URL",
            category: "Category",
            slug: "Slug (URL)",
            tags: "Tags (comma separated)"
          }
        },
        hero: {
          title: "Legal Blog",
          subtitle: "Attorney advice on civil law: divorce, alimony, property division.",
          search: "Search blog...",
          find: "Find"
        },
        categories: {
          tag: "Categories",
          all: "All Articles",
          posts_count: "{{count}} articles",
          items: {
            rozluchennya: "Marriage and Divorce",
            "podil-mayna": "Property Division",
            alimony: "Alimony",
            opika: "Custody and Children",
            spadkuvannya: "Inheritance",
            nasylstvo: "Domestic Violence",
            "zhytlovi-spory": "Housing Disputes",
            usynovlennya: "Adoption",
            "pravo-vlasnosti": "Property Rights",
            general: "General Topics"
          }
        },
        post: {
          updated: "Updated",
          reading_time: "{{min}} min read",
          toc: "Table of Contents",
          share: "Share",
          next_posts: "Related Articles",
          cta_sidebar: {
            title: "Free Case Assessment",
            subtitle: "Answer in 15 minutes — based on your situation",
            button: "Get Consultation"
          }
        }
      },
      preloader: {
        slogan: "Your Protection with an Attorney",
        initials_1: "D",
        initials_2: "B"
      }
    }
  },
  de: {
    translation: {
      navbar: {
        name: "Darya Bogdashkina",
        role: "Ihr Schutz - Mit einer Anwältin",
        links: {
          services: "Leistungen",
          about: "Über mich",
          blog: "Blog",
          contacts: "Kontakt",
          faq: "FAQ"
        },
        consultation: "Beratung"
      },
      hero: {
        role: "Anwältin · Kiew · {{years}} Jahre Praxis",
        title_1: "Schutz Ihrer Rechte —",
        title_2_italic: "mit Erfahrung und Sorgfalt",
        description: "Anwältin für Zivilrecht Darya Bogdashkina. Lösung komplexester Zivilsachen professionell und vertraulich.",
        cta_free: "Kostenlose Beratung",
        stats: {
          practice: "Jahre Praxis",
          practice_val: "{{years}}+",
          won: "gewonnene Fälle",
          won_val: "90%",
          response: "Reaktionszeit",
          response_val: "24h",
          offices: "Büro in Kiew",
          offices_val: "1"
        },
        badge: {
          cert: "ZP 001001",
          since: "Anwältin seit 2014"
        },
        scroll: "Scrollen"
      },
      services: {
        tag: "Kompetenzen",
        title: "Worauf ich mich ",
        title_italic: "spezialisiere",
        description: "Umfassende Expertise im Zivilrecht, basierend auf {{years}} Jahren Praxis und hunderten erfolgreichen Fällen.",
        more: "Mehr erfahren",
        cta_title: "Haben Sie Fragen?",
        cta_desc: "Beschreiben Sie Ihr Problem, wir helfen Ihnen.",
        cta_button: "Beratung",
        items: {
          divorce: { 
            name: "Ehe und Scheidung", 
            desc: "Professionelle Begleitung des Ehescheidungsverfahrens. Unterstützung bei gerichtlichen und außergerichtlichen Beilegungen.",
            details: [
              "Beratung zum Scheidungsverfahren",
              "Vorbereitung von Scheidungsklagen",
              "Vertretung vor Gericht ohne Anwesenheit des Mandanten",
              "Annullierung der Ehe",
              "Festlegung des getrennten Wohnsitzes"
            ]
          },
          alimony: { 
            name: "Unterhalt", 
            desc: "Schutz der Kinderrechte und Sicherstellung des finanziellen Wohlergehens. Einzug und Überprüfung von Zahlungen.",
            details: [
              "Einzug von Unterhalt in fester Summe oder Einkommensanteil",
              "Einzug zusätzlicher Kosten für das Kind",
              "Senkung oder Erhöhung des Unterhaltsbetrags",
              "Ehegattenunterhalt",
              "Durchsetzung der Verantwortung bei Nichtzahlung"
            ]
          },
          property: { 
            name: "Vermögensteilung", 
            desc: "Faire Aufteilung des während der Ehe erworbenen Vermögens, Schutz der Rechte an Wohnraum und Unternehmen.",
            details: [
              "Aufteilung von Immobilien (Wohnungen, Häuser, Grundstücke)",
              "Aufteilung von Fahrzeugen und gemeinsamen Unternehmen",
              "Streitigkeiten über Kreditverpflichtungen und Schulden",
              "Anerkennung von Eigentum als persönliches Privateigentum",
              "Abschluss von Vereinbarungen über die Vermögensteilung"
            ]
          },
          children: { 
            name: "Sorgerecht und Kinder", 
            desc: "Lösung komplexer Fragen der Kindererziehung und des Wohnsitzes unter Berücksichtigung des Kindeswols.",
            details: [
              "Bestimmung des Wohnsitzes des Kindes",
              "Erstellung eines Umgangs- und Erziehungsplans",
              "Entzug und Wiederherstellung des elterlichen Sorgerechts",
              "Einholung der Erlaubnis für Reisen des Kindes ins Ausland",
              "Beseitigung von Hindernissen im Umgang mit dem Kind"
            ]
          },
          inheritance: { 
            name: "Erbrecht", 
            desc: "Rechtliche Unterstützung bei der Erbschaftsregistrierung und Beilegung von Erbrechtsstreitigkeiten vor Gericht.",
            details: [
              "Erbschaftsabwicklung nach Gesetz und Testament",
              "Wiederherstellung von Fristen für die Erbschaftsannahme",
              "Anerkennung von Eigentum durch Erbschaft",
              "Anfechtung von Testamenten vor Gericht",
              "Festlegung einer zusätzlichen Frist für den Erbschaftsantrag"
            ]
          },
          domestic_violence: { 
            name: "Häusliche Gewalt", 
            desc: "Dringender Rechtsschutz für Opfer häuslicher Gewalt. Einholung von Schutzanordnungen.",
            details: [
              "Einholung einer Schutzanordnung gegen den Täter",
              "Verteidigung in Ordnungswidrigkeitsverfahren",
              "Vertretung bei Polizei und Strafverfolgungsbehörden",
              "Rechtliche Unterstützung bei Verantwortungsverfahren"
            ]
          },
          housing: { 
            name: "Wohnungsstreitigkeiten", 
            desc: "Schutz der Wohnnutzungsrechte, Beilegung von Registrierungs- und Räumungskonflikten.",
            details: [
              "Räumung oder Einzug in Wohnräume",
              "Anerkennung des Verlusts des Wohnnutzungsrechts",
              "Streitigkeiten über das Verfahren zur Nutzung von Wohnräumen",
              "Beseitigung von Eigentumsnutzungshindernissen"
            ]
          },
          adoption: { 
            name: "Adoption", 
            desc: "Vollständige Unterstützung des Adoptionsprozesses. Hilfe bei der Vorbereitung von Dokumenten für Behörden.",
            details: [
              "Rechtliche Beratung zu Adoptionsfragen",
              "Vorbereitung des Dokumentenpakets für das Gericht",
              "Vertretung vor Vormundschaftsbehörden",
              "Adoption durch einen Ehepartner (Stiefelternteil)"
            ]
          },
          property_rights: {
            name: "Eigentumsrechte",
            desc: "Schutz und Registrierung von Eigentumsrechten für Immobilien und andere wertvolle Güter.",
            details: [
              "Schutz von Eigentumsrechten vor Gericht",
              "Anerkennung von Eigentum bei Neubauten und unbefugtem Bauen",
              "Registrierung von Immobiliendokumenten",
              "Unterstützung bei Immobilientransaktionen"
            ]
          }
        }
      },
      about: {
        tag: "Über mich",
        title: "Eine Anwältin, der Sie vertrauen können",
        p1: "Ich bin Darya Oleksandrivna Bogdashkina, eine Anwältin mit {{years}} Jahren Erfahrung im Zivilrecht. Mein Ansatz basiert nicht nur auf trockenen Gesetzen, sondern auch auf Empathie.",
        p2: "Ich verstehe, dass Zivilstreitigkeiten immer eine emotionale Belastung sind. Jeder Mandant erhält meine persönliche Aufmerksamkeit und eine ehrliche Einschätzung der Situation.",
        p3: "Ich strebe nicht danach, hunderte Fälle gleichzeitig zu übernehmen. Meine Philosophie ist ein tiefes Eintauchen in jede einzelne Geschichte, um eine Lösung zu finden, die Ihre Interessen optimal schützt.",
        highlights: {
          licensed: { title: "Zugelassene ukrainische Anwältin", sub: "Zertifikat ZP 001001 vom 28.02.2014" },
          offices: { title: "Büro in Kiew", sub: "Baseina Str. 23, Büro 25" },
          quick: { title: "Ich antworte persönlich", sub: "+38 095 909 89 80 · Schneller Kontakt" }
        },
        cta: "Kostenlose Beratung"
      },
      process: {
        tag: "Prozess",
        title_1: "Vier Schritte vom",
        title_2: "ersten Anruf bis zum ",
        title_italic: "Ergebnis.",
        subtitle: "№ 04 · PROZESS",
        items: [
          { id: "01", name: "Erstes Gespräch", desc: "30 Minuten Zoom oder im Büro. Kostenlos. Sie schildern — ich sage, was zu tun ist." },
          { id: "02", name: "Strategie", desc: "Schriftliche Position mit Szenarien, Terminen und Budget. Ohne Überraschungen." },
          { id: "03", name: "Dokumente", desc: "Ich erstelle Klagen, Beweise, Anträge. Sie unterschreiben. Ich reiche ein." },
          { id: "04", name: "Gericht & Vollstreckung", desc: "Vertretung bei allen Terminen. Kontrolle der Vollstreckung der Entscheidung bis zum Ergebnis." }
        ]
      },
      reviews: {
        tag: "Bewertungen",
        title: "Was ",
        title_italic: "Kunden sagen",
        stat: "Bewertungen",
        items: [
          { name: "Olena Sawtschenko", date: "März 2024", text: "Habe Hilfe in einem Unterhaltsfall gesucht. Das Ergebnis übertraf die Erwartungen — Entscheidung in 2 Anhörungen. Sehr dankbar für Klarheit und Unterstützung." },
          { name: "Mychailo Tkachenko", date: "Dezember 2023", text: "Die Scheidung mit Güterteilung verlief viel ruhiger als erwartet. Darya Oleksandrivna ist ein echter Profi, der weiß, wie man die Interessen der Mandanten schützt." },
          { name: "Iryna Kowalenko", date: "August 2024", text: "Wir haben um das Sorgerecht für das Kind gekämpft. Darya Oleksandrivna war fast rund um die Uhr erreichbar. Ihre Sicherheit vor Gericht gab mir Kraft. Positives Ergebnis!" }
        ]
      },
      faq: {
        tag: "Häufig gestellte Fragen",
        title: "Brauchen Sie ",
        title_italic: "Antworten?",
        items: [
          { q: "Wie viel kostet die Erstberatung?", a: "Die Erstberatung ist kostenlos. Dabei lernen wir uns kennen, ich analysiere Ihre Situation und schlage eine Verteidigungsstrategie vor. Keine Verpflichtungen nach dem ersten Gespräch." },
          { q: "Wie schnell kann ein Termin vereinbart werden?", a: "Ein Termin (offline oder online) wird in der Regel innerhalb von 24 Stunden nach der Kontaktaufnahme vereinbart. In dringenden Situationen — innerhalb weniger Stunden." },
          { q: "Ist meine Anwesenheit bei Anhörungen obligatorisch?", a: "In den meisten Fällen (Scheidung, Vermögensteilung) kann ich Ihre Interessen völlig unabhängig vertreten. Ihre Anwesenheit ist nicht obligatorisch, wenn wir eine entsprechende Vertretung ausstellen." },
          { q: "Wie lange dauert ein Scheidungsprozess?", a: "Über das Standesamt — 1 Monat. Über das Gericht — 2 bis 6 Monate, abhängig von Streitigkeiten über Kinder oder Eigentum. Ich versuche immer, den Prozess so weit wie möglich zu beschleunigen." }
        ]
      },
      contacts: {
        tag: "Kontakt",
        title: "Erzählen Sie mir von ",
        title_italic: "Ihrer Situation",
        description: "Die Erstberatung ist kostenlos und vertraulich. Wählen Sie einen bequemen Weg zur Kontaktaufnahme oder füllen Sie das Formular aus — ich antworte innerhalb von 24 Stunden.",
        phone: "Telefon",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        form: {
          name: "Ihr Name *",
          name_placeholder: "Jaroslaw der Weise",
          phone: "Telefonnummer *",
          phone_placeholder: "+38 0__ ___ __ __",
          type: "Art des Falls",
          type_placeholder: "Kategorie wählen",
          description: "Kurzbeschreibung",
          desc_placeholder: "Beschreiben Sie Ihr Problem mit den wichtigsten Informationen...",
          submit: "Anfrage senden",
          agreement: "Mit dem Klick auf den Button stimmen Sie der Verarbeitung personenbezogener Daten zu. Vertraulichkeit garantiert.",
          required_field: "Bitte füllen Sie dieses Feld aus",
          success: "Danke! Ihre Anfrage wurde gesendet. Ich werde mich in Kürze bei Ihnen melden.",
          captcha_label: "Verifizierung: {{num1}} + {{num2}} = ?",
          captcha_placeholder: "Ihre Antwort",
          captcha_error: "Falsche Verifizierungsantwort. Bitte versuchen Sie es erneut.",
          bot_error: "Entschuldigung, Sie scheinen ein Bot zu sein.",
          types: {
            divorce: "Scheidung",
            alimony: "Unterhalt",
            property: "Vermögensteilung",
            children: "Sorgerecht",
            custody: "Sorgerecht",
            inheritance: "Erbrecht",
            other: "Andere"
          }
        }
      },
      footer: {
        desc: "Professioneller Rechtsschutz in Zivilsachen. Wir arbeiten seit 2014 für Ergebnisse.",
        nav_tag: "Navigation",
        loc_tag: "Standorte",
        kyiv: "Kiew",
        kyiv_addr: "Baseina Str. 23, Büro 25",
        legal_tag: "Rechtliche Informationen",
        legal_text: "Anwaltszertifikat ZP 001001 vom 28.02.2014, ausgestellt durch den Anwaltsrat der Region Saporischschja",
        rights: "Alle Rechte vorbehalten",
        privacy: "Datenschutzrichtlinie",
        terms: "Nutzungsbedingungen"
      },
      blog: {
        tag: "Blog",
        title: "Aktuelle ",
        title_italic: "Veröffentlichungen",
        read_more: "Weiterlesen",
        no_posts: "Noch keine Veröffentlichungen.",
        back: "Zurück zur Liste",
        admin: {
          title: "Blog-Verwaltung",
          login: "Autoren-Login",
          logout: "Abmelden",
          new_post: "Neuer Beitrag",
          edit: "Bearbeiten",
          delete: "Löschen",
          save: "Speichern",
          cancel: "Abbrechen",
          publish: "Veröffentlichen",
          draft: "Entwurf",
          fields: {
            title: "Titel",
            excerpt: "Auszug",
            content: "Inhalt",
            contentType: "Inhaltstyp",
            image: "Bild-URL",
            tags: "Tags (kommagetrennt)"
          }
        }
      },
      preloader: {
        slogan: "Ihr Schutz mit einer Anwältin",
        initials_1: "D",
        initials_2: "B"
      }
    }
  },
  ru: {
    translation: {
      navbar: {
        name: "Дарья Богдашкина",
        role: "Ваша Защита - С Адвокатом",
        links: {
          services: "Услуги",
          about: "Обо мне",
          blog: "Блог",
          contacts: "Контакты",
          faq: "FAQ"
        },
        consultation: "Консультация"
      },
      hero: {
        role: "Адвокат · Киев · {{years}} лет практики",
        title_1: "Защита ваших прав —",
        title_2_italic: "с опытом и заботой",
        description: "Дарья Богдашкина — адвокат по гражданскому праву. Решаю самые сложные дела по разводам, алиментам и разделу имущества с 2014 года.",
        cta_free: "Бесплатная консультация",
        stats: {
          practice: "лет практики",
          practice_val: "{{years}}+",
          won: "выигранных дел",
          won_val: "90%",
          response: "время ответа",
          response_val: "24ч",
          offices: "офис в Киеве",
          offices_val: "1"
        },
        badge: {
          cert: "ЗП 001001",
          since: "Адвокат с 2014 года"
        },
        scroll: "Листайте"
      },
      services: {
        tag: "Компетенции",
        title: "На чем я ",
        title_italic: "специализируюсь",
        description: "Глубокая экспертиза в гражданском праве, основанная на {{years}}-летней практике и сотнях успешных дел.",
        more: "Узнать больше",
        cta_title: "Есть вопросы?",
        cta_desc: "Опишите вашу проблему, мы поможем.",
        cta_button: "Консультация",
        items: {
          divorce: { 
            name: "Брак и развод", 
            desc: "Профессиональное сопровождение процедуры расторжения брака. Помощь в разрешении споров в судебном и внесудебном порядке.",
            details: [
              "Консультации по процедуре расторжения брака",
              "Подготовка исковых заявлений о расторжении брака",
              "Представление интересов в суде без присутствия клиента",
              "Признание брака недействительным",
              "Установление режима раздельного проживания"
            ]
          },
          alimony: { 
            name: "Алименты", 
            desc: "Защита прав ребенка и обеспечение его финансового благополучия. Взыскание и пересмотр размера выплат.",
            details: [
              "Взыскание алиментов в твердой сумме или доле от дохода",
              "Взыскание дополнительных расходов на ребенка",
              "Уменьшение или увеличение размера алиментов",
              "Взыскание алиментов на содержание одного из супругов",
              "Привлечение к ответственности за неуплату алиментов"
            ]
          },
          property: { 
            name: "Раздел имущества", 
            desc: "Справедливое распределение совместно нажитого имущества супругов, защита прав собственности на жилье и бизнес.",
            details: [
              "Раздел недвижимости (квартир, домов, земельных участков)",
              "Раздел транспортных средств и общего бизнеса",
              "Споры по разделу кредитных обязательств и долгов",
              "Признание имущества личной частной собственностью",
              "Заключение договоров о разделе имущества"
            ]
          },
          children: { 
            name: "Опека и дети", 
            desc: "Решение сложнейших вопросов воспитания и проживания детей с учетом их наилучших интересов.",
            details: [
              "Определение места жительства ребенка",
              "Установление графика общения и участия в воспитании",
              "Лишение и восстановление родительских прав",
              "Получение разрешения на выезд ребенка за границу",
              "Устранение препятствий в общении с ребенком"
            ]
          },
          inheritance: { 
            name: "Наследование", 
            desc: "Юридическая помощь в оформлении наследства и решении наследственных споров в судебном порядке.",
            details: [
              "Оформление наследства по закону и завещанию",
              "Восстановление сроков для принятия наследства",
              "Признание права собственности в порядке наследования",
              "Оспаривание завещаний в суде",
              "Определение дополнительного срока для подачи заявления о принятии наследства"
            ]
          },
          domestic_violence: { 
            name: "Домашнее насилие", 
            desc: "Срочная правовая защита пострадавших от домашнего насилия. Получение защитных предписаний.",
            details: [
              "Получение ограничительного предписания в отношении обидчика",
              "Защита интересов по делам об административных правонарушениях",
              "Представительство в полиции и правоохранительных органах",
              "Юридическое сопровождение процедуры привлечения к ответственности"
            ]
          },
          housing: { 
            name: "Жилищные споры", 
            desc: "Защита прав на пользование жильем, решение конфликтов относительно регистрации и выселения.",
            details: [
              "Выселение или вселение в жилое помещение",
              "Признание лица утратившим право пользования жильем",
              "Споры о порядке пользования жилым помещением",
              "Устранение препятствий в пользовании собственностью"
            ]
          },
          adoption: { 
            name: "Усыновление", 
            desc: "Полное сопровождение процедуры усыновления. Помощь в подготовке документов для органов опеки.",
            details: [
              "Юридические консультации по вопросам усыновления",
              "Подготовка пакета документов для подачи в суд",
              "Представительство в органах опеки и попечительства",
              "Усыновление ребенка одним из супругов (отчимом/мачехой)"
            ]
          },
          property_rights: {
            name: "Право собственности",
            desc: "Защита и оформление права собственности на недвижимость и другое ценное имущество.",
            details: [
              "Защита права собственности в судебном порядке",
              "Признание права собственности на новостройки и самовольное строительство",
              "Оформление документов на недвижимость",
              "Сопровождение сделок с недвижимостью"
            ]
          }
        }
      },
      about: {
        tag: "Обо мне",
        title: "Адвокат, которому можно доверять",
        p1: "Я — Богдашкина Дарья Александровна, адвокат с {{years}}-летним опытом в гражданском праве. Мой подход базируется не только на сухом законодательстве, но и на эмпатии.",
        p2: "Я понимаю, что гражданские споры — это всегда эмоциональное испытание. Каждый клиент получает мое личное внимание и честную оценку ситуации.",
        p3: "Я не стремлюсь взять в работу сотни дел одновременно. Моя философия — глубокое погружение в каждую отдельную историю, чтобы найти решение, максимально защищающее ваши интересы.",
        highlights: {
          licensed: { title: "Лицензированный адвокат Украины", sub: "Свидетельство ЗП 001001 от 28.02.2014" },
          offices: { title: "Офис в Киеве", sub: "ул. Бассейная 23" },
          quick: { title: "Отвечаю лично", sub: "+38 095 909 89 80 · Быстрая связь" }
        },
        cta: "Бесплатная консультация"
      },
      process: {
        tag: "Процесс",
        title_1: "Четыре шага от",
        title_2: "первого звонка до ",
        title_italic: "результата.",
        subtitle: "№ 04 · ПРОЦЕСС",
        items: [
          { id: "01", name: "Первый разговор", desc: "30 минут в Zoom или в офисе. Бесплатно. Рассказываете ситуацию — я говорю, что с ней делать." },
          { id: "02", name: "Стратегия", desc: "Письменная правовая позиция с реалистичными сценариями, сроками и бюджетом. Без сюрпризов." },
          { id: "03", name: "Документы", desc: "Готовлю иск, доказательства, ходатайства. Вы подписываете. Я подаю и веду дело дальше." },
          { id: "04", name: "Суд и исполнение", desc: "Представительство на всех заседаниях. Контроль исполнения решения до фактического результата." }
        ]
      },
      reviews: {
        tag: "Отзывы",
        title: "Что говорят ",
        title_italic: "клиенты",
        stat: "отзывов",
        items: [
          { name: "Елена Савченко", date: "Март 2024", text: "Обращалась за помощью в деле об алиментах. Результат превзошел ожидания — решение за 2 заседания. Очень благодарна за четкость и поддержку." },
          { name: "Михаил Ткаченко", date: "Декабрь 2023", text: "Развод с разделом имущества прошел гораздо спокойнее, чем я ожидал. Дарья Александровна — настоящий профессионал, знающий, как защитить интересы клиента." },
          { name: "Ирина Коваленко", date: "Август 2024", text: "Боролись за опеку над ребенком. Дарья Александровна была на связи почти 24/7. Ее уверенность в суде придавала сил мне. Результат положительный!" }
        ]
      },
      faq: {
        tag: "Частые вопросы",
        title: "Нужны ",
        title_italic: "ответы?",
        items: [
          { q: "Сколько стоит первая консультация?", a: "Первая консультация бесплатна. Во время нее мы знакомимся, я анализирую вашу ситуацию и предлагаю стратегию защиты. Никаких обязательств после первого разговора." },
          { q: "Как быстро можно назначить встречу?", a: "Как правило, встреча (офлайн или онлайн) назначается в течение 24 часов с момента обращения. В экстренных ситуациях — в течение нескольких часов." },
          { q: "Обязательно ли мое присутствие на заседаниях?", a: "В большинстве дел (развод, раздел имущества) я могу представлять ваши интересы полностью самостоятельно. Ваше присутствие не обязательно, если мы оформим соответствующее представительство." },
          { q: "Как долго длится процесс развода?", a: "Через ЗАГС — 1 месяц. Через суд — от 2 до 6 месяцев, в зависимости от наличия споров о детях или имуществе. Я всегда стараюсь максимально ускорить процесс." }
        ]
      },
      contacts: {
        tag: "Связь",
        title: "Расскажите о ",
        title_italic: "вашей ситуации",
        description: "Первая консультация бесплатна и конфиденциальна. Выберите удобный способ связи или заполните форму — я отвечу в течение 24 часов.",
        phone: "Телефон",
        telegram: "Telegram",
        email: "Email",
        facebook: "Facebook",
        form: {
          name: "Ваше имя *",
          name_placeholder: "Ярослав Мудрый",
          phone: "Номер телефона *",
          phone_placeholder: "+38 0__ ___ __ __",
          type: "Тип дела",
          type_placeholder: "Выберите категорию",
          description: "Краткое описание",
          desc_placeholder: "Опишите вашу проблему основной информацией...",
          submit: "Отправить запрос",
          agreement: "Нажимая на кнопку, вы соглашаетесь на обработку персональных данных. Конфиденциальность гарантирована.",
          required_field: "Пожалуйста, заполните это поле",
          success: "Спасибо! Ваш запрос отправлен. Я свяжусь с вами в ближайшее время.",
          captcha_label: "Проверка: {{num1}} + {{num2}} = ?",
          captcha_placeholder: "Ваш ответ",
          captcha_error: "Неверный ответ на проверку. Попробуйте еще раз.",
          bot_error: "Извините, вы похожи на бота.",
          types: {
            divorce: "Развод",
            alimony: "Алименты",
            property: "Раздел имущества",
            children: "Опека",
            custody: "Опека",
            inheritance: "Наследование",
            other: "Другое"
          }
        }
      },
      footer: {
        desc: "Профессиональная правовая защита по гражданским делам. Работаем на результат с 2014 года.",
        nav_tag: "Навигация",
        loc_tag: "Локации",
        kyiv: "Киев",
        kyiv_addr: "ул. Бассейная 23, офис 25",
        legal_tag: "Юридическая информация",
        legal_text: "Свидетельство адвоката ЗП 001001 от 28.02.2014 Выдано Советом адвокатов Запорожской области",
        rights: "Все права защищены",
        privacy: "Политика конфиденциальности",
        terms: "Условия использования"
      },
      blog: {
        tag: "Блог",
        title: "Последние ",
        title_italic: "публикации",
        read_more: "Читать далее",
        no_posts: "Публикаций пока нет.",
        back: "Назад к списку",
        admin: {
          title: "Управление блогом",
          login: "Вход для автора",
          logout: "Выйти",
          new_post: "Новая запись",
          edit: "Редактировать",
          delete: "Удалить",
          save: "Сохранить",
          cancel: "Отменить",
          publish: "Опубликовать",
          draft: "Черновик",
          fields: {
            title: "Заголовок",
            excerpt: "Краткое описание",
            content: "Содержание",
            contentType: "Тип контента",
            image: "URL изображения",
            tags: "Теги (через запятую)"
          }
        }
      },
      preloader: {
        slogan: "Ваша защита С Адвокатом",
        initials_1: "Д",
        initials_2: "Б"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;
