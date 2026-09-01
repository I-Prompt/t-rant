import { HelpfulThing, InDangerContent, SupportedLanguage } from "./types";

// Self-harm pathway copy, per language. English is the canonical version;
// the other 6 are translations drafted by Claude.
//
// 2026-09-01: rewritten to remove first-person "I'm T-Rant's creator, here's
// my own story" framing that was in every language's selfHarmMessage and
// several helpfulThings entries. Decided in an earlier session and flagged
// again when it turned out not to have actually landed: attaching a real
// person's mental-health history to a support message read as the site
// author inserting themselves into someone's crisis rather than pointing
// them to help, and it meant this copy could never be reused/forked without
// carrying someone else's personal disclosure along with it. Same practical
// content and T-R-A-N-T structure, reframed as general supportive guidance
// instead of "here's what happened to me."
//
// 2026-08-17: a full Claude review pass checked every translation for
// grammar, naturalness, and the safe-messaging conventions (no "committed
// suicide"-style phrasing, no methods/means, no minimizing, always paired
// with a real resource link, explicit "not a crisis service" line) — no
// issues found. Confidence is high for de/es/it/fr, moderate for sv/ru. A
// human native-speaker pass — especially for sv/ru — is still recommended
// before this is treated as fully signed off, same as originally planned in
// t-rant-phase2-brief.md section 3/4: an AI reviewing its own prior output
// isn't a substitute for that, however careful the pass.
//
// The T-R-A-N-T acrostic (leading letters of the 5 non-optional
// "helpful things") only works in English by design, so only the "en"
// entry sets emphasizeFirstLetter: the translations carry the same
// content and order, without the wordplay.
//
// 2026-08-19: the "in danger" content (someone disclosing they're being
// hurt by another person) was redesigned and re-translated. The old version
// led with findahelpline.com as if it were the primary contact regardless
// of situation, which doesn't fit "in danger" framing — local emergency
// numbers are the right first move for anyone in immediate physical danger.
// The new `inDanger` block explicitly separates that from being hurt or
// controlled by someone without immediate danger (a different, still real,
// situation findahelpline.com's directory does cover well), and says
// up front that T-Rant itself isn't equipped for either. Same
// AI-translated-pending-human-review status as the rest of this file.

export const SERIOUS_RESOURCE_URL = "https://findahelpline.com";

export interface SelfHarmLocaleContent {
  selfHarmMessage: string;
  emergencyNote: string;
  helpfulThings: HelpfulThing[];
  inDanger: InDangerContent;
}

