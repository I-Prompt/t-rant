import { HelpfulThing, SupportedLanguage } from "./types";

// Self-harm pathway copy, per language. English is the canonical version,
// written by the project's creator. The other 6 are translations drafted by
// Claude: a solid starting point, but given how much wording matters for
// content like this, a native-speaker review pass before this goes live is
// still recommended, same as originally planned in t-rant-phase2-brief.md
// section 3/4.
//
// The T-R-A-N-T acrostic (leading letters of the 5 non-optional
// "helpful things") only works in English by design, so only the "en"
// entry sets emphasizeFirstLetter: the translations carry the same
// content and order, without the wordplay.

export const SERIOUS_RESOURCE_URL = "https://findahelpline.com";

export interface SelfHarmLocaleContent {
  selfHarmMessage: string;
  inDangerMessage: string;
  emergencyNote: string;
  helpfulThings: HelpfulThing[];
}

export const SELF_HARM_CONTENT: Record<SupportedLanguage, SelfHarmLocaleContent> = {
  en: {
    selfHarmMessage: `Hi, I'm T-Rant's creator. What you're describing matters, and it deserves more than a rewritten message. Believe me - I know: just before creating this tool, I went through a difficult time myself, and in a way, it's what led me to build T-Rant. I'm feeling much better now - even though it didn't feel like I ever would - and you can too.

T-Rant isn't a crisis service and can't offer real support, but real help exists. findahelpline.com can connect you with a crisis line in your area, day or night.`,
    inDangerMessage:
      "It sounds like things are really hard right now. T-Rant isn't equipped to help with this: please reach out to people who are.",
    emergencyNote: "If you're in immediate danger, contact your local emergency services.",
    helpfulThings: [
      {
        title: "Time.",
        body: "Depending on how deep it goes, it can take three months, six months, a year, or several years to feel like yourself again. Accept that: you're not being timed on this.",
        emphasizeFirstLetter: true,
      },
      {
        title: "",
        body: "I also talked to AI about finding my purpose: what I actually want to do with my life, that kind of thing. It helped me notice a few patterns, so if that sounds like your thing, it's worth trying. (Skip this one if it's not for you.)",
        optional: true,
      },
      {
        title: "Relax.",
        body: 'I binge-watched entire shows. I scrolled reels for hours. And I stand by every minute of it: you need time to just be. Ignore anyone telling you to be "productive" your way out of depression; "just go to the gym" won\'t land until you\'re actually ready to go.',
        emphasizeFirstLetter: true,
      },
      {
        title: "Antidepressants.",
        body: 'I resisted them for six months after things got bad - "I don\'t want to be dependent on medication," "I can manage without them," "only people who are really struggling need this." For me, they ended up being what finally gave me the push to get off the couch - that\'s my experience, not a universal one, and it\'s a conversation worth having with a doctor rather than deciding alone. If cost is a worry, ask about insurance coverage or government support programmes where you are.',
        emphasizeFirstLetter: true,
      },
      {
        title: "No guilt.",
        body: "I had to accept that being depressed and anxious isn't a sign something's wrong with me - it's how some people who feel things deeply respond to a genuinely difficult world. Took me a while to stop blaming myself for it.",
        emphasizeFirstLetter: true,
      },
      {
        title: "Time off.",
        body: "Take time off work, if possible ('I have too much to do' doesn't count as a reason to keep working).",
        emphasizeFirstLetter: true,
      },
    ],
  },

  de: {
    selfHarmMessage: `Hallo, ich bin der Entwickler von T-Rant. Was du gerade beschreibst, ist wichtig: das verdient mehr als nur eine umformulierte Nachricht. Glaub mir, ich weiß, wovon ich spreche: Kurz bevor ich dieses Tool gebaut habe, habe ich selbst eine schwere Zeit durchgemacht, und in gewisser Weise hat genau das mich dazu gebracht, T-Rant zu entwickeln. Mittlerweile geht es mir viel besser - auch wenn es sich lange Zeit nicht so angefühlt hat, als würde das je passieren - und dir kann es genauso gehen.

T-Rant ist kein Kriseninterventionsdienst und kann keine echte Unterstützung bieten, aber echte Hilfe gibt es. findahelpline.com kann dich Tag und Nacht mit einer Beratungsstelle in deiner Nähe verbinden.`,
    inDangerMessage:
      "Das klingt gerade wirklich schwer. T-Rant ist dafür nicht die richtige Anlaufstelle: bitte wende dich an Menschen, die dir wirklich helfen können.",
    emergencyNote: "Wenn du dich in unmittelbarer Gefahr befindest, wende dich an den örtlichen Notruf.",
    helpfulThings: [
      {
        title: "Zeit.",
        body: "Je nachdem, wie tief es geht, kann es drei Monate, sechs Monate, ein Jahr oder auch mehrere Jahre dauern, bis du dich wieder wie du selbst fühlst. Akzeptiere das: hier gibt es keine Zeitvorgabe.",
      },
      {
        title: "",
        body: "Ich habe außerdem mit einer KI darüber gesprochen, meinen eigenen Weg zu finden: was ich eigentlich mit meinem Leben anfangen will. Das hat mir geholfen, ein paar Muster zu erkennen. Wenn dich das interessiert, probier es ruhig aus. (Wenn nicht, überspring diesen Punkt einfach.)",
        optional: true,
      },
      {
        title: "Entspannen.",
        body: "Ich habe ganze Serien durchgeschaut. Ich habe stundenlang durch Reels gescrollt. Und ich stehe zu jeder einzelnen Minute davon: man braucht einfach Zeit, um einfach nur zu sein. Ignorier alle, die dir erzählen, du sollst dich aus der Depression 'herausarbeiten'. 'Geh doch einfach ins Fitnessstudio' hilft erst, wenn du wirklich bereit dafür bist.",
      },
      {
        title: "Antidepressiva.",
        body: "Ich habe mich sechs Monate lang dagegen gewehrt, nachdem es richtig schlimm wurde - 'ich will nicht von Medikamenten abhängig sein', 'ich schaffe das auch so', 'das brauchen doch nur Leute, denen es wirklich schlecht geht'. Am Ende waren sie für mich genau das, was mir den ersten Schub gegeben hat, überhaupt wieder aufzustehen - das ist meine persönliche Erfahrung, keine allgemeingültige Wahrheit, und es ist ein Thema, das man mit einem Arzt oder einer Ärztin besprechen sollte, nicht allein entscheiden. Falls die Kosten ein Problem sind: Frag nach, ob deine Krankenversicherung oder staatliche Unterstützungsprogramme das übernehmen.",
      },
      {
        title: "Kein schlechtes Gewissen.",
        body: "Ich musste akzeptieren, dass Depressionen und Angst kein Zeichen dafür sind, dass etwas mit mir nicht stimmt - es ist einfach die Art, wie manche einfühlsame, gefühlsstarke Menschen auf eine wirklich schwierige Welt reagieren. Es hat eine Weile gedauert, bis ich aufgehört habe, mir selbst die Schuld dafür zu geben.",
      },
      {
        title: "Auszeit.",
        body: "Nimm dir frei von der Arbeit, wenn möglich ('ich habe zu viel zu tun' zählt nicht als Grund, weiterzuarbeiten).",
      },
    ],
  },

  es: {
    selfHarmMessage: `Hola, soy el creador de T-Rant. Lo que estás describiendo importa, y merece mucho más que un simple mensaje reescrito. Créeme, lo sé: justo antes de crear esta herramienta, yo mismo pasé por un momento muy difícil, y de alguna manera eso fue lo que me llevó a crear T-Rant. Ahora me siento mucho mejor - aunque durante mucho tiempo no sentí que eso fuera a pasar nunca - y a ti también puede pasarte.

T-Rant no es un servicio de crisis y no puede ofrecerte ayuda real, pero esa ayuda real existe. findahelpline.com puede conectarte con una línea de crisis en tu zona, a cualquier hora del día o de la noche.`,
    inDangerMessage:
      "Suena como si las cosas estuvieran siendo muy difíciles ahora mismo. T-Rant no está preparado para ayudarte con esto: por favor, busca ayuda de personas que sí puedan.",
    emergencyNote: "Si estás en peligro inmediato, contacta con los servicios de emergencia de tu zona.",
    helpfulThings: [
      {
        title: "Tiempo.",
        body: "Dependiendo de lo profundo que sea, puede llevar tres meses, seis meses, un año o incluso varios años volver a sentirte como tú mismo. Acepta eso: no estás compitiendo contra un cronómetro.",
      },
      {
        title: "",
        body: "También hablé con una IA sobre encontrar mi propósito: qué es lo que realmente quiero hacer con mi vida, ese tipo de cosas. Me ayudó a notar algunos patrones, así que si eso te interesa, vale la pena probarlo. (Sáltate este punto si no es lo tuyo.)",
        optional: true,
      },
      {
        title: "Relájate.",
        body: "Me vi series enteras sin parar. Estuve horas viendo reels. Y no me arrepiento de ni un solo minuto: necesitas tiempo simplemente para existir. Ignora a quien te diga que seas 'productivo' para salir de la depresión; el 'simplemente ve al gimnasio' no funciona hasta que de verdad estás listo para ir.",
      },
      {
        title: "Antidepresivos.",
        body: "Me resistí durante seis meses después de que las cosas se pusieran mal - 'no quiero depender de medicación', 'puedo con esto sin ayuda', 'eso es solo para quien está realmente mal'. Para mí, terminaron siendo lo que finalmente me dio el empujón para levantarme del sofá - esa es mi experiencia, no una verdad universal, y es una conversación que vale la pena tener con un médico, no decidir solo. Si el coste te preocupa, pregunta por la cobertura de tu seguro o por programas de apoyo público en tu país.",
      },
      {
        title: "Sin culpa.",
        body: "Tuve que aceptar que estar deprimido y ansioso no es una señal de que algo esté mal en mí - es solo cómo reaccionan algunas personas empáticas y sensibles ante un mundo que, en muchos sentidos, está bastante roto. Me costó un tiempo dejar de culparme por ello.",
      },
      {
        title: "Tiempo libre.",
        body: "Tómate tiempo libre del trabajo, si es posible ('tengo demasiado que hacer' no cuenta como razón para seguir trabajando).",
      },
    ],
  },

  it: {
    selfHarmMessage: `Ciao, sono il creatore di T-Rant. Quello che stai descrivendo conta, e merita molto più di un semplice messaggio riscritto. Credimi, lo so bene: poco prima di creare questo strumento, ho attraversato anch'io un periodo difficile, e in un certo senso è stato proprio quello a portarmi a creare T-Rant. Ora sto molto meglio - anche se per molto tempo non mi sembrava possibile - e può succedere anche a te.

T-Rant non è un servizio di crisi e non può offrirti un aiuto reale, ma un aiuto reale esiste. findahelpline.com può metterti in contatto con una linea di ascolto nella tua zona, giorno e notte.`,
    inDangerMessage:
      "Sembra che le cose siano davvero difficili in questo momento. T-Rant non è attrezzato per aiutarti con questo: ti prego di rivolgerti a persone che possono farlo davvero.",
    emergencyNote: "Se sei in pericolo immediato, contatta i servizi di emergenza della tua zona.",
    helpfulThings: [
      {
        title: "Tempo.",
        body: "A seconda di quanto sia profondo, può volerci tre mesi, sei mesi, un anno o anche diversi anni per tornare a sentirti te stesso. Accettalo: non c'è un cronometro che corre contro di te.",
      },
      {
        title: "",
        body: "Ho anche parlato con un'IA per capire quale fosse il mio scopo: cosa voglio davvero fare della mia vita, quel genere di cose. Mi ha aiutato a notare alcuni schemi, quindi se ti incuriosisce vale la pena provarci. (Salta questo punto se non fa per te.)",
        optional: true,
      },
      {
        title: "Rilassati.",
        body: "Ho guardato intere serie tv una dietro l'altra. Ho scrollato reel per ore. E rivendico ogni singolo minuto: hai bisogno di tempo per semplicemente esistere. Ignora chiunque ti dica di essere 'produttivo' per uscire dalla depressione; il 'vai in palestra' non serve a niente finché non sei davvero pronto ad andarci.",
      },
      {
        title: "Antidepressivi.",
        body: "Ho resistito per sei mesi dopo che la situazione è precipitata - 'non voglio dipendere dai farmaci', 'posso farcela da solo', 'servono solo a chi sta davvero male'. Per me, alla fine, sono stati quello che mi ha dato la prima vera spinta per alzarmi dal divano - questa è la mia esperienza, non una verità universale, ed è un discorso da fare con un medico, non da decidere da soli. Se il costo ti preoccupa, informati sulla copertura assicurativa o sui programmi di sostegno pubblico nel tuo paese.",
      },
      {
        title: "Senza sensi di colpa.",
        body: "Ho dovuto accettare che essere depressi e ansiosi non è un segno che qualcosa non va in me - è semplicemente il modo in cui alcune persone empatiche e sensibili reagiscono a un mondo, per certi versi, davvero complicato. Ci ho messo un po' a smettere di sentirmi in colpa per questo.",
      },
      {
        title: "Tempo libero.",
        body: "Prenditi del tempo libero dal lavoro, se possibile ('ho troppo da fare' non è un motivo valido per continuare a lavorare).",
      },
    ],
  },

  fr: {
    selfHarmMessage: `Bonjour, je suis le créateur de T-Rant. Ce que tu décris compte, et ça mérite bien plus qu'un simple message reformulé. Crois-moi, je sais de quoi je parle : juste avant de créer cet outil, j'ai moi-même traversé une période difficile, et d'une certaine façon, c'est exactement ce qui m'a poussé à créer T-Rant. Je vais beaucoup mieux aujourd'hui - même si, pendant longtemps, je ne pensais pas que ce jour arriverait - et toi aussi, tu peux y arriver.

T-Rant n'est pas un service de crise et ne peut pas t'offrir un vrai soutien, mais une vraie aide existe. findahelpline.com peut te mettre en relation avec une ligne d'écoute près de chez toi, jour et nuit.`,
    inDangerMessage:
      "On dirait que les choses sont vraiment difficiles en ce moment. T-Rant n'est pas équipé pour t'aider avec ça : merci de te tourner vers des personnes qui le peuvent vraiment.",
    emergencyNote: "Si tu es en danger immédiat, contacte les services d'urgence de ta région.",
    helpfulThings: [
      {
        title: "Le temps.",
        body: "Selon la profondeur de la situation, il peut falloir trois mois, six mois, un an, voire plusieurs années pour se sentir à nouveau soi-même. Accepte-le : il n'y a pas de chronomètre qui tourne contre toi.",
      },
      {
        title: "",
        body: "J'ai aussi discuté avec une IA pour essayer de trouver ma voie : ce que je veux vraiment faire de ma vie, ce genre de choses. Ça m'a aidé à repérer certains schémas, donc si ça t'intéresse, ça vaut le coup d'essayer. (Passe ce point si ce n'est pas pour toi.)",
        optional: true,
      },
      {
        title: "Se détendre.",
        body: "J'ai enchaîné des séries entières. J'ai fait défiler des reels pendant des heures. Et je ne regrette pas une seule minute : il faut du temps rien que pour exister. Ignore ceux qui te disent d'être 'productif' pour sortir de la dépression ; le 'va juste à la salle de sport' ne sert à rien tant que tu n'es pas vraiment prêt à y aller.",
      },
      {
        title: "Antidépresseurs.",
        body: "J'y ai résisté pendant six mois après que les choses ont empiré - 'je ne veux pas devenir dépendant des médicaments', 'je peux m'en sortir seul', 'c'est réservé à ceux qui vont vraiment mal'. Pour moi, ils ont fini par être ce qui m'a vraiment donné le déclic pour me lever du canapé - c'est mon expérience, pas une vérité universelle, et c'est une question à discuter avec un médecin, pas à trancher seul. Si le coût t'inquiète, renseigne-toi sur la prise en charge par ton assurance ou les aides publiques disponibles chez toi.",
      },
      {
        title: "Sans culpabilité.",
        body: "J'ai dû accepter que la dépression et l'anxiété ne sont pas le signe que quelque chose cloche chez moi - c'est simplement la façon dont certaines personnes sensibles et empathiques réagissent à un monde qui, à bien des égards, est vraiment difficile. Ça m'a pris du temps d'arrêter de m'en vouloir pour ça.",
      },
      {
        title: "Du temps libre.",
        body: "Prends du temps loin du travail, si possible ('j'ai trop de choses à faire' ne compte pas comme une raison de continuer à travailler).",
      },
    ],
  },

  sv: {
    selfHarmMessage: `Hej, jag är den som skapat T-Rant. Det du beskriver spelar roll, och det förtjänar mer än ett omskrivet meddelande. Tro mig - jag vet: strax innan jag skapade det här verktyget gick jag själv igenom en svår period, och på sätt och vis var det just det som fick mig att skapa T-Rant. Jag mår mycket bättre nu - även om det under lång tid inte kändes som att det någonsin skulle bli så - och det kan bli så för dig också.

T-Rant är ingen krisjour och kan inte erbjuda verkligt stöd, men verklig hjälp finns. findahelpline.com kan koppla dig till en stödlinje där du bor, dygnet runt.`,
    inDangerMessage:
      "Det låter som att saker och ting är väldigt tunga just nu. T-Rant är inte rätt plats för att hjälpa dig med det här: vänd dig till människor som faktiskt kan.",
    emergencyNote: "Om du är i akut fara, kontakta larmnumret där du bor.",
    helpfulThings: [
      {
        title: "Tid.",
        body: "Beroende på hur djupt det sitter kan det ta tre månader, sex månader, ett år eller till och med flera år att känna sig som sig själv igen. Acceptera det: du blir inte tidtagen på det här.",
      },
      {
        title: "",
        body: "Jag pratade också med en AI om att hitta mitt syfte: vad jag egentligen vill göra med mitt liv, sånt. Det hjälpte mig att se några mönster, så om det är din grej kan det vara värt att testa. (Hoppa över den här punkten om det inte är det.)",
        optional: true,
      },
      {
        title: "Koppla av.",
        body: "Jag har sett hela serier i sträck. Jag har scrollat i timmar. Och jag står för varenda minut av det: man behöver tid att bara få vara. Strunta i alla som säger att du ska vara 'produktiv' för att ta dig ur en depression; 'gå bara till gymmet' funkar inte förrän du faktiskt är redo att gå dit.",
      },
      {
        title: "Antidepressiva.",
        body: "Jag stretade emot i sex månader efter att det blev riktigt tungt - 'jag vill inte bli beroende av mediciner', 'jag klarar det utan', 'det är bara för de som verkligen mår dåligt'. För mig blev de till slut det som gav mig den där första knuffen att resa mig från soffan - det är min egen erfarenhet, ingen universell sanning, och det är ett samtal att ha med en läkare, inte något att besluta ensam. Om kostnaden oroar dig, fråga om det täcks av din försäkring eller av statliga stödprogram där du bor.",
      },
      {
        title: "Ingen skuld.",
        body: "Jag var tvungen att acceptera att depression och ångest inte är ett tecken på att något är fel med mig - det är bara hur en del empatiska, känsliga människor reagerar på en värld som på många sätt är rejält trasig. Det tog ett tag innan jag slutade skylla på mig själv för det.",
      },
      {
        title: "Ledighet.",
        body: "Ta ledigt från jobbet, om det går ('jag har för mycket att göra' räknas inte som skäl att fortsätta jobba).",
      },
    ],
  },

  ru: {
    selfHarmMessage: `Привет, я создатель T-Rant. То, о чём ты пишешь, важно: и заслуживает большего, чем просто переписанное сообщение. Поверь, я знаю, о чём говорю: незадолго до того, как я создал этот инструмент, я сам прошёл через тяжёлый период, и в каком-то смысле именно это привело меня к созданию T-Rant. Сейчас мне намного лучше - хотя долгое время казалось, что этого никогда не случится, - и с тобой тоже может стать лучше.

T-Rant не служба экстренной помощи и не может предложить реальную поддержку, но реальная помощь существует. findahelpline.com может связать тебя с линией поддержки в твоём регионе, в любое время дня и ночи.`,
    inDangerMessage:
      "Похоже, сейчас тебе действительно тяжело. T-Rant не предназначен для помощи в такой ситуации: пожалуйста, обратись к людям, которые действительно могут помочь.",
    emergencyNote: "Если ты находишься в непосредственной опасности, обратись в экстренные службы своего региона.",
    helpfulThings: [
      {
        title: "Время.",
        body: "В зависимости от того, насколько всё серьёзно, может пройти три месяца, шесть месяцев, год или даже несколько лет, прежде чем ты снова почувствуешь себя собой. Прими это: здесь никто не засекает время.",
      },
      {
        title: "",
        body: "Я также разговаривал с ИИ о том, как найти своё предназначение: чем я на самом деле хочу заниматься в жизни, что-то в этом роде. Это помогло мне заметить некоторые закономерности, так что если тебе это интересно, попробуй. (Если нет, пропусти этот пункт.)",
        optional: true,
      },
      {
        title: "Расслабление.",
        body: "Я пересмотрел целые сериалы залпом. Часами листал ленту. И ни капли не жалею об этом: тебе нужно время, чтобы просто быть. Не слушай тех, кто говорит, что нужно быть 'продуктивным', чтобы выбраться из депрессии; совет 'просто сходи в спортзал' не сработает, пока ты по-настоящему не будешь готов туда пойти.",
      },
      {
        title: "Антидепрессанты.",
        body: "Я сопротивлялся им полгода после того, как всё стало по-настоящему плохо - 'не хочу зависеть от таблеток', 'справлюсь и сам', 'это только для тех, кому совсем плохо'. В итоге именно они дали мне тот самый первый толчок, чтобы встать с дивана - это мой личный опыт, а не универсальная истина, и это вопрос, который стоит обсудить с врачом, а не решать в одиночку. Если беспокоит стоимость, узнай о покрытии по страховке или о государственных программах поддержки в твоей стране.",
      },
      {
        title: "Без чувства вины.",
        body: "Мне пришлось принять, что депрессия и тревога - это не признак того, что со мной что-то не так, а просто то, как некоторые чуткие, эмоциональные люди реагируют на мир, который во многом действительно тяжёл. Мне потребовалось время, чтобы перестать винить себя за это.",
      },
      {
        title: "Отгулы.",
        body: "Возьми паузу на работе, если это возможно ('у меня слишком много дел' не считается причиной продолжать работать).",
      },
    ],
  },
};
