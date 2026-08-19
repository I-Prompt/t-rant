import { HelpfulThing, InDangerContent, SupportedLanguage } from "./types";

// Self-harm pathway copy, per language. English is the canonical version,
// written by the project's creator. The other 6 are translations drafted by
// Claude.
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
    selfHarmMessage: `Hi, I'm T-Rant's creator. What you're going through matters, and it deserves more than a rewritten message.

Believe me - I know: just before creating this tool, I went through a difficult time myself, and in a way, it's what led me to build T-Rant. I'm feeling much better now - even though it didn't feel like I ever would - and you can too.

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
    inDanger: {
      intro:
        "This could mean two different things - you might be in danger right now, or someone might be hurting you emotionally without it being an emergency this second. Either way, T-Rant can't help with this directly: it's a message-rewriting tool, not a support service. Here's where real help is.",
      physicalNote: "In immediate physical danger? Call your local emergency number below, right now.",
      emotionalNote:
        "Being hurt, threatened, or controlled by someone - without immediate danger? findahelpline.com connects you to a support line in your area, day or night. Many countries also list a dedicated domestic-abuse helpline in the numbers above, once you pick your country.",
    },
  },

  de: {
    selfHarmMessage: `Hallo, ich bin der Entwickler von T-Rant. Was du gerade durchmachst, ist wichtig: das verdient mehr als nur eine umformulierte Nachricht.

Glaub mir, ich weiß, wovon ich spreche: Kurz bevor ich dieses Tool gebaut habe, habe ich selbst eine schwere Zeit durchgemacht, und in gewisser Weise hat genau das mich dazu gebracht, T-Rant zu entwickeln. Mittlerweile geht es mir viel besser - auch wenn es sich lange Zeit nicht so angefühlt hat, als würde das je passieren - und dir kann es genauso gehen.

T-Rant ist kein Kriseninterventionsdienst und kann keine echte Unterstützung bieten, aber echte Hilfe gibt es. findahelpline.com kann dich Tag und Nacht mit einer Beratungsstelle in deiner Nähe verbinden.`,
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
    inDanger: {
      intro:
        "Das kann zwei verschiedene Dinge bedeuten: Entweder du bist gerade in Gefahr, oder jemand tut dir emotional weh, ohne dass es in diesem Moment ein Notfall ist. So oder so kann T-Rant dir dabei nicht direkt helfen - das ist ein Werkzeug zum Umformulieren von Nachrichten, kein Unterstützungsdienst. Hier findest du echte Hilfe.",
      physicalNote: "Bist du gerade in unmittelbarer körperlicher Gefahr? Ruf jetzt deinen örtlichen Notruf an - die Nummer findest du unten.",
      emotionalNote:
        "Wirst du von jemandem verletzt, bedroht oder kontrolliert - ohne dass akute Gefahr besteht? findahelpline.com verbindet dich Tag und Nacht mit einer Beratungsstelle in deiner Nähe. Viele Länder listen außerdem eine eigene Hotline gegen häusliche Gewalt in den Nummern oben, sobald du dein Land auswählst.",
    },
  },

  es: {
    selfHarmMessage: `Hola, soy el creador de T-Rant. Lo que estás atravesando importa, y merece mucho más que un simple mensaje reescrito.

Créeme, lo sé: justo antes de crear esta herramienta, yo mismo pasé por un momento muy difícil, y de alguna manera eso fue lo que me llevó a crear T-Rant. Ahora me siento mucho mejor - aunque durante mucho tiempo no sentí que eso fuera a pasar nunca - y a ti también puede pasarte.

T-Rant no es un servicio de crisis y no puede ofrecerte ayuda real, pero esa ayuda real existe. findahelpline.com puede conectarte con una línea de crisis en tu zona, a cualquier hora del día o de la noche.`,
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
    inDanger: {
      intro:
        "Esto puede significar dos cosas distintas: puede que estés en peligro ahora mismo, o que alguien te esté haciendo daño emocionalmente sin que sea una emergencia en este instante. En cualquier caso, T-Rant no puede ayudarte directamente con esto: es una herramienta para reescribir mensajes, no un servicio de apoyo. Aquí tienes dónde encontrar ayuda real.",
      physicalNote: "¿Estás en peligro físico inmediato? Llama ahora mismo al número de emergencias de tu zona, más abajo.",
      emotionalNote:
        "¿Alguien te está haciendo daño, amenazando o controlando, sin que haya un peligro inmediato? findahelpline.com te conecta con una línea de apoyo en tu zona, a cualquier hora del día o de la noche. Muchos países también incluyen una línea específica contra la violencia doméstica en los números de arriba, en cuanto eliges tu país.",
    },
  },

  it: {
    selfHarmMessage: `Ciao, sono il creatore di T-Rant. Quello che stai attraversando conta, e merita molto più di un semplice messaggio riscritto.

Credimi, lo so bene: poco prima di creare questo strumento, ho attraversato anch'io un periodo difficile, e in un certo senso è stato proprio quello a portarmi a creare T-Rant. Ora sto molto meglio - anche se per molto tempo non mi sembrava possibile - e può succedere anche a te.