export const SELF_HARM_CONTENT: Record<SupportedLanguage, SelfHarmLocaleContent> = {
  en: {
    selfHarmMessage: `What you're going through matters, and it deserves more than a rewritten message.

If it feels unbearable right now, that feeling is real - and it's also not permanent, even when it doesn't feel that way. Difficult periods like this do pass, even though time is often the only thing that proves it.

T-Rant isn't a crisis service and can't offer real support, but real help exists. findahelpline.com can connect you with a crisis line in your area, day or night.`,
    emergencyNote: "If you're in immediate danger, contact your local emergency services.",
    helpfulThings: [
      {
        title: "Time.",
        body: "Depending on how deep it goes, it can take three months, six months, a year, or several years to feel like yourself again. Accept that: you're not being timed on this.",
        emphasizeFirstLetter: true,
      },
      {
        title: "",
        body: "Talking to an AI about finding your purpose - what you actually want to do with your life - can help surface a few patterns worth noticing. Worth trying if that sounds useful. (Skip this one if it's not for you.)",
        optional: true,
      },
      {
        title: "Relax.",
        body: 'Binge-watching entire shows, scrolling for hours - all of that is fine, every minute of it: you need time to just be. Ignore anyone telling you to be "productive" your way out of depression; "just go to the gym" won\'t land until you\'re actually ready to go.',
        emphasizeFirstLetter: true,
      },
      {
        title: "Antidepressants.",
        body: 'It\'s common to resist them for months after things get bad - "I don\'t want to be dependent on medication," "I can manage without them," "only people who are really struggling need this." For a lot of people, they end up being what finally makes it possible to get off the couch - that\'s not guaranteed for everyone, and it\'s a conversation worth having with a doctor rather than deciding alone. If cost is a worry, ask about insurance coverage or government support programmes where you are.',
        emphasizeFirstLetter: true,
      },
      {
        title: "No guilt.",
        body: "Being depressed and anxious isn't a sign something's wrong with you - it's how some people who feel things deeply respond to a genuinely difficult world. It can take a while to stop blaming yourself for it, and that's normal too.",
        emphasizeFirstLetter: true,
      },
      {
        title: "Time off.",
        body: "Take time off work, if possible ('I have too much to do' doesn't count as a reason to keep working).",
        emphasizeFirstLetter: true,
      },
    ],
    inDanger: {
      intro:
        "This could mean two different things - you might be in danger right now, or someone might be hurting you emotionally without it being an emergency this second. Either way, T-Rant can't help with this directly: it's a message-rewriting tool, not a support service. Here's where real help is.",
      physicalNote: "In immediate physical danger? Call your local emergency number below, right now.",
      emotionalNote:
        "Being hurt, threatened, or controlled by someone - without immediate danger? findahelpline.com connects you to a support line in your area, day or night. Many countries also list a dedicated domestic-abuse helpline in the numbers above, once you pick your country.",
    },
  },

  de: {
    selfHarmMessage: `Was du gerade durchmachst, ist wichtig - das verdient mehr als nur eine umformulierte Nachricht.

Wenn es sich gerade unerträglich anfühlt, ist dieses Gefühl echt - und es ist nicht von Dauer, auch wenn es sich gerade nicht so anfühlt. Schwierige Phasen wie diese gehen vorbei, auch wenn oft nur die Zeit das beweisen kann.

T-Rant ist kein Kriseninterventionsdienst und kann keine echte Unterstützung bieten, aber echte Hilfe gibt es. findahelpline.com kann dich Tag und Nacht mit einer Beratungsstelle in deiner Nähe verbinden.`,
    emergencyNote: "Wenn du dich in unmittelbarer Gefahr befindest, wende dich an den örtlichen Notruf.",
    helpfulThings: [
      {
        title: "Zeit.",
        body: "Je nachdem, wie tief es geht, kann es drei Monate, sechs Monate, ein Jahr oder auch mehrere Jahre dauern, bis du dich wieder wie du selbst fühlst. Akzeptiere das: hier gibt es keine Zeitvorgabe.",
      },
      {
        title: "",
        body: "Mit einer KI über den eigenen Lebenszweck zu sprechen - was man eigentlich mit seinem Leben anfangen will - kann helfen, ein paar Muster zu erkennen, die es wert sind, bemerkt zu werden. Einen Versuch wert, wenn dich das anspricht. (Wenn nicht, überspring diesen Punkt einfach.)",
        optional: true,
      },
      {
        title: "Entspannen.",
        body: "Ganze Serien durchschauen, stundenlang durch Reels scrollen - das alles ist in Ordnung, jede Minute davon: man braucht einfach Zeit, um einfach nur zu sein. Ignorier alle, die dir erzählen, du sollst dich aus der Depression 'herausarbeiten'. 'Geh doch einfach ins Fitnessstudio' hilft erst, wenn du wirklich bereit dafür bist.",
      },
      {
        title: "Antidepressiva.",
        body: "Es ist normal, sich dagegen monatelang zu wehren, nachdem es richtig schlimm wurde - 'ich will nicht von Medikamenten abhängig sein', 'ich schaffe das auch so', 'das brauchen doch nur Leute, denen es wirklich schlecht geht'. Für viele Menschen sind sie am Ende genau das, was den ersten Schub gibt, überhaupt wieder aufzustehen - das ist nicht garantiert, und es ist ein Thema, das man mit einem Arzt oder einer Ärztin besprechen sollte, nicht allein entscheiden. Falls die Kosten ein Problem sind: Frag nach, ob deine Krankenversicherung oder staatliche Unterstützungsprogramme das übernehmen.",
      },
      {
        title: "Kein schlechtes Gewissen.",
        body: "Depressionen und Angst sind kein Zeichen dafür, dass etwas mit dir nicht stimmt - es ist einfach die Art, wie manche einfühlsame, gefühlsstarke Menschen auf eine wirklich schwierige Welt reagieren. Es kann eine Weile dauern, aufzuhören, sich selbst dafür die Schuld zu geben - auch das ist normal.",
      },
      {
        title: "Auszeit.",
        body: "Nimm dir frei von der Arbeit, wenn möglich ('ich habe zu viel zu tun' zählt nicht als Grund, weiterzuarbeiten).",
      },
    ],
    inDanger: {
      intro:
        "Das kann zwei verschiedene Dinge bedeuten: Entweder du bist gerade in Gefahr, oder jemand tut dir emotional weh, ohne dass es in diesem Moment ein Notfall ist. So oder so kann T-Rant dir dabei nicht direkt helfen - das ist ein Werkzeug zum Umformulieren von Nachrichten, kein Unterstützungsdienst. Hier findest du echte Hilfe.",
      physicalNote: "Bist du gerade in unmittelbarer körperlicher Gefahr? Ruf jetzt deinen örtlichen Notruf an - die Nummer findest du unten.",
      emotionalNote:
        "Wirst du von jemandem verletzt, bedroht oder kontrolliert - ohne dass akute Gefahr besteht? findahelpline.com verbindet dich Tag und Nacht mit einer Beratungsstelle in deiner Nähe. Viele Länder listen außerdem eine eigene Hotline gegen häusliche Gewalt in den Nummern oben, sobald du dein Land auswählst.",
    },
  },

  es: {
    selfHarmMessage: `Lo que estás atravesando importa, y merece mucho más que un simple mensaje reescrito.

Si ahora mismo se siente insoportable, ese sentimiento es real - y también es temporal, aunque no lo parezca. Los momentos difíciles como este pasan, aunque muchas veces solo el tiempo lo demuestra.

T-Rant no es un servicio de crisis y no puede ofrecerte ayuda real, pero esa ayuda real existe. findahelpline.com puede conectarte con una línea de crisis en tu zona, a cualquier hora del día o de la noche.`,
    emergencyNote: "Si estás en peligro inmediato, contacta con los servicios de emergencia de tu zona.",
    helpfulThings: [
      {
        title: "Tiempo.",
        body: "Dependiendo de lo profundo que sea, puede llevar tres meses, seis meses, un año o incluso varios años volver a sentirte como tú mismo. Acepta eso: no estás compitiendo contra un cronómetro.",
      },
      {
        title: "",
        body: "Hablar con una IA sobre encontrar tu propósito - qué es lo que realmente quieres hacer con tu vida - puede ayudarte a notar patrones que vale la pena observar. Vale la pena probarlo si te llama la atención. (Sáltate este punto si no es lo tuyo.)",
        optional: true,
      },
      {
        title: "Relájate.",
        body: "Ver series enteras sin parar, pasar horas viendo reels - todo eso está bien, cada minuto: necesitas tiempo simplemente para existir. Ignora a quien te diga que seas 'productivo' para salir de la depresión; el 'simplemente ve al gimnasio' no funciona hasta que de verdad estás listo para ir.",
      },
      {
        title: "Antidepresivos.",
        body: "Es normal resistirse a ellos durante meses después de que las cosas se pongan mal - 'no quiero depender de medicación', 'puedo con esto sin ayuda', 'eso es solo para quien está realmente mal'. Para muchas personas, terminan siendo lo que finalmente da el empujón para levantarse del sofá - eso no está garantizado para todos, y es una conversación que vale la pena tener con un médico, no decidir en solitario. Si el coste te preocupa, pregunta por la cobertura de tu seguro o por programas de apoyo público en tu país.",
      },
      {
        title: "Sin culpa.",
        body: "Estar deprimido y ansioso no es una señal de que algo esté mal en ti - es solo cómo reaccionan algunas personas empáticas y sensibles ante un mundo que, en muchos sentidos, está bastante roto. Puede llevar un tiempo dejar de culparte por ello, y eso también es normal.",
      },
      {
        title: "Tiempo libre.",
        body: "Tómate tiempo libre del trabajo, si es posible ('tengo demasiado que hacer' no cuenta como razón para seguir trabajando).",
      },
    ],
    inDanger: {
      intro:
        "Esto puede significar dos cosas distintas: puede que estés en peligro ahora mismo, o que alguien te esté haciendo daño emocionalmente sin que sea una emergencia en este instante. En cualquier caso, T-Rant no puede ayudarte directamente con esto: es una herramienta para reescribir mensajes, no un servicio de apoyo. Aquí tienes dónde encontrar ayuda real.",
      physicalNote: "¿Estás en peligro físico inmediato? Llama ahora mismo al número de emergencias de tu zona, más abajo.",
      emotionalNote:
        "¿Alguien te está haciendo daño, amenazando o controlando, sin que haya un peligro inmediato? findahelpline.com te conecta con una línea de apoyo en tu zona, a cualquier hora del día o de la noche. Muchos países también incluyen una línea específica contra la violencia doméstica en los números de arriba, en cuanto eliges tu país.",
    },
  },

  it: {
    selfHarmMessage: `Quello che stai attraversando conta, e merita molto più di un semplice messaggio riscritto.

Se in questo momento ti sembra insopportabile, quella sensazione è reale - ed è anche temporanea, anche se non sembra così. I periodi difficili come questo passano, anche se spesso solo il tempo lo dimostra.

T-Rant non è un servizio di crisi e non può offrirti un aiuto reale, ma un aiuto reale esiste. findahelpline.com può metterti in contatto con una linea di ascolto nella tua zona, giorno e notte.`,
    emergencyNote: "Se sei in pericolo immediato, contatta i servizi di emergenza della tua zona.",
    helpfulThings: [
      {
        title: "Tempo.",
        body: "A seconda di quanto sia profondo, può volerci tre mesi, sei mesi, un anno o anche diversi anni per tornare a sentirti te stesso. Accettalo: non c'è un cronometro che corre contro di te.",
      },
      {
        title: "",
        body: "Parlare con un'IA per capire il proprio scopo - cosa si vuole davvero fare della propria vita - può aiutare a notare schemi che vale la pena osservare. Vale la pena provarci se ti incuriosisce. (Salta questo punto se non fa per te.)",
        optional: true,
      },
      {
        title: "Rilassati.",
        body: "Guardare intere serie tv una dietro l'altra, scrollare reel per ore - va tutto bene, ogni singolo minuto: hai bisogno di tempo per semplicemente esistere. Ignora chiunque ti dica di essere 'produttivo' per uscire dalla depressione; il 'vai in palestra' non serve a niente finché non sei davvero pronto ad andarci.",
      },
      {
        title: "Antidepressivi.",
        body: "È normale resistere per mesi dopo che la situazione precipita - 'non voglio dipendere dai farmaci', 'posso farcela da solo', 'servono solo a chi sta davvero male'. Per molte persone, alla fine, sono quello che dà la prima vera spinta per alzarsi dal divano - non è garantito per tutti, ed è un discorso da fare con un medico, non da decidere da soli. Se il costo ti preoccupa, informati sulla copertura assicurativa o sui programmi di sostegno pubblico nel tuo paese.",
      },
      {
        title: "Senza sensi di colpa.",
        body: "Essere depressi e ansiosi non è un segno che qualcosa non va in te - è semplicemente il modo in cui alcune persone empatiche e sensibili reagiscono a un mondo, per certi versi, davvero complicato. Può volerci un po' per smettere di sentirsi in colpa per questo, ed è normale anche quello.",
      },
      {
        title: "Tempo libero.",
        body: "Prenditi del tempo libero dal lavoro, se possibile ('ho troppo da fare' non è un motivo valido per continuare a lavorare).",
      },
    ],
    inDanger: {
      intro:
        "Questo può significare due cose diverse: potresti essere in pericolo proprio adesso, oppure qualcuno potrebbe farti del male emotivamente senza che sia un'emergenza in questo momento. In ogni caso, T-Rant non può aiutarti direttamente con questo: è uno strumento per riscrivere messaggi, non un servizio di supporto. Ecco dove trovare un aiuto vero.",
      physicalNote: "Sei in pericolo fisico immediato? Chiama subito il numero di emergenza della tua zona, qui sotto.",
      emotionalNote:
        "Qualcuno ti sta facendo del male, minacciando o controllando, senza un pericolo immediato? findahelpline.com ti mette in contatto con una linea di ascolto nella tua zona, giorno e notte. Molti paesi elencano anche una linea dedicata alla violenza domestica nei numeri qui sopra, non appena scegli il tuo paese.",
    },
  },

  fr: {
    selfHarmMessage: `Ce que tu traverses compte, et ça mérite bien plus qu'un simple message reformulé.

Si ça semble insupportable en ce moment, ce sentiment est réel - et il n'est pas permanent, même si ça n'en a pas l'air. Les périodes difficiles comme celle-ci finissent par passer, même si souvent seul le temps le prouve.

T-Rant n'est pas un service de crise et ne peut pas t'offrir un vrai soutien, mais une vraie aide existe. findahelpline.com peut te mettre en relation avec une ligne d'écoute près de chez toi, jour et nuit.`,
    emergencyNote: "Si tu es en danger immédiat, contacte les services d'urgence de ta région.",
    helpfulThings: [
      {
        title: "Le temps.",
        body: "Selon la profondeur de la situation, il peut falloir trois mois, six mois, un an, voire plusieurs années pour se sentir à nouveau soi-même. Accepte-le : il n'y a pas de chronomètre qui tourne contre toi.",
      },
      {
        title: "",
        body: "Discuter avec une IA pour trouver sa voie - ce que l'on veut vraiment faire de sa vie - peut aider à repérer des schémas qui valent la peine d'être remarqués. Ça vaut le coup d'essayer si ça t'intéresse. (Passe ce point si ce n'est pas pour toi.)",
        optional: true,
      },
      {
        title: "Se détendre.",
        body: "Enchaîner des séries entières, faire défiler des reels pendant des heures - tout ça est très bien, chaque minute : il faut du temps rien que pour exister. Ignore ceux qui te disent d'être 'productif' pour sortir de la dépression ; le 'va juste à la salle de sport' ne sert à rien tant que tu n'es pas vraiment prêt à y aller.",
      },
      {
        title: "Antidépresseurs.",
        body: "C'est normal d'y résister pendant des mois après que les choses ont empiré - 'je ne veux pas devenir dépendant des médicaments', 'je peux m'en sortir seul', 'c'est réservé à ceux qui vont vraiment mal'. Pour beaucoup de personnes, ils finissent par être ce qui donne enfin le déclic pour se lever du canapé - ce n'est pas garanti pour tout le monde, et c'est une question à discuter avec un médecin, pas à trancher seul. Si le coût t'inquiète, renseigne-toi sur la prise en charge par ton assurance ou les aides publiques disponibles chez toi.",
      },
      {
        title: "Sans culpabilité.",
        body: "La dépression et l'anxiété ne sont pas le signe que quelque chose cloche chez toi - c'est simplement la façon dont certaines personnes sensibles et empathiques réagissent à un monde qui, à bien des égards, est vraiment difficile. Ça peut prendre du temps d'arrêter de s'en vouloir pour ça, et c'est normal aussi.",
      },
      {
        title: "Du temps libre.",
        body: "Prends du temps loin du travail, si possible ('j'ai trop de choses à faire' ne compte pas comme une raison de continuer à travailler).",
      },
    ],
    inDanger: {
      intro:
        "Ça peut vouloir dire deux choses différentes : soit tu es en danger là, maintenant, soit quelqu'un te fait du mal émotionnellement sans que ce soit une urgence à cet instant précis. Dans les deux cas, T-Rant ne peut pas t'aider directement avec ça : c'est un outil de reformulation de messages, pas un service d'accompagnement. Voici où trouver une vraie aide.",
      physicalNote: "Tu es en danger physique immédiat ? Appelle tout de suite le numéro d'urgence de ta région, ci-dessous.",
      emotionalNote:
        "Quelqu'un te fait du mal, te menace ou te contrôle, sans danger immédiat ? findahelpline.com te met en relation avec une ligne d'écoute près de chez toi, jour et nuit. Beaucoup de pays indiquent aussi une ligne dédiée aux violences conjugales dans les numéros ci-dessus, une fois que tu choisis ton pays.",
    },
  },

  sv: {
    selfHarmMessage: `Det du går igenom spelar roll, och det förtjänar mer än ett omskrivet meddelande.

Om det känns outhärdligt just nu är den känslan verklig - och den är inte permanent, även om det inte känns så. Svåra perioder som den här går över, även om det ofta bara är tiden som bevisar det.

T-Rant är ingen krisjour och kan inte erbjuda verkligt stöd, men verklig hjälp finns. findahelpline.com kan koppla dig till en stödlinje där du bor, dygnet runt.`,
    emergencyNote: "Om du är i akut fara, kontakta larmnumret där du bor.",
    helpfulThings: [
      {
        title: "Tid.",
        body: "Beroende på hur djupt det sitter kan det ta tre månader, sex månader, ett år eller till och med flera år att känna sig som sig själv igen. Acceptera det: du blir inte tidtagen på det här.",
      },
      {
        title: "",
        body: "Att prata med en AI om att hitta sitt syfte - vad man egentligen vill göra med sitt liv - kan hjälpa till att upptäcka mönster värda att lägga märke till. Värt att testa om det låter som din grej. (Hoppa över den här punkten om det inte är det.)",
        optional: true,
      },
      {
        title: "Koppla av.",
        body: "Att se hela serier i sträck, scrolla i timmar - allt det är helt okej, varenda minut: man behöver tid att bara få vara. Strunta i alla som säger att du ska vara 'produktiv' för att ta dig ur en depression; 'gå bara till gymmet' funkar inte förrän du faktiskt är redo att gå dit.",
      },
      {
        title: "Antidepressiva.",
        body: "Det är vanligt att streta emot i flera månader efter att det blivit riktigt tungt - 'jag vill inte bli beroende av mediciner', 'jag klarar det utan', 'det är bara för de som verkligen mår dåligt'. För många blir de till slut det som ger den där första knuffen att resa sig från soffan - det är inte garanterat för alla, och det är ett samtal att ha med en läkare, inte något att besluta ensam. Om kostnaden oroar dig, fråga om det täcks av din försäkring eller av statliga stödprogram där du bor.",
      },
      {
        title: "Ingen skuld.",
        body: "Depression och ångest är inte ett tecken på att något är fel med dig - det är bara hur en del empatiska, känsliga människor reagerar på en värld som på många sätt är rejält trasig. Det kan ta ett tag innan man slutar skylla på sig själv för det - det är normalt också.",
      },
      {
        title: "Ledighet.",
        body: "Ta ledigt från jobbet, om det går ('jag har för mycket att göra' räknas inte som skäl att fortsätta jobba).",
      },
    ],
    inDanger: {
      intro:
        "Det här kan betyda två olika saker: antingen är du i fara just nu, eller så blir du känslomässigt sårad av någon utan att det är en akut nödsituation just i denna stund. Oavsett vilket kan T-Rant inte hjälpa dig direkt med det här: det är ett verktyg för att skriva om meddelanden, inte en stödtjänst. Här hittar du verklig hjälp.",
      physicalNote: "Är du i omedelbar fysisk fara? Ring larmnumret där du bor direkt, du hittar det nedan.",
      emotionalNote:
        "Blir du sårad, hotad eller kontrollerad av någon - utan att det är akut just nu? findahelpline.com kopplar dig till en stödlinje där du bor, dygnet runt. Många länder listar också en särskild linje mot våld i nära relationer i numren ovan, så snart du väljer land.",
    },
  },

  ru: {
    selfHarmMessage: `То, через что ты сейчас проходишь, важно и заслуживает большего, чем просто переписанное сообщение.

Если сейчас это кажется невыносимым, это чувство реально - и оно не постоянно, даже если сейчас так не кажется. Тяжёлые периоды вроде этого проходят, хотя часто это доказывает только время.

T-Rant не служба экстренной помощи и не может предложить реальную поддержку, но реальная помощь существует. findahelpline.com может связать тебя с линией поддержки в твоём регионе, в любое время дня и ночи.`,
    emergencyNote: "Если ты находишься в непосредственной опасности, обратись в экстренные службы своего региона.",
    helpfulThings: [
      {
        title: "Время.",
        body: "В зависимости от того, насколько всё серьёзно, может пройти три месяца, шесть месяцев, год или даже несколько лет, прежде чем ты снова почувствуешь себя собой. Прими это: здесь никто не засекает время.",
      },
      {
        title: "",
        body: "Разговор с ИИ о поиске своего предназначения - о том, чем на самом деле хочется заниматься в жизни, - может помочь заметить закономерности, на которые стоит обратить внимание. Стоит попробовать, если это откликается. (Если нет - пропусти этот пункт.)",
        optional: true,
      },
      {
        title: "Расслабление.",
        body: "Пересматривать сериалы залпом, часами листать ленту - всё это нормально, каждая минута: нужно время, чтобы просто быть. Не слушай тех, кто говорит, что нужно быть 'продуктивным', чтобы выбраться из депрессии; совет 'просто сходи в спортзал' не сработает, пока по-настоящему не будешь готов туда пойти.",
      },
      {
        title: "Антидепрессанты.",
        body: "Это нормально - сопротивляться им месяцами после того, как всё становится по-настоящему плохо - 'не хочу зависеть от таблеток', 'справлюсь и сам', 'это только для тех, кому совсем плохо'. Для многих людей именно они в итоге дают тот самый первый толчок, чтобы встать с дивана - это не гарантировано для всех, и это вопрос, который стоит обсудить с врачом, а не решать в одиночку. Если беспокоит стоимость, узнай о покрытии по страховке или о государственных программах поддержки в твоей стране.",
      },
      {
        title: "Без чувства вины.",
        body: "Депрессия и тревога - это не признак того, что с тобой что-то не так, а просто то, как некоторые чуткие, эмоциональные люди реагируют на мир, который во многом действительно тяжёл. Может потребоваться время, чтобы перестать винить себя за это - и это тоже нормально.",
      },
      {
        title: "Отгулы.",
        body: "Возьми паузу на работе, если это возможно ('у меня слишком много дел' не считается причиной продолжать работать).",
      },
    ],
    inDanger: {
      intro:
        "Это может означать две разные вещи: либо ты сейчас в опасности, либо кто-то причиняет тебе эмоциональную боль, хотя прямо сейчас это не экстренная ситуация. В любом случае T-Rant не может помочь тебе напрямую: это инструмент для переписывания сообщений, а не служба поддержки. Вот где найти настоящую помощь.",
      physicalNote: "Находишься в непосредственной физической опасности? Позвони по номеру экстренных служб своего региона прямо сейчас - он указан ниже.",
      emotionalNote:
        "Кто-то причиняет тебе боль, угрожает или контролирует тебя, но без непосредственной опасности прямо сейчас? findahelpline.com свяжет тебя с линией поддержки в твоём регионе, в любое время дня и ночи. Во многих странах в номерах выше также указана отдельная горячая линия по домашнему насилию - как только ты выберешь страну.",
    },
  },
};
