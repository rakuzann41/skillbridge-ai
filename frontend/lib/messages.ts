// English message keys with Kazakh and Russian translations. Product/technology names stay recognizable.
export const messages: Record<string, readonly [string, string]> = {
  "A skill mention is not proof that it is mandatory; all recognized mentions have equal weight.":
    [
      "Дағдының аталуы оның міндетті екенін дәлелдемейді. Барлық танылған дағдының салмағы бірдей.",
      "Упоминание навыка не доказывает его обязательность. Все распознанные навыки имеют одинаковый вес.",
    ],
  "Synthetic fixtures only. These counts do not describe real job-market demand.":
    [
      "Тек жасанды мысалдар қолданылған. Бұл сандар нақты еңбек нарығының сұранысын көрсетпейді.",
      "Использованы только искусственные примеры. Подсчёты не отражают реальный спрос рынка труда.",
    ],
  "These counts describe only the analyzed sample, not the entire labor market.":
    [
      "Бұл сандар бүкіл еңбек нарығына емес, тек талданған іріктемеге қатысты.",
      "Подсчёты описывают только проанализированную выборку, а не весь рынок труда.",
    ],
  "{count} vacancies have no recognized skills and remain unscored; they still count in the sample denominator.":
    [
      "{count} жұмыс орнында дағдылар танылмады және баға қойылмады. Олар іріктеменің жалпы санына кіреді.",
      "В {count} вакансиях навыки не распознаны, поэтому оценки нет. Они всё равно включены в общий размер выборки.",
    ],
  "An unsafe or malformed vacancy URL was omitted.": [
    "Қауіпсіз емес немесе қате жұмыс орны сілтемесі алынып тасталды.",
    "Небезопасная или некорректная ссылка вакансии исключена.",
  ],
  "An invalid or timezone-ambiguous publication date was omitted.": [
    "Қате немесе уақыт белдеуі белгісіз жариялау күні алынып тасталды.",
    "Некорректная дата публикации или дата без понятного часового пояса исключена.",
  ],
  "The CSV scan reached the 100-row safety limit.": [
    "CSV файлын тексеру 100 жолдық шекке жетті.",
    "Проверка CSV достигла безопасного ограничения в 100 строк.",
  ],
  "Skipped {count} malformed or duplicate CSV rows.": [
    "CSV файлындағы қате не қайталанған {count} жол өткізіліп жіберілді.",
    "Пропущено некорректных или повторяющихся строк CSV: {count}.",
  ],
  "HeadHunter title search: data analyst / аналитик данных; no experience or 1–3 years; all regions; published within 30 days. Language coverage is limited to the current skill vocabulary.":
    [
      "HeadHunter іздеуі: data analyst / аналитик данных; тәжірибесіз немесе 1–3 жыл; барлық өңір; соңғы 30 күн. Тілдік қамту қолданыстағы дағды сөздігімен шектелген.",
      "Поиск HeadHunter: data analyst / аналитик данных; без опыта или 1–3 года; все регионы; публикация за 30 дней. Языковое покрытие ограничено текущим словарём навыков.",
    ],
  "Saved source snapshot; vacancy availability may have changed. Check the original listing.":
    [
      "Дереккөздің сақталған көрінісі. Жұмыс орнының қолжетімділігі өзгеруі мүмкін. Түпнұсқаны тексеріңіз.",
      "Сохранённый снимок источника. Доступность вакансии могла измениться. Проверьте оригинал.",
    ],
  "Only {count} of up to {total} requested vacancies passed validation. No demo records were mixed in.":
    [
      "Сұралған {total} жұмыс орнының {count}-і ғана тексеруден өтті. Демо жазбалар қосылған жоқ.",
      "Из запрошенных {total} вакансий проверку прошли только {count}. Демозаписи не добавлялись.",
    ],
  "Your learning": ["Жеке оқу", "Ваш план"],
  "roadmap.": ["жоспарыңыз.", "обучения."],
  "Your learning roadmap": ["Жеке оқу жоспарыңыз", "Ваш план обучения"],
  "One focused path. A practical task at every stage.": [
    "Бір нақты бағыт. Әр кезеңде практикалық тапсырма.",
    "Один понятный путь. Практическое задание на каждом этапе.",
  ],
  "Opening your saved roadmap…": [
    "Сақталған оқу жоспары ашылуда…",
    "Открываем сохранённый план обучения…",
  ],
  "Opening your roadmap…": ["Оқу жоспары ашылуда…", "Открываем план обучения…"],
  "Creating and saving your roadmap…": [
    "Оқу жоспары жасалып, сақталуда…",
    "Создаём и сохраняем план обучения…",
  ],
  "Your roadmap is saved. You can return to it any time.": [
    "Оқу жоспары сақталды. Оған кез келген уақытта орала аласыз.",
    "План обучения сохранён. К нему можно вернуться в любое время.",
  ],
  "Saving {stage}…": ["«{stage}» сақталуда…", "Сохраняем «{stage}»…"],
  "{stage} marked incomplete. Progress saved to your account.": [
    "«{stage}» аяқталмаған деп белгіленді. Өзгеріс аккаунтыңызда сақталды.",
    "«{stage}» отмечен как незавершённый. Прогресс сохранён в аккаунте.",
  ],
  "{stage} marked complete. Progress saved to your account.": [
    "«{stage}» аяқталды деп белгіленді. Өзгеріс аккаунтыңызда сақталды.",
    "«{stage}» отмечен как завершённый. Прогресс сохранён в аккаунте.",
  ],
  "This comparison isn’t available.": [
    "Бұл салыстыру қолжетімсіз.",
    "Это сравнение недоступно.",
  ],
  "Your roadmap couldn’t be created.": [
    "Оқу жоспары жасалмады.",
    "Не удалось создать план обучения.",
  ],
  "Your roadmap couldn’t be opened.": [
    "Оқу жоспары ашылмады.",
    "Не удалось открыть план обучения.",
  ],
  "Sign in again to open your private roadmap.": [
    "Жеке оқу жоспарын ашу үшін қайта кіріңіз.",
    "Войдите ещё раз, чтобы открыть личный план обучения.",
  ],
  "Save your skills before creating a learning plan. Starting from scratch is welcome.":
    [
      "Оқу жоспарын жасамас бұрын дағдыларды сақтаңыз. Нөлден бастауға болады.",
      "Сохраните навыки перед созданием плана. Можно начать с нуля.",
    ],
  "You can create a roadmap from your saved profile, or run a new analysis first.":
    [
      "Сақталған профиль негізінде оқу жоспарын жасай аласыз немесе алдымен жаңа талдау жүргізіңіз.",
      "Можно создать план по сохранённому профилю или сначала выполнить новый анализ.",
    ],
  "The service may be temporarily unavailable. Your saved progress is kept. Please try again.":
    [
      "Қызмет уақытша қолжетімсіз болуы мүмкін. Сақталған ілгерілеуіңіз орнында. Қайталап көріңіз.",
      "Сервис может быть временно недоступен. Сохранённый прогресс остаётся. Попробуйте ещё раз.",
    ],
  "Use my saved profile": [
    "Сақталған профильді қолдану",
    "Использовать сохранённый профиль",
  ],
  "Back to analysis": ["Талдауға оралу", "Вернуться к анализу"],
  "A clear place to begin.": [
    "Бастауға арналған түсінікті жоспар.",
    "Понятная отправная точка.",
  ],
  "Six stages covering Python, SQL, spreadsheets, analysis, visualization, and a small project. Each has a practice task and reviewed learning links.":
    [
      "Python, SQL, электрондық кестелер, талдау, көрнекілеу және шағын жобаны қамтитын алты кезең. Әрқайсысында жаттығу мен тексерілген оқу сілтемелері бар.",
      "Шесть этапов: Python, SQL, таблицы, анализ, визуализация и небольшой проект. На каждом есть практическое задание и проверенные учебные ссылки.",
    ],
  "Use the skill gaps in your selected analysis to set the initial stage order.":
    [
      "Бастапқы ретті таңдалған талдаудағы дамыту қажет дағдылар бойынша анықтаңыз.",
      "Начальный порядок учитывает пробелы в выбранном анализе.",
    ],
  "Start with the foundation order and your saved skill confidence.": [
    "Негізгі рет пен сақталған дағды деңгейлерінен бастаңыз.",
    "Начните с базового порядка и сохранённой оценки навыков.",
  ],
  "Your checklist stays saved as you learn.": [
    "Оқу барысында белгіленген кезеңдер сақталады.",
    "Отметки этапов сохраняются по мере обучения.",
  ],
  "Create my roadmap": ["Оқу жоспарымды жасау", "Создать мой план обучения"],
  "Creating another analysis will keep your roadmap and completed stages.": [
    "Жаңа талдау оқу жоспарын және аяқталған кезеңдерді өзгертпейді.",
    "Новый анализ сохранит ваш план и завершённые этапы.",
  ],
  "YOUR PROGRESS": ["ІЛГЕРІЛЕУІҢІЗ", "ВАШ ПРОГРЕСС"],
  "Stages complete: {count} of {total}": [
    "Аяқталған кезең: {count} / {total}",
    "Завершено этапов: {count} из {total}",
  ],
  "Roadmap completion": [
    "Оқу жоспарының орындалуы",
    "Выполнение плана обучения",
  ],
  "Next incomplete stage": [
    "Келесі аяқталмаған кезең",
    "Следующий незавершённый этап",
  ],
  "All stages marked complete. Keep practicing, or uncheck a stage whenever you want to revisit it.":
    [
      "Барлық кезең аяқталды деп белгіленген. Жаттығуды жалғастырыңыз немесе қайталағыңыз келген кезеңнің белгісін алып тастаңыз.",
      "Все этапы отмечены как завершённые. Продолжайте практику или снимите отметку с этапа, к которому хотите вернуться.",
    ],
  "Initial order based on your": [
    "Бастапқы рет негізделген талдау:",
    "Начальный порядок основан на вашем анализе:",
  ],
  " from {date}": [" · {date}", " от {date}"],
  ". Python stays before pandas; the project comes last.": [
    ". Python — pandas-тан бұрын, жоба — соңғы кезеңде.",
    ". Python идёт перед pandas, проект — последним.",
  ],
  "A foundation order based on your saved profile at creation time.": [
    "Жоспар жасалған кездегі сақталған профильге негізделген негізгі рет.",
    "Базовый порядок на основе сохранённого профиля на момент создания.",
  ],
  "Completion is self-reported. Check a stage when you finish its practice task; uncheck it to undo.":
    [
      "Аяқталғанын өзіңіз белгілейсіз. Жаттығуды орындаған соң белгі қойыңыз; кері қайтару үшін белгіні алып тастаңыз.",
      "Завершение вы отмечаете сами. Поставьте отметку после выполнения задания; снимите её, чтобы отменить.",
    ],
  "Progress is saved to your account after each change.": [
    "Әр өзгерістен кейін ілгерілеу аккаунтыңызда сақталады.",
    "Прогресс сохраняется в аккаунте после каждого изменения.",
  ],
  "We couldn’t confirm that change. Reload your progress to see the latest saved state before making another change.":
    [
      "Өзгерістің сақталғанын растау мүмкін болмады. Келесі өзгерістен бұрын соңғы сақталған күйді қайта жүктеңіз.",
      "Не удалось подтвердить сохранение изменения. Перед следующим действием загрузите последний сохранённый прогресс.",
    ],
  "Reload progress": ["Ілгерілеуді қайта жүктеу", "Перезагрузить прогресс"],
  "Learning stages": ["Оқу кезеңдері", "Этапы обучения"],
  STAGE: ["КЕЗЕҢ", "ЭТАП"],
  Complete: ["Аяқталды", "Завершён"],
  "To do": ["Алда", "Предстоит"],
  "Practice focus": ["Жаттығу бағыты", "На чём сосредоточиться"],
  "· based on your starting confidence": [
    "· бастапқы деңгейіңізге сүйеніп",
    "· с учётом исходного уровня",
  ],
  "Try it yourself": ["Өзіңіз орындап көріңіз", "Попробуйте самостоятельно"],
  "Learning links for {stage}": [
    "«{stage}» кезеңіне арналған оқу сілтемелері",
    "Учебные ссылки для этапа «{stage}»",
  ],
  "Your stage order and starting confidence are kept with this plan. New analyses and profile edits won’t reset your progress.":
    [
      "Бұл жоспарда кезең реті мен бастапқы деңгей сақталады. Жаңа талдаулар мен профиль өзгерістері ілгерілеуді өшірмейді.",
      "План хранит порядок этапов и исходный уровень. Новые анализы и изменения профиля не сбросят прогресс.",
    ],
  "Compare my skills again": [
    "Дағдыларды қайта салыстыру",
    "Сравнить навыки ещё раз",
  ],
  "Try opening the page again to restore your saved progress.": [
    "Сақталған ілгерілеуді көру үшін бетті қайта ашып көріңіз.",
    "Попробуйте открыть страницу ещё раз, чтобы загрузить сохранённый прогресс.",
  ],
  "Learning resources may be in another language.": [
    "Оқу материалдары басқа тілде болуы мүмкін.",
    "Учебные материалы могут быть на другом языке.",
  ],
  "Python fundamentals": ["Python негіздері", "Основы Python"],
  "Build a foundation": ["Негіз қалыптастырыңыз", "Создайте основу"],
  "Variables, functions, and working with data.": [
    "Айнымалылар, функциялар және деректермен жұмыс.",
    "Переменные, функции и работа с данными.",
  ],
  "SQL & relational databases": [
    "SQL және реляциялық дерекқорлар",
    "SQL и реляционные базы данных",
  ],
  "SQL and relational databases": [
    "SQL және реляциялық дерекқорлар",
    "SQL и реляционные базы данных",
  ],
  "Ask better questions": [
    "Нақты сұрақтар қойыңыз",
    "Задавайте точные вопросы",
  ],
  "Query, join, and summarize structured data.": [
    "Құрылымды деректерді сұраңыз, біріктіріңіз және қорытындылаңыз.",
    "Запрашивайте, объединяйте и обобщайте структурированные данные.",
  ],
  "Excel & data cleaning": [
    "Excel және деректерді тазалау",
    "Excel и очистка данных",
  ],
  "Excel and data cleaning": [
    "Excel және деректерді тазалау",
    "Excel и очистка данных",
  ],
  "Make data usable": [
    "Деректерді жұмысқа дайындаңыз",
    "Подготовьте данные к работе",
  ],
  "Organize messy data and work with spreadsheets.": [
    "Ретсіз деректерді реттеп, электрондық кестелермен жұмыс істеңіз.",
    "Приводите данные в порядок и работайте с таблицами.",
  ],
  "pandas & exploration": [
    "pandas және деректерді зерттеу",
    "pandas и исследование данных",
  ],
  "pandas and exploratory analysis": [
    "pandas және зерттеу талдауы",
    "pandas и исследовательский анализ",
  ],
  "Find the story": [
    "Деректердегі байланысты табыңыз",
    "Найдите смысл в данных",
  ],
  "Explore datasets and investigate patterns.": [
    "Деректер жиындарын зерттеп, заңдылықтарды табыңыз.",
    "Исследуйте наборы данных и находите закономерности.",
  ],
  "Visualization & Power BI": [
    "Көрнекілеу және Power BI",
    "Визуализация и Power BI",
  ],
  "Data visualization and Power BI": [
    "Деректерді көрнекілеу және Power BI",
    "Визуализация данных и Power BI",
  ],
  "Communicate clearly": [
    "Нәтижені түсінікті жеткізіңіз",
    "Объясняйте понятно",
  ],
  "Turn your findings into useful visual explanations.": [
    "Қорытындыларды пайдалы көрнекі түсіндірмеге айналдырыңыз.",
    "Представляйте выводы в виде полезных наглядных объяснений.",
  ],
  "A portfolio analysis": [
    "Портфолиоға арналған талдау",
    "Анализ для портфолио",
  ],
  "A small portfolio analysis": [
    "Портфолиоға арналған шағын талдау",
    "Небольшой анализ для портфолио",
  ],
  "Put it into practice": ["Іс жүзінде қолданыңыз", "Примените на практике"],
  "Bring your skills together in one small project.": [
    "Дағдыларыңызды бір шағын жобада біріктіріңіз.",
    "Объедините навыки в небольшом проекте.",
  ],
  "Work with variables, lists, loops, and small functions. Practice reading a simple data file.":
    [
      "Айнымалылар, тізімдер, циклдер және шағын функциялармен жұмыс істеңіз. Қарапайым дерек файлын оқып көріңіз.",
      "Освойте переменные, списки, циклы и небольшие функции. Попрактикуйтесь в чтении простого файла данных.",
    ],
  "Write a short script that reads records and summarizes a few values.": [
    "Жазбаларды оқып, бірнеше мәнді қорытындылайтын қысқа скрипт жазыңыз.",
    "Напишите короткий скрипт, который читает записи и обобщает несколько значений.",
  ],
  "Python tutorial": ["Python оқулығы", "Учебник Python"],
  "Official guide. Some basic programming knowledge is helpful.": [
    "Ресми нұсқаулық. Бағдарламалаудың бастапқы білімі болғаны пайдалы.",
    "Официальное руководство. Полезны начальные знания программирования.",
  ],
  "Practice filtering, joins, and grouped summaries. Learn how tables connect through keys.":
    [
      "Сүзу, кестелерді біріктіру және топтық қорытынды жасауды үйреніңіз. Кестелердің кілт арқылы байланысын түсініңіз.",
      "Практикуйте фильтрацию, соединения и группировку. Изучите связи таблиц через ключи.",
    ],
  "Join two tables and answer a question with a grouped SQL query.": [
    "Екі кестені біріктіріп, топтастырылған SQL сұрауы арқылы бір сұраққа жауап беріңіз.",
    "Объедините две таблицы и ответьте на вопрос SQL-запросом с группировкой.",
  ],
  "SQLBolt interactive lessons": [
    "SQLBolt интерактивті сабақтары",
    "Интерактивные уроки SQLBolt",
  ],
  "Browser exercises covering queries, joins, and aggregates.": [
    "Сұрау, біріктіру және жинақтауға арналған браузердегі жаттығулар.",
    "Упражнения в браузере по запросам, соединениям и агрегациям.",
  ],
  "Organize a table, handle missing values and duplicates, and use formulas or a pivot table to summarize it.":
    [
      "Кестені реттеп, жоқ мәндер мен қайталанған жазбаларды өңдеңіз. Формула не жиынтық кесте арқылы қорытынды жасаңыз.",
      "Упорядочьте таблицу, обработайте пропуски и дубликаты. Подведите итоги с помощью формул или сводной таблицы.",
    ],
  "Create a tidy spreadsheet and document the cleaning decisions you made.": [
    "Реттелген электрондық кесте жасап, тазалау кезінде қабылдаған шешімдерді жазыңыз.",
    "Создайте аккуратную таблицу и опишите решения, принятые при очистке.",
  ],
  "Excel help and learning": [
    "Excel анықтамасы және оқу материалдары",
    "Справка и обучение Excel",
  ],
  "Microsoft guides for formulas, tables, and data analysis. Software availability varies.":
    [
      "Microsoft ұсынған формула, кесте және деректерді талдау нұсқаулықтары. Бағдарламаның қолжетімділігі әртүрлі болуы мүмкін.",
      "Руководства Microsoft по формулам, таблицам и анализу. Доступность программного обеспечения различается.",
    ],
  "Load a table, inspect types and missing values, and explore distributions and grouped summaries.":
    [
      "Кестені жүктеп, дерек түрлері мен жоқ мәндерді тексеріңіз. Үлестірімдер мен топтық қорытындыларды зерттеңіз.",
      "Загрузите таблицу, проверьте типы и пропуски, изучите распределения и групповые сводки.",
    ],
  "Create a notebook with a cleaned dataset and three evidence-based observations.":
    [
      "Тазаланған деректер мен дәлелге сүйенген үш байқауы бар ноутбук жасаңыз.",
      "Создайте ноутбук с очищенными данными и тремя наблюдениями, подтверждёнными данными.",
    ],
  "pandas getting started": [
    "pandas-пен жұмысты бастау",
    "Начало работы с pandas",
  ],
  "Official introductions and practical tutorials. Use after Python fundamentals.":
    [
      "Ресми кіріспе және практикалық сабақтар. Python негіздерінен кейін қолданыңыз.",
      "Официальные вводные материалы и практические уроки. Изучайте после основ Python.",
    ],
  "Choose charts that answer a clear question. Keep titles, labels, and comparisons easy to read.":
    [
      "Нақты сұраққа жауап беретін диаграммаларды таңдаңыз. Атау, белгі және салыстырулар оқуға жеңіл болсын.",
      "Выбирайте графики, отвечающие на конкретный вопрос. Делайте заголовки, подписи и сравнения понятными.",
    ],
  "Build a small report with two useful charts and a concise explanation of what they show.":
    [
      "Екі пайдалы диаграмма мен олардың қысқаша түсіндірмесі бар шағын есеп жасаңыз.",
      "Создайте небольшой отчёт с двумя полезными графиками и кратким объяснением выводов.",
    ],
  "Microsoft Learn for Power BI": [
    "Power BI бойынша Microsoft Learn",
    "Microsoft Learn по Power BI",
  ],
  "Official learning paths. You can practice the chart principles with a spreadsheet too.":
    [
      "Ресми оқу бағыттары. Диаграмма құру қағидаларын электрондық кестеде де жаттықтыруға болады.",
      "Официальные учебные программы. Принципы построения графиков можно практиковать и в электронных таблицах.",
    ],
  "Choose a dataset and a focused question. Bring together cleaning, queries, analysis, and a readable explanation.":
    [
      "Деректер жиыны мен нақты сұрақ таңдаңыз. Тазалау, сұрау, талдау және түсінікті түсіндірмені біріктіріңіз.",
      "Выберите набор данных и конкретный вопрос. Объедините очистку, запросы, анализ и понятное объяснение.",
    ],
  "Finish a small analysis with the source, methods, limitations, and findings documented. Keep a simple version history.":
    [
      "Дереккөз, әдістер, шектеулер және қорытындылар жазылған шағын талдауды аяқтаңыз. Нұсқалардың қарапайым тарихын сақтаңыз.",
      "Завершите небольшой анализ с описанием источника, методов, ограничений и выводов. Ведите простую историю версий.",
    ],
  "Kaggle datasets": ["Kaggle деректер жиындары", "Наборы данных Kaggle"],
  "Choose a manageable dataset and check its license. Some downloads require an account.":
    [
      "Шағын деректер жиынын таңдап, лицензиясын тексеріңіз. Кейбір жүктеулерге аккаунт қажет.",
      "Выберите небольшой набор данных и проверьте лицензию. Для некоторых загрузок нужен аккаунт.",
    ],
  "pandas tutorial examples": [
    "pandas сабақтарының мысалдары",
    "Примеры из учебника pandas",
  ],
  "Use the tutorial data if you prefer to begin with a small example.": [
    "Шағын мысалдан бастағыңыз келсе, сабақтағы деректерді қолданыңыз.",
    "Используйте учебные данные, если хотите начать с небольшого примера.",
  ],
  "TRANSPARENT BY DESIGN": ["ТҮСІНІКТІ ЕСЕП", "ПОНЯТНЫЙ РАСЧЁТ"],
  "A score you can trace.": [
    "Есептелуі түсінікті баға.",
    "Оценка с понятным расчётом.",
  ],
  "Each comparison uses the confidence levels you saved and the distinct skills recognized in a vacancy. Every recognized skill has the same weight.":
    [
      "Әр салыстыру сақталған деңгейлер мен жұмыс орнында танылған бірегей дағдыларды қолданады. Барлық танылған дағдының салмағы бірдей.",
      "Сравнение использует сохранённый уровень и уникальные распознанные навыки вакансии. Все навыки имеют одинаковый вес.",
    ],
  "Not yet or unlisted": [
    "Әлі үйренілмеген не көрсетілмеген",
    "Пока не изучен или не указан",
  ],
  "SKILL OVERLAP": ["ДАҒДЫЛАР СӘЙКЕСТІГІ", "СОВПАДЕНИЕ НАВЫКОВ"],
  "Earned credits ÷ recognized vacancy skills × 100": [
    "Жиналған ұпай ÷ жұмыс орнында танылған дағдылар саны × 100",
    "Набранные баллы ÷ число распознанных навыков вакансии × 100",
  ],
  "The result is rounded to one decimal. Self-reported confidence is a starting point for learning; this weighting is a transparent heuristic, not a verified measure of ability or a hiring probability. A vacancy with no recognized skills stays unscored.":
    [
      "Нәтиже ондық үлеске дейін дөңгелектенеді. Өзіңіз бағалаған деңгей оқу бағытын таңдауға көмектеседі. Бұл есеп қабілетті растамайды және жұмысқа қабылдану ықтималдығын көрсетпейді. Дағдылар танылмаса, баға қойылмайды.",
      "Результат округляется до десятых. Ваша оценка уровня помогает выбрать направление обучения. Этот расчёт не подтверждает способности и не предсказывает трудоустройство. Без распознанных навыков оценка не ставится.",
    ],
  "How priorities are ordered": [
    "Басымдықтар қалай реттеледі",
    "Как упорядочены приоритеты",
  ],
  "Skills to learn are ordered by their frequency in this sample. Each skill counts once per vacancy. All {total} records, including {unscored} unscored records, are included in the denominator.":
    [
      "Үйренетін дағдылар осы іріктемедегі жиілігі бойынша реттеледі. Әр дағды бір жұмыс орнында бір рет саналады. Есепке барлық {total} жазба, соның ішінде бағаланбаған {unscored} жазба кіреді.",
      "Навыки для изучения упорядочены по частоте в выборке. Каждый навык учитывается один раз на вакансию. В знаменатель входят все {total} записей, включая {unscored} записей без оценки.",
    ],
  "Where the skills come from": [
    "Дағдылар қайдан алынады",
    "Откуда берутся навыки",
  ],
  "Structured tags take precedence. Conservative whole-word aliases supplement vacancy descriptions. Obvious negative clauses are skipped, and related skills are not added automatically. A mention does not prove a skill is mandatory; this analysis does not weight required and preferred skills differently.":
    [
      "Алдымен дайын дағдылар тізімі қолданылады. Сипаттамадан белгілі атаулар сақтықпен, тұтас сөз ретінде ізделеді. Айқын терістеулер өткізіледі, байланысты дағдылар автоматты қосылмайды. Дағдының аталуы оның міндетті екенін дәлелдемейді; міндетті және қосымша дағдыларға бөлек салмақ берілмейді.",
      "Сначала используется готовый список навыков. Затем описание осторожно проверяется по известным названиям целых слов. Явные отрицания пропускаются, связанные навыки автоматически не добавляются. Упоминание не доказывает обязательность: обязательные и желательные навыки не получают разный вес.",
    ],
  "View all skill counts": [
    "Барлық дағды санын көру",
    "Посмотреть все подсчёты навыков",
  ],
  "Skill counts across {count} vacancies and your saved confidence": [
    "{count} жұмыс орны бойынша дағды саны және сақталған деңгейіңіз",
    "Подсчёты навыков по {count} вакансиям и сохранённый уровень",
  ],
  Skill: ["Дағды", "Навык"],
  "In this sample": ["Осы іріктемеде", "В этой выборке"],
  "Your confidence": ["Өз бағалауыңыз", "Ваша оценка уровня"],
  "Data source and calculation details": [
    "Дереккөз және есеп мәліметтері",
    "Источник данных и детали расчёта",
  ],
  "Fictional vacancy examples. Counts describe only this sample and do not represent real labor-market demand.":
    [
      "Ойдан жасалған жұмыс орны мысалдары. Сандар тек осы іріктемені сипаттайды және нақты еңбек нарығының сұранысын көрсетпейді.",
      "Вымышленные примеры вакансий. Подсчёты относятся только к выборке и не отражают реальный спрос рынка труда.",
    ],
  "A saved snapshot of the fetched sample, not the entire job market. Original vacancy availability may have changed.":
    [
      "Бұл бүкіл еңбек нарығы емес, жүктелген іріктеменің сақталған көрінісі. Жұмыс орындарының қолжетімділігі өзгеруі мүмкін.",
      "Сохранённый снимок загруженной выборки, а не всего рынка труда. Доступность вакансий могла измениться.",
    ],
  "Scoring:": ["Бағалау:", "Оценка:"],
  "Extraction:": ["Дағдыны анықтау:", "Распознавание навыков:"],
  "Dataset:": ["Деректер жиыны:", "Набор данных:"],
  "Source fingerprint:": [
    "Дереккөздің бақылау хэші:",
    "Контрольный хеш источника:",
  ],
  "Checking your account…": ["Аккаунт тексерілуде…", "Проверяем аккаунт…"],
  "Comparing your skills…": ["Дағдылар салыстырылуда…", "Сравниваем навыки…"],
  "Opening your saved results…": [
    "Сақталған нәтижелер ашылуда…",
    "Открываем сохранённые результаты…",
  ],
  "Loading analysis": ["Талдау жүктелуде", "Загрузка анализа"],
  "We’re comparing the sample and saving your results.": [
    "Іріктемені салыстырып, нәтижелерді сақтап жатырмыз.",
    "Сравниваем выборку и сохраняем результаты.",
  ],
  "Your comparison will appear here once it’s ready.": [
    "Салыстыру дайын болғанда осы жерде көрсетіледі.",
    "Сравнение появится здесь, когда будет готово.",
  ],
  "Reconnecting…": ["Қайта қосылуда…", "Повторное подключение…"],
  "Use Demo CSV instead": ["Демо CSV қолдану", "Использовать демо CSV"],
  "Back to my profile": ["Профильге оралу", "Вернуться в профиль"],
  "Show all": ["Барлығын көрсету", "Показать всё"],
  "Try again": ["Қайталау", "Попробовать ещё раз"],
  "Sign in again": ["Қайта кіру", "Войти ещё раз"],
  "Let’s reconnect your account.": [
    "Аккаунтқа қайта қосылайық.",
    "Войдём в аккаунт ещё раз.",
  ],
  "Your session needs to be renewed before you can open private results.": [
    "Жеке нәтижелерді ашу үшін сессияны жаңарту қажет.",
    "Для просмотра личных результатов нужно обновить сессию.",
  ],
  "We couldn’t find this analysis.": [
    "Бұл талдау табылмады.",
    "Не удалось найти этот анализ.",
  ],
  "This link isn’t available in your account. You can start a new comparison with your saved skills.":
    [
      "Бұл сілтеме аккаунтыңызда қолжетімсіз. Сақталған дағдыларыңызбен жаңа салыстыру бастауға болады.",
      "Ссылка недоступна в вашем аккаунте. Можно запустить новое сравнение с сохранёнными навыками.",
    ],
  "Start a new analysis": ["Жаңа талдау бастау", "Начать новый анализ"],
  "Save your starting point first.": [
    "Алдымен бастапқы деңгейіңізді сақтаңыз.",
    "Сначала сохраните свой уровень.",
  ],
  "Review and save your profile before comparing it with vacancies. It’s fine to mark every skill Not yet.":
    [
      "Салыстырудан бұрын профильді тексеріп, сақтаңыз. Барлық дағдыны «Әлі үйренбедім» деп белгілеуге болады.",
      "Перед сравнением проверьте и сохраните профиль. Можно отметить все навыки как «Пока не изучал(а)».",
    ],
  "Review my profile": ["Профильді тексеру", "Проверить профиль"],
  "It’s time for a fresh comparison.": [
    "Жаңа салыстыру жасау қажет.",
    "Пора сделать новое сравнение.",
  ],
  "The source data or scoring method has changed. Your saved inputs are intact; a new analysis will use the current version.":
    [
      "Бастапқы деректер немесе бағалау әдісі өзгерді. Сақталған мәліметтеріңіз орнында. Жаңа талдау қазіргі нұсқаны қолданады.",
      "Источник данных или метод оценки изменился. Ваши сохранённые данные целы. Новый анализ использует текущую версию.",
    ],
  "The comparison couldn’t be completed.": [
    "Салыстыру аяқталмады.",
    "Не удалось завершить сравнение.",
  ],
  "Your results couldn’t be loaded.": [
    "Нәтижелер жүктелмеді.",
    "Не удалось загрузить результаты.",
  ],
  "The connection or service may be temporarily unavailable. Your saved profile is unchanged. Please try again.":
    [
      "Байланыс не қызмет уақытша қолжетімсіз болуы мүмкін. Сақталған профиль өзгерген жоқ. Қайталап көріңіз.",
      "Подключение или сервис могут быть временно недоступны. Сохранённый профиль не изменён. Попробуйте ещё раз.",
    ],
  "Live vacancies aren’t available right now.": [
    "Нақты жұмыс орындары қазір қолжетімсіз.",
    "Сейчас реальные вакансии недоступны.",
  ],
  "Try live jobs again": [
    "Нақты жұмыс орындарын қайта жүктеу",
    "Повторить загрузку реальных вакансий",
  ],
  "HeadHunter access is awaiting application setup. You can compare your skills using the clearly labeled Demo CSV sample.":
    [
      "HeadHunter қосылымы әлі бапталмаған. Дағдыларыңызды демо деп белгіленген CSV іріктемесімен салыстыра аласыз.",
      "Подключение HeadHunter ещё не настроено. Можно сравнить навыки с явно обозначенной демовыборкой CSV.",
    ],
  "HeadHunter did not allow this request. Try later or use Demo CSV. We won’t bypass its access checks.":
    [
      "HeadHunter бұл сұрауға рұқсат бермеді. Кейін қайталаңыз немесе демо CSV қолданыңыз. Қолжетімділік шектеулері сақталады.",
      "HeadHunter отклонил запрос. Попробуйте позже или используйте демо CSV. Ограничения доступа соблюдаются.",
    ],
  "HeadHunter has limited requests. Wait before retrying, or use Demo CSV.": [
    "HeadHunter сұрауларды шектеді. Қайталаудан бұрын күтіңіз немесе демо CSV қолданыңыз.",
    "HeadHunter ограничил запросы. Подождите перед повтором или используйте демо CSV.",
  ],
  "No usable junior Data Analyst vacancies were found in this bounded search. Try later or use Demo CSV.":
    [
      "Бұл шағын іздеуде жарамды бастапқы деңгейдегі талдаушы жұмыс орындары табылмады. Кейін қайталаңыз немесе демо CSV қолданыңыз.",
      "В этом ограниченном поиске не найдено подходящих вакансий начинающего аналитика. Попробуйте позже или используйте демо CSV.",
    ],
  "Another vacancy collection is running. Try again shortly or use Demo CSV.": [
    "Жұмыс орындарын жинау орындалып жатыр. Біраздан соң қайталаңыз немесе демо CSV қолданыңыз.",
    "Сбор вакансий уже выполняется. Повторите чуть позже или используйте демо CSV.",
  ],
  "HeadHunter did not respond in time. Try later or use Demo CSV.": [
    "HeadHunter уақытында жауап бермеді. Кейін қайталаңыз немесе демо CSV қолданыңыз.",
    "HeadHunter не ответил вовремя. Попробуйте позже или используйте демо CSV.",
  ],
  "The vacancy source returned data we couldn’t safely analyze. Try later or use Demo CSV.":
    [
      "Дереккөзден келген мәліметті қауіпсіз талдау мүмкін болмады. Кейін қайталаңыз немесе демо CSV қолданыңыз.",
      "Данные источника нельзя безопасно проанализировать. Попробуйте позже или используйте демо CSV.",
    ],
  "HeadHunter is temporarily unavailable. Try later or use Demo CSV.": [
    "HeadHunter уақытша қолжетімсіз. Кейін қайталаңыз немесе демо CSV қолданыңыз.",
    "HeadHunter временно недоступен. Попробуйте позже или используйте демо CSV.",
  ],
  "Couldn’t renew your session. Please try again.": [
    "Сессияны жаңарту мүмкін болмады. Қайталап көріңіз.",
    "Не удалось обновить сессию. Попробуйте ещё раз.",
  ],
  "This page couldn’t be opened.": [
    "Бет ашылмады.",
    "Не удалось открыть страницу.",
  ],
  "Something interrupted the page. Please try again to reopen your results.": [
    "Беттің жұмысы үзілді. Нәтижелерді қайта ашып көріңіз.",
    "Работа страницы прервалась. Попробуйте открыть результаты ещё раз.",
  ],
  "Please sign in again to access your account.": [
    "Аккаунтқа кіру үшін қайта кіріңіз.",
    "Для доступа к аккаунту войдите ещё раз.",
  ],
  "Cannot reach the service. Check your connection and try again.": [
    "Қызметке қосылу мүмкін болмады. Интернетті тексеріп, қайталаңыз.",
    "Не удаётся связаться с сервисом. Проверьте подключение и повторите.",
  ],
  "Live vacancies are unavailable. You can use Demo CSV instead.": [
    "Нақты жұмыс орындары қолжетімсіз. Демо CSV қолдануға болады.",
    "Реальные вакансии недоступны. Можно использовать демо CSV.",
  ],
  "The request could not be completed. Please try again.": [
    "Сұрау орындалмады. Қайталап көріңіз.",
    "Не удалось выполнить запрос. Попробуйте ещё раз.",
  ],
  "Your session has expired. Sign out, then sign in again.": [
    "Сессияның мерзімі аяқталды. Аккаунттан шығып, қайта кіріңіз.",
    "Сессия истекла. Выйдите и войдите снова.",
  ],
  "Check your inputs, then try again.": [
    "Енгізілген мәліметтерді тексеріп, қайталаңыз.",
    "Проверьте введённые данные и повторите.",
  ],
  "This record was not found in your account.": [
    "Бұл жазба аккаунтыңызда табылмады.",
    "Эта запись не найдена в вашем аккаунте.",
  ],
  "Save your profile before starting an analysis. All skills may be marked Not yet.":
    [
      "Талдаудан бұрын профильді сақтаңыз. Барлық дағдыны «Әлі үйренбедім» деп белгілеуге болады.",
      "Сохраните профиль перед анализом. Все навыки можно отметить как «Пока не изучал(а)».",
    ],
  "This analysis uses an older data or scoring version. Start a new analysis to continue.":
    [
      "Бұл талдауда деректердің не бағалаудың ескі нұсқасы қолданылған. Жалғастыру үшін жаңа талдау бастаңыз.",
      "Анализ использует старую версию данных или оценки. Начните новый анализ.",
    ],
  "The service is temporarily unavailable. Please try again shortly.": [
    "Қызмет уақытша қолжетімсіз. Біраздан соң қайталаңыз.",
    "Сервис временно недоступен. Повторите чуть позже.",
  ],
  "The service returned an unreadable response. Please try again.": [
    "Қызметтің жауабын оқу мүмкін болмады. Қайталап көріңіз.",
    "Не удалось прочитать ответ сервиса. Попробуйте ещё раз.",
  ],
  "Your skills,": ["Дағдыларыңыз", "Ваши навыки"],
  "in context.": ["жұмыс талаптары аясында.", "в контексте требований."],
  "A clearer view of what you know and what to learn next.": [
    "Білетініңізді және әрі қарай не үйрену керегін анықтаңыз.",
    "Узнайте, что вы уже знаете и чему учиться дальше.",
  ],
  "Edit my skills": ["Дағдыларды өзгерту", "Изменить навыки"],
  "Find your next learning priority.": [
    "Келесі оқу басымдығын анықтаңыз.",
    "Определите следующий приоритет в обучении.",
  ],
  "Compare your saved skills with up to eight vacancies. See your gaps, explore each match, and trace the calculation.":
    [
      "Сақталған дағдыларыңызды сегізге дейінгі жұмыс орнымен салыстырыңыз. Дамыту қажет тұстарды және әр сәйкестік есебін қараңыз.",
      "Сравните сохранённые навыки с восемью или менее вакансиями. Изучите пробелы, совпадения и расчёт оценки.",
    ],
  "Vacancy source": ["Жұмыс орындарының дереккөзі", "Источник вакансий"],
  "HeadHunter API": ["HeadHunter API", "HeadHunter API"],
  "HeadHunter API:": ["HeadHunter API:", "HeadHunter API:"],
  "HeadHunter analysis": ["HeadHunter талдауы", "Анализ HeadHunter"],
  HeadHunter: ["HeadHunter", "HeadHunter"],
  "Demo CSV": ["Демо CSV", "Демо CSV"],
  "Demo CSV:": ["Демо CSV:", "Демо CSV:"],
  "Demo CSV analysis": ["Демо CSV талдауы", "Анализ демо CSV"],
  "Fictional Junior Data Analyst vacancies, with repeatable results.": [
    "Қайта есептеуге болатын, ойдан жасалған жұмыс орны мысалдары.",
    "Вымышленные вакансии начинающего аналитика данных с воспроизводимыми результатами.",
  ],
  "Data Analyst titles · no experience or 1–3 years · all regions · published within 30 days. Availability is checked when fetched.":
    [
      "Деректер талдаушысы · тәжірибесіз немесе 1–3 жыл · барлық өңір · соңғы 30 күн. Қолжетімділігі жүктеу кезінде тексеріледі.",
      "Аналитик данных · без опыта или 1–3 года · все регионы · публикация за 30 дней. Доступность проверяется при загрузке.",
    ],
  "I have read and accept HeadHunter’s": [
    "HeadHunter құжатын оқып, қабылдаймын:",
    "Я ознакомился(-ась) и согласен(-на) с документом HeadHunter:",
  ],
  "Analyze vacancies": ["Жұмыс орындарын талдау", "Проанализировать вакансии"],
  "Save any profile edits first. Your comparison will be saved to your account.":
    [
      "Алдымен профиль өзгерістерін сақтаңыз. Салыстыру аккаунтыңызда сақталады.",
      "Сначала сохраните изменения профиля. Сравнение будет сохранено в вашем аккаунте.",
    ],
  "Skill analysis": ["Дағдыларды талдау", "Анализ навыков"],
  "Your results": ["Нәтижелеріңіз", "Ваши результаты"],
  "Your next step,": ["Келесі қадамыңыз", "Ваш следующий шаг"],
  "a little clearer.": ["айқындала түсті.", "стал понятнее."],
  "See what you bring, where to focus, and how each vacancy compares.": [
    "Күшті тұстарыңызды, дамыту бағытын және әр жұмыс орнына сәйкестікті қараңыз.",
    "Посмотрите на свои сильные стороны, приоритеты и соответствие каждой вакансии.",
  ],
  "Vacancies: {count} · Scored: {scored}": [
    "Жұмыс орны: {count} · Бағаланғаны: {scored}",
    "Вакансий: {count} · С оценкой: {scored}",
  ],
  Analyzed: ["Талдау уақыты:", "Дата анализа:"],
  Fetched: ["Жүктеу уақыты:", "Загружено:"],
  "Saved to your account": ["Аккаунтыңызда сақталған", "Сохранено в аккаунте"],
  "Fictional vacancy sample for exploring your skills. Counts describe this sample only.":
    [
      "Дағдыларды зерттеуге арналған ойдан жасалған жұмыс орындары. Сандар тек осы іріктемеге қатысты.",
      "Вымышленная выборка вакансий для изучения навыков. Подсчёты относятся только к этой выборке.",
    ],
  "Saved HeadHunter vacancy sample. Counts describe this search only; availability may have changed. Check the original listing.":
    [
      "HeadHunter жұмыс орындарының сақталған іріктемесі. Сандар тек осы іздеуге қатысты. Қолжетімділік өзгеруі мүмкін, түпнұсқаны тексеріңіз.",
      "Сохранённая выборка HeadHunter. Подсчёты относятся только к этому поиску. Доступность могла измениться — проверьте оригинал.",
    ],
  "Skill gaps": ["Дамыту қажет дағдылар", "Пробелы в навыках"],
  "Job matches": ["Жұмыс орындарына сәйкестік", "Соответствие вакансиям"],
  "Analysis results": ["Талдау нәтижелері", "Результаты анализа"],
  "No vacancy records to compare.": [
    "Салыстыруға жұмыс орындары жоқ.",
    "Нет вакансий для сравнения.",
  ],
  "Start a new analysis to look for an available sample.": [
    "Қолжетімді іріктемені табу үшін жаңа талдау бастаңыз.",
    "Запустите новый анализ, чтобы получить доступную выборку.",
  ],
  "This result uses the skills saved at analysis time. Profile edits apply to your next comparison.":
    [
      "Нәтиже талдау кезіндегі сақталған дағдыларға негізделген. Профиль өзгерістері келесі салыстыруда қолданылады.",
      "Результат использует навыки, сохранённые на момент анализа. Изменения профиля учитываются в следующем сравнении.",
    ],
  "New analysis": ["Жаңа талдау", "Новый анализ"],
  "Open my roadmap": ["Оқу жоспарымды ашу", "Открыть мой план обучения"],
  "A PRACTICAL PLACE TO FOCUS": [
    "НАЗАР АУДАРАТЫН НАҚТЫ БАҒЫТ",
    "ПРАКТИЧНЫЙ ПРИОРИТЕТ",
  ],
  "Practice {skill}": [
    "{skill}: жаттығуға көңіл бөліңіз",
    "Практикуйте: {skill}",
  ],
  "{skill} appears in {count} of {total} vacancies in this sample.": [
    "{skill} осы іріктемедегі {total} жұмыс орнының {count}-інде кездеседі.",
    "{skill} встречается в {count} из {total} вакансий этой выборки.",
  ],
  "You’re already learning it—give it some focused practice.": [
    "Бұл дағдыны үйреніп жүрсіз. Оны мақсатты жаттығумен бекітіңіз.",
    "Вы уже изучаете этот навык — уделите ему целенаправленную практику.",
  ],
  "You marked it Not yet, so it’s a useful gap to explore.": [
    "Бұл дағдыны әлі үйренбегеніңізді белгіледіңіз. Оны зерттеп көруге болады.",
    "Вы отметили, что пока не изучали этот навык. На него стоит обратить внимание.",
  ],
  "Highest-frequency gap in this sample · self-reported confidence": [
    "Осы іріктемеде ең жиі кездесетін жетіспейтін дағды · өз бағалауыңыз бойынша",
    "Самый частый пробел в этой выборке · по вашей оценке уровня",
  ],
  "More detail is needed.": ["Қосымша мәлімет қажет.", "Нужно больше данных."],
  "You marked every recognized skill in this sample Comfortable. Review the job explanations to see what each comparison covers.":
    [
      "Іріктемеде танылған барлық дағдыны сенімді қолданатыныңызды белгіледіңіз. Әр салыстыру нені қамтитынын түсіндірмеден қараңыз.",
      "Все распознанные навыки вы отметили как уверенные. Изучите объяснения, чтобы понять, что учитывает каждое сравнение.",
    ],
  "No known skills were recognized in these vacancy records. We can’t identify sample-supported gaps yet.":
    [
      "Бұл жұмыс орындарында белгілі дағдылар танылмады. Іріктемеге сүйенген даму бағытын әзірге анықтай алмаймыз.",
      "В этих вакансиях не распознаны известные навыки. Пока нельзя определить пробелы на основе выборки.",
    ],
  "Your skill priorities": [
    "Дағдылар бойынша басымдықтар",
    "Ваши приоритеты по навыкам",
  ],
  "Ordered by mentions in this sample, with each vacancy counted once.": [
    "Осы іріктемедегі жиілігі бойынша реттелген. Әр жұмыс орны бір рет саналады.",
    "По частоте упоминаний в этой выборке. Каждая вакансия учитывается один раз.",
  ],
  "Skill gaps: {count}": [
    "Дамыту қажет дағды: {count}",
    "Пробелов в навыках: {count}",
  ],
  "Filter skill priorities": [
    "Дағды басымдықтарын сүзу",
    "Фильтр приоритетов по навыкам",
  ],
  "All priorities": ["Барлық басымдық", "Все приоритеты"],
  "Showing {count} of {total} skill priorities": [
    "Дағды басымдықтары: {count} / {total} көрсетілді",
    "Показано приоритетов: {count} из {total}",
  ],
  "Still learning": ["Үйрену үстінде", "Ещё изучаю"],
  "Not yet explored": ["Әлі үйренілмеген", "Пока не изучен"],
  "vacancies mention it": ["жұмыс орнында кездеседі", "вакансий с упоминанием"],
  "No skills in this group.": [
    "Бұл топта дағдылар жоқ.",
    "В этой группе нет навыков.",
  ],
  "No gaps identified in this sample.": [
    "Бұл іріктемеде жетіспейтін дағдылар анықталмады.",
    "В этой выборке пробелов не выявлено.",
  ],
  "Try another confidence group to see the rest of your priorities.": [
    "Қалған басымдықтарды көру үшін басқа деңгей тобын таңдаңыз.",
    "Выберите другую группу уровня, чтобы увидеть остальные приоритеты.",
  ],
  "This reflects your saved confidence and the skills recognized in this sample.":
    [
      "Бұл нәтиже сақталған деңгейіңіз бен осы іріктемеде танылған дағдыларды көрсетеді.",
      "Это отражает сохранённую оценку уровня и навыки, распознанные в выборке.",
    ],
  "Show fewer priorities": [
    "Азырақ басымдық көрсету",
    "Показать меньше приоритетов",
  ],
  "Show all priorities ({count})": [
    "Барлық басымдықты көрсету ({count})",
    "Показать все приоритеты ({count})",
  ],
  "Turn your gaps into practice.": [
    "Даму бағытын жаттығуға айналдырыңыз.",
    "Превратите пробелы в практику.",
  ],
  "Follow six focused stages with learning links and saved progress.": [
    "Оқу сілтемелері мен сақталған ілгерілеуі бар алты кезеңнен өтіңіз.",
    "Пройдите шесть этапов с учебными ссылками и сохранением прогресса.",
  ],
  "Review job matches": [
    "Сәйкестіктерді қарау",
    "Посмотреть соответствие вакансиям",
  ],
  "SKILLS TO BUILD ON": [
    "АРҚА СҮЙЕЙТІН ДАҒДЫЛАР",
    "НАВЫКИ ДЛЯ ДАЛЬНЕЙШЕГО РОСТА",
  ],
  "Your strengths": ["Күшті тұстарыңыз", "Ваши сильные стороны"],
  "Skills you marked Comfortable that appear in this sample.": [
    "Осы іріктемеде кездесетін, сенімді қолданатын дағдыларыңыз.",
    "Навыки из выборки, которыми вы уверенно пользуетесь по своей оценке.",
  ],
  mentions: ["рет кездеседі", "упоминаний"],
  "No skills marked Comfortable yet. Learning skills and starting from scratch are both valid starting points.":
    [
      "Әзірге сенімді қолданатын дағдылар белгіленбеген. Үйреніп жүру де, нөлден бастау да қалыпты.",
      "Уверенные навыки пока не отмечены. Можно продолжать обучение или начать с нуля.",
    ],
  "Update your skills": ["Дағдыларды жаңарту", "Обновить навыки"],
  "Based on your saved skills": [
    "Сақталған дағдыларға негізделген",
    "На основе сохранённых навыков",
  ],
  "This comparison keeps the confidence levels you had when it was created. Editing your profile won’t change these results.":
    [
      "Салыстыру жасалған кездегі деңгейлер сақталады. Профильді өзгерту бұл нәтижені өзгертпейді.",
      "Сравнение сохраняет оценку уровня на момент создания. Изменение профиля не меняет этот результат.",
    ],
  "Explainable job matches": [
    "Сәйкестіктің түсіндірмесі",
    "Объяснение соответствия вакансиям",
  ],
  "Ranked by recognized skill overlap. Scores estimate overlap with skill mentions, not your chance of being hired.":
    [
      "Танылған дағдылар сәйкестігі бойынша реттелген. Баға жұмысқа қабылдану мүмкіндігін емес, дағдылардың сәйкес келуін көрсетеді.",
      "По совпадению распознанных навыков. Оценка отражает пересечение навыков, а не вероятность трудоустройства.",
    ],
  "Filter job matches": [
    "Сәйкестіктерді сүзу",
    "Фильтр соответствия вакансиям",
  ],
  "All vacancies": ["Барлық жұмыс орны", "Все вакансии"],
  Scored: ["Бағаланған", "С оценкой"],
  "Insufficient data": ["Дерек жеткіліксіз", "Недостаточно данных"],
  "Vacancy comparisons shown: {count}": [
    "Көрсетілген салыстыру: {count}",
    "Показано сравнений вакансий: {count}",
  ],
  "Employer not provided": [
    "Жұмыс беруші көрсетілмеген",
    "Работодатель не указан",
  ],
  Unscored: ["Бағаланбаған", "Без оценки"],
  "No recognized skills": ["Танылған дағдылар жоқ", "Нет распознанных навыков"],
  "skill overlap": ["дағдылар сәйкестігі", "совпадение навыков"],
  "There isn’t enough recognized skill information to calculate a reliable score.":
    [
      "Сенімді баға есептеуге танылған дағдылар туралы мәлімет жеткіліксіз.",
      "Недостаточно распознанных навыков для надёжной оценки.",
    ],
  Gaps: ["Жетіспейтін дағдылар", "Пробелы"],
  "Why no score?": ["Неге баға жоқ?", "Почему нет оценки?"],
  "Why this score?": ["Неге осындай баға?", "Почему такая оценка?"],
  "Insufficient data: no known skills were recognized, so no score is calculated.":
    [
      "Дерек жеткіліксіз: белгілі дағдылар танылмады, сондықтан баға есептелмейді.",
      "Недостаточно данных: известные навыки не распознаны, поэтому оценка не рассчитывается.",
    ],
  "{comfortable} comfortable, {learning} learning, and {missing} not yet out of {total} distinct recognized skill mentions.":
    [
      "Танылған {total} дағдының {comfortable}-ін сенімді қолданасыз, {learning}-ін үйреніп жүрсіз, {missing}-ін әлі үйренбегенсіз.",
      "Из {total} распознанных навыков: {comfortable} — уверенно, {learning} — изучаете, {missing} — пока не изучали.",
    ],
  "Comfortable · 1 credit": [
    "Сенімді қолданамын · 1 ұпай",
    "Уверенно использую · 1 балл",
  ],
  "Learning · 0.5 credit": ["Үйреніп жүрмін · 0,5 ұпай", "Изучаю · 0,5 балла"],
  "Not yet · 0 credits": [
    "Әлі үйренбедім · 0 ұпай",
    "Пока не изучал(а) · 0 баллов",
  ],
  "{credits} credits ÷ {total} recognized skills × 100": [
    "{credits} ұпай ÷ танылған {total} дағды × 100",
    "{credits} балла ÷ {total} распознанных навыков × 100",
  ],
  "View source description & evidence": [
    "Бастапқы сипаттама мен дәлелдерді көру",
    "Описание и основания из источника",
  ],
  "No description was provided.": [
    "Сипаттама берілмеген.",
    "Описание не предоставлено.",
  ],
  "No canonical skill evidence was found.": [
    "Белгілі дағдыларға қатысты дәлел табылмады.",
    "Основания для распознавания известных навыков не найдены.",
  ],
  "structured skills": ["дағдылар тізімі", "список навыков"],
  "the description": ["сипаттама", "описание"],
  "” in": ["» — дереккөз:", "» — источник:"],
  "· Publication date": ["· Жарияланған күні:", "· Дата публикации:"],
  "not provided": ["көрсетілмеген", "не указана"],
  " No live application link.": [
    " Өтінім беруге арналған нақты сілтеме жоқ.",
    " Ссылки для отклика на реальную вакансию нет.",
  ],
  "View original vacancy on hh.ru": [
    "Түпнұсқа жұмыс орнын hh.ru сайтынан көру",
    "Открыть оригинал вакансии на hh.ru",
  ],
  "(opens in a new tab)": [
    "(жаңа қойындыда ашылады)",
    "(откроется в новой вкладке)",
  ],
  "No vacancies in this view.": [
    "Бұл көріністе жұмыс орындары жоқ.",
    "В этом списке нет вакансий.",
  ],
  "Choose another group to see the available comparisons.": [
    "Қолжетімді салыстыруларды көру үшін басқа топты таңдаңыз.",
    "Выберите другую группу для просмотра доступных сравнений.",
  ],
  "Source text is shown in its original language.": [
    "Дереккөз мәтіні бастапқы тілінде көрсетіледі.",
    "Текст источника показан на языке оригинала.",
  ],
  "YOUR STARTING POINT": ["БАСТАПҚЫ ДЕҢГЕЙІҢІЗ", "ВАША ОТПРАВНАЯ ТОЧКА"],
  "A little about": ["Қазір не", "Немного о том,"],
  "what you know.": ["білетініңіз туралы.", "что вы знаете."],
  "You don’t need to be an expert. An honest starting point is all you need.": [
    "Сарапшы болу міндетті емес. Қазіргі деңгейіңізді шынайы бағаласаңыз жеткілікті.",
    "Не обязательно быть экспертом. Достаточно честно оценить свой текущий уровень.",
  ],
  "YOUR TARGET ROLE": ["МАҚСАТТЫ МАМАНДЫҚ", "ВАША ЦЕЛЕВАЯ ПРОФЕССИЯ"],
  "One focused path, from the beginning.": [
    "Басынан бастап бір нақты бағыт.",
    "Один понятный путь с самого начала.",
  ],
  "Your profile, saved to your account": [
    "Профиль аккаунтыңызда сақталады",
    "Профиль сохраняется в вашем аккаунте",
  ],
  "Review and save when you’re ready. You can return later and update your skills. Confidence is self-reported.":
    [
      "Дайын болғанда тексеріп, сақтаңыз. Кейін дағдыларыңызды жаңарта аласыз. Деңгейіңізді өзіңіз бағалайсыз.",
      "Проверьте и сохраните данные. Позже навыки можно обновить. Уровень вы оцениваете самостоятельно.",
    ],
  "You have unsaved changes.": [
    "Сақталмаған өзгерістер бар.",
    "Есть несохранённые изменения.",
  ],
  "Try demo skill analysis": [
    "Дағдыларды демо деректермен талдау",
    "Демоанализ навыков",
  ],
  "YOUR SKILL SNAPSHOT": [
    "ДАҒДЫЛАРЫҢЫЗДЫҢ ҚЫСҚАША КӨРІНІСІ",
    "ОБЗОР ВАШИХ НАВЫКОВ",
  ],
  "Here’s your starting point.": [
    "Бастапқы деңгейіңіз осындай.",
    "Вот ваша отправная точка.",
  ],
  "Check your details, then save them to your account.": [
    "Мәліметтерді тексеріп, аккаунтыңызда сақтаңыз.",
    "Проверьте данные и сохраните их в аккаунте.",
  ],
  "Display name": ["Атыңыз", "Имя"],
  Education: ["Білім", "Образование"],
  Experience: ["Тәжірибе", "Опыт"],
  "Not added": ["Көрсетілмеген", "Не указано"],
  "Starting from scratch is welcome. All skills are marked “Not yet.”": [
    "Нөлден бастауға болады. Барлық дағды «Әлі үйренбедім» деп белгіленген.",
    "Можно начать с нуля. Все навыки отмечены как «Пока не изучал(а)».",
  ],
  "A foundation to build on.": [
    "Дамытуға болатын негіз бар.",
    "Есть основа для дальнейшего развития.",
  ],
  "Save your profile to compare your skills with vacancy requirements and find a practical learning priority.":
    [
      "Дағдыларды жұмыс талаптарымен салыстырып, не үйрену керегін анықтау үшін профильді сақтаңыз.",
      "Сохраните профиль, чтобы сравнить навыки с требованиями вакансий и выбрать приоритет в обучении.",
    ],
  "Profile and skills saved. They’ll be here when you return.": [
    "Профиль мен дағдылар сақталды. Қайтып келгенде осы жерден табасыз.",
    "Профиль и навыки сохранены. Они будут доступны при следующем посещении.",
  ],
  "Edit profile": ["Профильді өзгерту", "Редактировать профиль"],
  "Save profile & skills": [
    "Профиль мен дағдыларды сақтау",
    "Сохранить профиль и навыки",
  ],
  Saved: ["Сақталды", "Сохранено"],
  "Saving…": ["Сақталуда…", "Сохранение…"],
  "YOUR PROFILE & SKILLS": ["ПРОФИЛЬ МЕН ДАҒДЫЛАР", "ВАШ ПРОФИЛЬ И НАВЫКИ"],
  "Let’s map your starting point.": [
    "Бастапқы деңгейіңізді анықтайық.",
    "Определим вашу отправную точку.",
  ],
  "Share a little context, then choose how familiar each skill feels.": [
    "Өзіңіз туралы қысқаша жазып, әр дағды бойынша деңгейіңізді таңдаңыз.",
    "Расскажите немного о себе и выберите уровень для каждого навыка.",
  ],
  "About you": ["Өзіңіз туралы", "О вас"],
  "(optional)": ["(міндетті емес)", "(необязательно)"],
  "For example, studying economics": [
    "Мысалы, экономика мамандығында оқимын",
    "Например, учусь на экономиста",
  ],
  "A course, internship, or small project you’ve tried": [
    "Өткен курс, тағылымдама немесе шағын жоба",
    "Курс, стажировка или небольшой проект",
  ],
  "Learning:": ["Үйреніп жүрмін:", "Изучаю:"],
  "you’ve tried the basics.": [
    "негіздерін қолданып көрдіңіз.",
    "вы уже попробовали основы.",
  ],
  "Comfortable:": ["Сенімді қолданамын:", "Уверенно использую:"],
  "you can use it independently. Leave anything new as “Not yet.”": [
    "өз бетіңізше қолдана аласыз. Жаңа дағдыларды «Әлі үйренбедім» деп қалдырыңыз.",
    "вы можете работать самостоятельно. Новые навыки оставьте как «Пока не изучал(а)».",
  ],
  "Review your profile": ["Профильді тексеру", "Проверить профиль"],
  "Skills explored: {count} of {total}": [
    "Таныс дағдылар: {count} / {total}",
    "Знакомые навыки: {count} из {total}",
  ],
  "Your starting point": ["Бастапқы деңгейіңіз", "Ваша отправная точка"],
  "Self-reported confidence, a starting point for learning.": [
    "Өзіңіз бағалаған деңгей — оқудың бастапқы нүктесі.",
    "Собственная оценка уровня — отправная точка для обучения.",
  ],
  "Loading your saved profile…": [
    "Сақталған профиль жүктелуде…",
    "Загрузка сохранённого профиля…",
  ],
  "Your profile couldn’t be loaded.": [
    "Профильді жүктеу мүмкін болмады.",
    "Не удалось загрузить профиль.",
  ],
  "Could not load your profile.": [
    "Профильді жүктеу мүмкін болмады.",
    "Не удалось загрузить профиль.",
  ],
  "Your profile could not be saved. Please try again.": [
    "Профиль сақталмады. Қайталап көріңіз.",
    "Не удалось сохранить профиль. Попробуйте ещё раз.",
  ],
  "Checking your session…": ["Сессия тексерілуде…", "Проверка сессии…"],
  "Opening sign in…": ["Кіру беті ашылуда…", "Открываем страницу входа…"],
  "Working with data": ["Деректермен жұмыс", "Работа с данными"],
  "Making sense of data": ["Деректерді түсіну", "Понимание данных"],
  "Tools & communication": [
    "Құралдар және нәтижені түсіндіру",
    "Инструменты и представление результатов",
  ],
  "Variables, functions, and simple scripts": [
    "Айнымалылар, функциялар және қарапайым скрипттер",
    "Переменные, функции и простые скрипты",
  ],
  "Queries, joins, and aggregations": [
    "Сұраулар, кестелерді біріктіру және жинақтау",
    "Запросы, соединения и агрегации",
  ],
  "Formulas, tables, and spreadsheets": [
    "Формулалар және электрондық кестелер",
    "Формулы, таблицы и электронные листы",
  ],
  "DataFrames and data exploration": [
    "DataFrame кестелері және деректерді зерттеу",
    "DataFrame и исследование данных",
  ],
  "Relational databases": ["Реляциялық дерекқорлар", "Реляционные базы данных"],
  "Tables, keys, and relationships": [
    "Кестелер, кілттер және байланыстар",
    "Таблицы, ключи и связи",
  ],
  "Data cleaning": ["Деректерді тазалау", "Очистка данных"],
  "Missing values and inconsistent records": [
    "Жоқ мәндер және сәйкес келмейтін жазбалар",
    "Пропущенные значения и несогласованные записи",
  ],
  Statistics: ["Статистика", "Статистика"],
  "Distributions, averages, and uncertainty": [
    "Үлестірімдер, орташа мәндер және белгісіздік",
    "Распределения, средние значения и неопределённость",
  ],
  "Data visualization": ["Деректерді көрнекілеу", "Визуализация данных"],
  "Choosing and explaining useful charts": [
    "Пайдалы диаграммаларды таңдау және түсіндіру",
    "Выбор и объяснение полезных графиков",
  ],
  "Data models and interactive reports": [
    "Деректер модельдері және интерактивті есептер",
    "Модели данных и интерактивные отчёты",
  ],
  "Visual analysis and dashboards": [
    "Көрнекі талдау және бақылау тақталары",
    "Визуальный анализ и дашборды",
  ],
  "Tracking and sharing code changes": [
    "Код өзгерістерін бақылау және бөлісу",
    "Отслеживание изменений кода и совместная работа",
  ],
  "Not yet": ["Әлі үйренбедім", "Пока не изучал(а)"],
  Learning: ["Үйреніп жүрмін", "Изучаю"],
  Comfortable: ["Сенімді қолданамын", "Уверенно использую"],
  None: ["Жоқ", "Нет"],
  "YOUR NEXT STEP STARTS HERE": [
    "КЕЛЕСІ ҚАДАМ ОСЫНДАН БАСТАЛАДЫ",
    "ВАШ СЛЕДУЮЩИЙ ШАГ НАЧИНАЕТСЯ ЗДЕСЬ",
  ],
  "WELCOME BACK": ["ҚАЙТА ҚОШ КЕЛДІҢІЗ", "С ВОЗВРАЩЕНИЕМ"],
  "Create your account.": ["Аккаунт жасаңыз.", "Создайте аккаунт."],
  "Continue your journey.": [
    "Жолыңызды жалғастырыңыз.",
    "Продолжите свой путь.",
  ],
  "Keep your profile and skills in one place.": [
    "Профиль мен дағдыларды бір жерде сақтаңыз.",
    "Храните профиль и навыки в одном месте.",
  ],
  "Sign in to return to your saved profile.": [
    "Сақталған профильге оралу үшін кіріңіз.",
    "Войдите, чтобы открыть сохранённый профиль.",
  ],
  "Email address": ["Электрондық пошта", "Электронная почта"],
  Password: ["Құпиясөз", "Пароль"],
  "Use at least 8 characters. Mix letters, numbers, and symbols for a stronger password.":
    [
      "Кемінде 8 таңба қолданыңыз. Сенімді құпиясөз үшін әріп, сан және арнайы таңбаларды араластырыңыз.",
      "Используйте не менее 8 символов. Для надёжности сочетайте буквы, цифры и специальные знаки.",
    ],
  "By creating an account, you confirm that you have read and accept HeadHunter’s":
    [
      "Аккаунт жасау арқылы HeadHunter құжатын оқып, қабылдағаныңызды растайсыз:",
      "Создавая аккаунт, вы подтверждаете, что ознакомились и согласны с документом HeadHunter:",
    ],
  "(employment assistance agreement; opens in a new tab).": [
    "(жұмысқа орналасуға жәрдемдесу туралы келісім; жаңа қойындыда ашылады).",
    "(откроется в новой вкладке).",
  ],
  "Create account": ["Аккаунт жасау", "Создать аккаунт"],
  "Creating account…": ["Аккаунт жасалуда…", "Создание аккаунта…"],
  "Signing in…": ["Кіру…", "Вход…"],
  "Already have an account?": ["Аккаунтыңыз бар ма?", "Уже есть аккаунт?"],
  "New to SkillBridge?": [
    "SkillBridge-ке алғаш келдіңіз бе?",
    "Впервые в SkillBridge?",
  ],
  "Create an account": ["Аккаунт жасау", "Создать аккаунт"],
  "Check your inbox.": ["Поштаңызды тексеріңіз.", "Проверьте почту."],
  "If this address is eligible for a new account, a confirmation email will arrive. Open the link to confirm your email and continue.":
    [
      "Бұл мекенжаймен жаңа аккаунт ашуға болса, растау хаты келеді. Поштаңызды растау үшін хаттағы сілтемені ашыңыз.",
      "Если на этот адрес можно зарегистрировать новый аккаунт, придёт письмо. Откройте ссылку, чтобы подтвердить почту и продолжить.",
    ],
  "Already have an account? Sign in instead.": [
    "Аккаунтыңыз бар болса, кіріңіз.",
    "Если аккаунт уже есть, войдите.",
  ],
  "Go to sign in": ["Кіру бетіне өту", "Перейти ко входу"],
  "Confirm your email": ["Поштаңызды растаңыз", "Подтвердите почту"],
  "Confirming your session…": ["Сессия расталуда…", "Подтверждаем сессию…"],
  "Continue to your account.": [
    "Аккаунтыңызға өтіңіз.",
    "Перейдите в аккаунт.",
  ],
  "If your email was confirmed, sign in to continue. If the link expired, return to account creation to request another confirmation.":
    [
      "Поштаңыз расталса, жалғастыру үшін кіріңіз. Сілтеме ескірсе, жаңа растауды сұрау үшін тіркелу бетіне оралыңыз.",
      "Если почта подтверждена, войдите. Если ссылка истекла, вернитесь к регистрации, чтобы запросить новое подтверждение.",
    ],
  "Too many attempts. Wait a little and try again.": [
    "Әрекет саны тым көп. Біраз күтіп, қайталаңыз.",
    "Слишком много попыток. Немного подождите и повторите.",
  ],
  "Confirm your email using the link in your inbox, then sign in.": [
    "Хаттағы сілтеме арқылы поштаңызды растап, кіріңіз.",
    "Подтвердите почту по ссылке из письма, затем войдите.",
  ],
  "Choose a stronger password using a mix of letters, numbers, and symbols.": [
    "Әріп, сан және арнайы таңбалардан тұратын сенімдірек құпиясөз таңдаңыз.",
    "Выберите более надёжный пароль из букв, цифр и специальных знаков.",
  ],
  "Could not create your account. Check your details and try again.": [
    "Аккаунт жасалмады. Мәліметтерді тексеріп, қайталаңыз.",
    "Не удалось создать аккаунт. Проверьте данные и повторите.",
  ],
  "Could not sign in. Check your email and password and try again.": [
    "Кіру мүмкін болмады. Пошта мен құпиясөзді тексеріп, қайталаңыз.",
    "Не удалось войти. Проверьте почту и пароль и повторите.",
  ],
  "Cannot reach the account service. Check your connection and try again.": [
    "Аккаунт қызметіне қосылу мүмкін болмады. Интернетті тексеріп, қайталаңыз.",
    "Не удаётся связаться с сервисом аккаунтов. Проверьте подключение и повторите.",
  ],
  "Cannot reach the account service. Please try again.": [
    "Аккаунт қызметі қолжетімсіз. Қайталап көріңіз.",
    "Сервис аккаунтов недоступен. Попробуйте ещё раз.",
  ],
  "Your session could not be restored. Please sign in again.": [
    "Сессия қалпына келмеді. Қайта кіріңіз.",
    "Не удалось восстановить сессию. Войдите ещё раз.",
  ],
  "Opening your profile…": ["Профиль ашылуда…", "Открываем профиль…"],
  "Accounts are ready to connect.": [
    "Аккаунт қызметін қосу қажет.",
    "Нужно подключить сервис аккаунтов.",
  ],
  "The owner needs to connect the Supabase project before you can create an account or save your profile.":
    [
      "Аккаунт жасау және профиль сақтау үшін сайт иесі Supabase жобасын қосуы керек.",
      "Для регистрации и сохранения профиля владелец сайта должен подключить проект Supabase.",
    ],
  "Back to overview": ["Басты бетке оралу", "Вернуться к обзору"],
  Language: ["Тіл", "Язык"],
  "Switch to light theme": ["Ашық тақырыпқа ауысу", "Включить светлую тему"],
  "Switch to dark theme": ["Қараңғы тақырыпқа ауысу", "Включить тёмную тему"],
  "Skip to content": ["Негізгі мазмұнға өту", "Перейти к содержимому"],
  "SkillBridge AI home": [
    "SkillBridge AI басты беті",
    "Главная SkillBridge AI",
  ],
  "Main navigation": ["Негізгі мәзір", "Основное меню"],
  "Your account": ["Аккаунтыңыз", "Ваш аккаунт"],
  "How it works": ["Қалай жұмыс істейді", "Как это работает"],
  "The learning path": ["Оқу жолы", "Путь обучения"],
  Overview: ["Басты бет", "Обзор"],
  "My profile": ["Профилім", "Мой профиль"],
  "My roadmap": ["Оқу жоспарым", "Мой план обучения"],
  "My skills": ["Дағдыларым", "Мои навыки"],
  "Sign in": ["Кіру", "Войти"],
  "Sign out": ["Шығу", "Выйти"],
  "Signing out…": ["Аккаунттан шығу…", "Выход…"],
  "Loading account…": ["Аккаунт жүктелуде…", "Загрузка аккаунта…"],
  "Could not sign out. Try again.": [
    "Аккаунттан шығу мүмкін болмады. Қайталап көріңіз.",
    "Не удалось выйти. Попробуйте ещё раз.",
  ],
  "YOUR FIRST STEP INTO DATA": [
    "ДЕРЕКТЕР САЛАСЫНДАҒЫ АЛҒАШҚЫ ҚАДАМ",
    "ПЕРВЫЙ ШАГ В АНАЛИТИКУ ДАННЫХ",
  ],
  "You have a goal.": ["Мақсатыңыз бар.", "У вас есть цель."],
  "Let’s find your": ["Келесі", "Найдём ваш"],
  "next step.": ["қадамды табайық.", "следующий шаг."],
  "A clearer path from the skills you have to the skills a Junior Data Analyst needs.":
    [
      "Қазіргі дағдыларыңыздан бастап, деректер талдаушысына қажет білімге дейінгі түсінікті жол.",
      "Понятный путь от ваших нынешних навыков к тому, что нужно начинающему аналитику данных.",
    ],
  "Start with your skills": ["Дағдылардан бастау", "Начать с навыков"],
  "See how it works": [
    "Қалай жұмыс істейтінін көру",
    "Узнать, как это работает",
  ],
  "One career path. A practical place to begin.": [
    "Бір мамандық. Бастауға болатын нақты қадам.",
    "Одна профессия. Практичная отправная точка.",
  ],
  "YOUR PATH, MADE CLEARER": [
    "АЛДЫҢЫЗДАҒЫ ЖОЛ АЙҚЫНДАЛАДЫ",
    "ВАШ ПУТЬ СТАНОВИТСЯ ПОНЯТНЕЕ",
  ],
  "Illustrative preview": ["Көрнекі мысал", "Наглядный пример"],
  "Illustration of the skill-to-learning workflow": [
    "Дағдылардан оқу жоспарына дейінгі қадамдар",
    "Схема перехода от навыков к обучению",
  ],
  "THE GOAL": ["МАҚСАТ", "ЦЕЛЬ"],
  "Junior Data Analyst": [
    "Бастапқы деңгейдегі деректер талдаушысы",
    "Начинающий аналитик данных",
  ],
  "JUNIOR DATA ANALYST": [
    "БАСТАПҚЫ ДЕҢГЕЙДЕГІ ДЕРЕКТЕР ТАЛДАУШЫСЫ",
    "НАЧИНАЮЩИЙ АНАЛИТИК ДАННЫХ",
  ],
  "Start where you are": [
    "Қазіргі деңгейден бастаңыз",
    "Начните с текущего уровня",
  ],
  "Make your current skills visible.": [
    "Қазіргі дағдыларыңызды белгілеңіз.",
    "Отметьте свои текущие навыки.",
  ],
  "Understand what’s needed": [
    "Не қажет екенін біліңіз",
    "Узнайте, что требуется",
  ],
  "Compare your skills with vacancy requirements.": [
    "Дағдыларыңызды бос жұмыс орындарының талаптарымен салыстырыңыз.",
    "Сравните навыки с требованиями вакансий.",
  ],
  "Job requirements → skill gaps": [
    "Жұмыс талаптары → дамыту қажет дағдылар",
    "Требования вакансий → пробелы в навыках",
  ],
  "Know what to learn next": [
    "Әрі қарай не оқу керегін біліңіз",
    "Поймите, чему учиться дальше",
  ],
  "Follow one practical learning roadmap.": [
    "Бір нақты оқу жоспарын ұстаныңыз.",
    "Следуйте одному практическому плану обучения.",
  ],
  "A direction you can act on.": [
    "Іске асыруға болатын бағыт.",
    "Направление для конкретных действий.",
  ],
  "BUILT AROUND YOUR NEXT STEP": [
    "КЕЛЕСІ ҚАДАМЫҢЫЗҒА БАҒЫТТАЛҒАН",
    "ВСЁ ДЛЯ ВАШЕГО СЛЕДУЮЩЕГО ШАГА",
  ],
  "Focused on junior roles": [
    "Мансапты бастаушыларға арналған",
    "Для начинающих специалистов",
  ],
  "Explainable by design": ["Түсінікті нәтижелер", "Объяснимые результаты"],
  "Learning with a purpose": [
    "Мақсатқа бағытталған оқу",
    "Обучение с понятной целью",
  ],
  "FROM UNCERTAINTY TO DIRECTION": [
    "БЕЛГІСІЗДІКТЕН НАҚТЫ БАҒЫТҚА",
    "ОТ НЕОПРЕДЕЛЁННОСТИ К ПОНЯТНОМУ ПУТИ",
  ],
  "A little clarity goes a long way.": [
    "Айқын бағыт алға жетелейді.",
    "Ясность помогает двигаться вперёд.",
  ],
  "Connect what you know": ["Білетініңізді", "Свяжите свои знания"],
  "with what to learn next.": [
    "келесі оқу қадамымен байланыстырыңыз.",
    "с тем, чему учиться дальше.",
  ],
  "Map your starting point": [
    "Бастапқы деңгейіңізді анықтаңыз",
    "Определите отправную точку",
  ],
  "Tell us which skills you’ve explored and how confident you feel using them.":
    [
      "Қандай дағдыларды үйренгеніңізді және оларды қаншалықты сенімді қолданатыныңызды белгілеңіз.",
      "Укажите, какие навыки вы изучали и насколько уверенно ими пользуетесь.",
    ],
  "Set up your profile": ["Профильді толтыру", "Заполнить профиль"],
  "See the requirements": ["Талаптарды қараңыз", "Изучите требования"],
  "Compare against a small vacancy sample, with clear explanations of matching and missing skills.":
    [
      "Дағдыларды шағын жұмыс орындары іріктемесімен салыстырып, сәйкес және жетіспейтін дағдылардың түсіндірмесін алыңыз.",
      "Сравните навыки с небольшой выборкой вакансий и получите понятное объяснение совпадений и пробелов.",
    ],
  "Try the demo comparison": [
    "Демо салыстыруды көру",
    "Попробовать демосравнение",
  ],
  "Take a practical next step": [
    "Келесі нақты қадамды жасаңыз",
    "Сделайте следующий практический шаг",
  ],
  "Choose a skill to practice, guided by the gaps in your comparison.": [
    "Салыстыру нәтижесіне сүйеніп, жаттығуға арналған дағдыны таңдаңыз.",
    "Выберите навык для практики с учётом выявленных пробелов.",
  ],
  "Open your roadmap": ["Оқу жоспарын ашу", "Открыть план обучения"],
  "ONE ROLE. A FOCUSED FOUNDATION.": [
    "БІР МАМАНДЫҚ. НАҚТЫ НЕГІЗ.",
    "ОДНА ПРОФЕССИЯ. ПРОЧНАЯ ОСНОВА.",
  ],
  "Less guesswork.": ["Күмән азаяды.", "Меньше догадок."],
  "More direction.": ["Бағыт айқындалады.", "Больше ясности."],
  "The Junior Data Analyst learning path brings the essentials into one readable sequence.":
    [
      "Бастапқы деңгейдегі деректер талдаушысына қажет негізгі білім бір түсінікті ретпен берілген.",
      "Путь начинающего аналитика данных объединяет необходимые основы в понятную последовательность.",
    ],
  "Start with the fundamentals, practice on real questions, and bring the skills together in a small analysis project.":
    [
      "Негіздерден бастаңыз, нақты сұрақтармен жаттығыңыз және дағдыларды шағын талдау жобасында біріктіріңіз.",
      "Начните с основ, практикуйтесь на реальных вопросах и объедините навыки в небольшом аналитическом проекте.",
    ],
  "Learn. Practice. Build on it.": [
    "Үйреніңіз. Жаттығыңыз. Дамытыңыз.",
    "Изучайте. Практикуйтесь. Развивайтесь.",
  ],
  "YOU DON’T NEED TO KNOW EVERYTHING YET.": [
    "БӘРІН БІЛУ МІНДЕТТІ ЕМЕС.",
    "НЕ ОБЯЗАТЕЛЬНО ЗНАТЬ ВСЁ СРАЗУ.",
  ],
  "Start with what you know.": [
    "Білетініңізден бастаңыз.",
    "Начните с того, что знаете.",
  ],
  "Take a moment to reflect on your skills. Build from there.": [
    "Дағдыларыңызды бағалап, сол деңгейден алға жылжыңыз.",
    "Оцените свои навыки и двигайтесь дальше.",
  ],
  "Explore your starting point": [
    "Бастапқы деңгейді анықтау",
    "Определить свой уровень",
  ],
  "A clearer path into data.": [
    "Деректер саласына апарар айқын жол.",
    "Понятный путь в аналитику данных.",
  ],
  "A clearer path into data": [
    "Деректер саласына апарар айқын жол",
    "Понятный путь в аналитику данных",
  ],
  "Junior Data Analyst · Demo vacancy analysis": [
    "Бастапқы деңгейдегі деректер талдаушысы · Демо талдау",
    "Начинающий аналитик данных · Демоанализ вакансий",
  ],
  "A focused path toward Junior Data Analyst: understand job requirements, identify your skill gaps, and know what to learn next.":
    [
      "Деректер талдаушысына бастайтын нақты жол: жұмыс талаптарын түсініңіз, дамыту қажет дағдыларды анықтаңыз және келесі оқу қадамын таңдаңыз.",
      "Путь к профессии начинающего аналитика данных: изучите требования вакансий, найдите пробелы и определите следующий шаг в обучении.",
    ],
};