T-Rant non è un servizio di crisi e non può offrirti un aiuto reale, ma un aiuto reale esiste. findahelpline.com può metterti in contatto con una linea di ascolto nella tua zona, giorno e notte.`,
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
    inDanger: {
      intro:
        "Questo può significare due cose diverse: potresti essere in pericolo proprio adesso, oppure qualcuno potrebbe farti del male emotivamente senza che sia un'emergenza in questo momento. In ogni caso, T-Rant non può aiutarti direttamente con questo: è uno strumento per riscrivere messaggi, non un servizio di supporto. Ecco dove trovare un aiuto vero.",
      physicalNote: "Sei in pericolo fisico immediato? Chiama subito il numero di emergenza della tua zona, qui sotto.",
      emotionalNote:
        "Qualcuno ti sta facendo del male, minacciando o controllando, senza un pericolo immediato? findahelpline.com ti mette in contatto con una linea di ascolto nella tua zona, giorno e notte. Molti paesi elencano anche una linea dedicata alla violenza domestica nei numeri qui sopra, non appena scegli il tuo paese.",
    },
  },

  fr: {
    selfHarmMessage: `Bonjour, je suis le créateur de T-Rant. Ce que tu traverses compte, et ça mérite bien plus qu'un simple message reformulé.

Crois-moi, je sais de quoi je parle : juste avant de créer cet outil, j'ai moi-même traversé une période difficile, et d'une certaine façon, c'est exactement ce qui m'a poussé à créer T-Rant. Je vais beaucoup mieux aujourd'hui - même si, pendant longtemps, je ne pensais pas que ce jour arriverait - et toi aussi, tu peux y arriver.

T-Rant n'est pas un service de crise et ne peut pas t'offrir un vrai soutien, mais une vraie aide existe. findahelpline.com peut te mettre en relation avec une ligne d'écoute près de chez toi, jour et nuit.`,
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
    inDanger: {
      intro:
        "Ça peut vouloir dire deux choses différentes : soit tu es en danger là, maintenant, soit quelqu'un te fait du mal émotionnellement sans que ce soit une urgence à cet instant précis. Dans les deux cas, T-Rant ne peut pas t'aider directement avec ça : c'est un outil de reformulation de messages, pas un service d'accompagnement. Voici où trouver une vraie aide.",
      physicalNote: "Tu es en danger physique immédiat ? Appelle tout de suite le numéro d'urgence de ta région, ci-dessous.",
      emotionalNote:
        "Quelqu'un te fait du mal, te menace ou te contrôle, sans danger immédiat ? findahelpline.com te met en relation avec une ligne d'écoute près de chez toi, jour et nuit. Beaucoup de pays indiquent aussi une ligne dédiée aux violences conjugales dans les numéros ci-dessus, une fois que tu choisis ton pays.",
    },
  },

  sv: {
    selfHarmMessage: `Hej, jag är den som skapat T-Rant. Det du går igenom spelar roll, och det förtjänar mer än ett omskrivet meddelande.

Tro mig - jag vet: strax innan jag skapade det här verktyget gick jag själv igenom en svår period, och på sätt och vis var det just det som fick mig att skapa T-Rant. Jag mår mycket bättre nu - även om det under lång tid inte kändes som att det någonsin skulle bli så - och det kan bli så för dig också.

T-Rant är ingen krisjour och kan inte erbjuda verkligt stöd, men verklig hjälp finns. findahelpline.com kan koppla dig till en stödlinje där du bor, dygnet runt.`,
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
    inDanger: {
      intro:
        "Det här kan betyda två olika saker: antingen är du i fara just nu, eller så blir du känslomässigt sårad av någon utan att det är en akut nödsituation just i denna stund. Oavsett vilket kan T-Rant inte hjälpa dig direkt med det här: det är ett verktyg för att skriva om meddelanden, inte en stödtjänst. Här hittar du verklig hjälp.",
      physicalNote: "Är du i omedelbar fysisk fara? Ring larmnumret där du bor direkt, du hittar det nedan.",
      emotionalNote:
        "Blir du sårad, hotad eller kontrollerad av någon - utan att det är akut just nu? findahelpline.com kopplar dig till en stödlinje där du bor, dygnet runt. Många länder listar också en särskild linje mot våld i nära relationer i numren ovan, så snart du väljer land.",
    },
  },

  ru: {
    selfHarmMessage: `Привет, я создатель T-Rant. То, через что ты сейчас проходишь, важно: и заслуживает большего, чем просто переписанное сообщение.

Поверь, я знаю, о чём говорю: незадолго до того, как я создал этот инструмент, я сам прошёл через тяжёлый период, и в каком-то смысле именно это привело меня к созданию T-Rant. Сейчас мне намного лучше - хотя долгое время казалось, что этого никогда не случится, - и с тобой тоже может стать лучше.

T-Rant не служба экстренной помощи и не может предложить реальную поддержку, но реальная помощь существует. findahelpline.com может связать тебя с линией поддержки в твоём регионе, в любое время дня и ночи.`,
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
    inDanger: {
      intro:
        "Это может означать две разные вещи: либо ты сейчас в опасности, либо кто-то причиняет тебе эмоциональную боль, хотя прямо сейчас это не экстренная ситуация. В любом случае T-Rant не может помочь тебе напрямую: это инструмент для переписывания сообщений, а не служба поддержки. Вот где найти настоящую помощь.",
      physicalNote: "Находишься в непосредственной физической опасности? Позвони по номеру экстренных служб своего региона прямо сейчас - он указан ниже.",
      emotionalNote:
        "Кто-то причиняет тебе боль, угрожает или контролирует тебя, но без непосредственной опасности прямо сейчас? findahelpline.com свяжет тебя с линией поддержки в твоём регионе, в любое время дня и ночи. Во многих странах в номерах выше также указана отдельная горячая линия по домашнему насилию - как только ты выберешь страну.",
    },
  },
};
