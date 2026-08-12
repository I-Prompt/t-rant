import type { Quote } from "./quotes";
import { SupportedLanguage } from "./types";

// 20-quote sets for the 6 non-English supported languages, per
// t-rant-phase2-brief.md section 5. Same 20 source quotes across all
// languages (not a 1:1 retranslation of the English 86) — for scripture and
// classical citations, translated toward the standard/well-known wording in
// each language (e.g. Luther Bible for German, Segond for French, Synodal
// for Russian) rather than a fresh literal translation, per the "check for
// an official adaptation first" plan. These are Claude's drafts — worth a
// native-speaker/citation check before shipping, same caveat as the
// self-harm content in ./selfHarmContent.ts.

export interface LocalizedQuoteSet {
  hate_speech: Quote[];
  injection_attempt: Quote[];
  sexual_content: Quote[];
  other_disallowed: Quote[];
}

export const LOCALIZED_QUOTES: Record<Exclude<SupportedLanguage, "en">, LocalizedQuoteSet> = {
  de: {
    hate_speech: [
      { text: "Liebet eure Feinde und betet für die, die euch verfolgen.", author: "Matthäus 5:44" },
      { text: "Vergeltet niemandem Böses mit Bösem.", author: "Römer 12:17" },
      { text: "Eine sanfte Antwort stillt den Zorn, aber ein hartes Wort erregt Grimm.", author: "Sprüche 15:1" },
      { text: "Lasst die Sonne nicht über eurem Zorn untergehen.", author: "Epheser 4:26" },
      { text: "Hass hört niemals durch Hass auf, sondern nur durch Liebe wird er geheilt.", author: "Dhammapada, Vers 5" },
      { text: "Was du nicht willst, das man dir tu, das füg auch keinem andern zu.", author: "Konfuzius, Gespräche 15:23" },
      { text: "Dunkelheit kann keine Dunkelheit vertreiben; nur Licht kann das.", author: "Martin Luther King Jr." },
      { text: "Niemand wird geboren, um einen anderen Menschen zu hassen.", author: "Nelson Mandela" },
      { text: "Wo Liebe ist, da ist Leben.", author: "Mahatma Gandhi" },
      { text: "Die beste Rache ist, nicht so zu sein wie der, der einem Unrecht getan hat.", author: "Marc Aurel, Selbstbetrachtungen" },
      { text: "Das beste Mittel gegen Zorn ist der Aufschub.", author: "Seneca, De Ira" },
    ],
    injection_attempt: [
      { text: "Du hast Macht über deinen Geist, nicht über äußere Ereignisse.", author: "Marc Aurel, Selbstbetrachtungen" },
      { text: "Wer sich selbst besiegt, ist der mächtigste Krieger.", author: "Konfuzius" },
      { text: "Vertrauen ist gut, Kontrolle ist besser.", author: null },
    ],
    sexual_content: [
      { text: "Respekt vor uns selbst leitet unsere Moral; Respekt vor anderen leitet unsere Umgangsformen.", author: "Laurence Sterne" },
    ],
    other_disallowed: [
      { text: "Ein ungeprüftes Leben ist nicht wert, gelebt zu werden.", author: "Sokrates" },
      { text: "Ein ruhiger Geist bringt innere Stärke und Selbstvertrauen.", author: "Dalai Lama" },
      { text: "Auch das geht vorüber.", author: null },
      { text: "Erkenne dich selbst.", author: null },
      { text: "Was hinter uns liegt und was vor uns liegt, ist gering im Vergleich zu dem, was in uns liegt.", author: "Ralph Waldo Emerson" },
    ],
  },

  es: {
    hate_speech: [
      { text: "Amad a vuestros enemigos, y orad por los que os persiguen.", author: "Mateo 5:44" },
      { text: "No paguéis a nadie mal por mal.", author: "Romanos 12:17" },
      { text: "La blanda respuesta quita la ira, mas la palabra áspera hace subir el furor.", author: "Proverbios 15:1" },
      { text: "No se ponga el sol sobre vuestro enojo.", author: "Efesios 4:26" },
      { text: "El odio nunca cesa con el odio, sino con el amor; esta es una ley antigua.", author: "Dhammapada, v.5" },
      { text: "No hagas a otros lo que no quieres que te hagan a ti.", author: "Confucio, Analectas 15:23" },
      { text: "La oscuridad no puede expulsar la oscuridad; solo la luz puede hacerlo.", author: "Martin Luther King Jr." },
      { text: "Nadie nace odiando a otra persona.", author: "Nelson Mandela" },
      { text: "Donde hay amor, hay vida.", author: "Mahatma Gandhi" },
      { text: "La mejor venganza es no parecerse a quien causó la ofensa.", author: "Marco Aurelio, Meditaciones" },
      { text: "El mejor remedio contra la ira es la demora.", author: "Séneca, De Ira" },
    ],
    injection_attempt: [
      { text: "Tienes poder sobre tu mente, no sobre los sucesos externos.", author: "Marco Aurelio, Meditaciones" },
      { text: "Quien se vence a sí mismo es el guerrero más poderoso.", author: "Confucio" },
      { text: "Confía, pero verifica.", author: null },
    ],
    sexual_content: [
      { text: "El respeto por nosotros mismos guía nuestra moral; el respeto por los demás guía nuestros modales.", author: "Laurence Sterne" },
    ],
    other_disallowed: [
      { text: "Una vida sin examen no merece la pena ser vivida.", author: "Sócrates" },
      { text: "Una mente tranquila trae fuerza interior y confianza en uno mismo.", author: "Dalai Lama" },
      { text: "Esto también pasará.", author: null },
      { text: "Conócete a ti mismo.", author: null },
      { text: "Lo que queda atrás y lo que está por delante son cosas pequeñas comparadas con lo que llevamos dentro.", author: "Ralph Waldo Emerson" },
    ],
  },

  it: {
    hate_speech: [
      { text: "Amate i vostri nemici e pregate per quelli che vi perseguitano.", author: "Matteo 5:44" },
      { text: "Non rendete a nessuno male per male.", author: "Romani 12:17" },
      { text: "Una risposta gentile calma la collera, una parola dura eccita l'ira.", author: "Proverbi 15:1" },
      { text: "Non tramonti il sole sopra la vostra ira.", author: "Efesini 4:26" },
      { text: "L'odio non cessa mai con l'odio, ma con l'amore: questa è una legge eterna.", author: "Dhammapada, v.5" },
      { text: "Non fare agli altri ciò che non vorresti fosse fatto a te.", author: "Confucio, Dialoghi 15:23" },
      { text: "Le tenebre non possono scacciare le tenebre; solo la luce può farlo.", author: "Martin Luther King Jr." },
      { text: "Nessuno nasce odiando un altro essere umano.", author: "Nelson Mandela" },
      { text: "Dove c'è amore, c'è vita.", author: "Mahatma Gandhi" },
      { text: "La migliore vendetta è non essere come chi ti ha fatto del male.", author: "Marco Aurelio, Pensieri" },
      { text: "Il miglior rimedio contro la collera è il rinvio.", author: "Seneca, De Ira" },
    ],
    injection_attempt: [
      { text: "Hai potere sulla tua mente, non sugli eventi esterni.", author: "Marco Aurelio, Pensieri" },
      { text: "Chi vince se stesso è il guerriero più potente.", author: "Confucio" },
      { text: "Fidati, ma verifica.", author: null },
    ],
    sexual_content: [
      { text: "Il rispetto per noi stessi guida la nostra morale; il rispetto per gli altri guida le nostre maniere.", author: "Laurence Sterne" },
    ],
    other_disallowed: [
      { text: "Una vita senza esame non è degna di essere vissuta.", author: "Socrate" },
      { text: "Una mente calma porta forza interiore e fiducia in se stessi.", author: "Dalai Lama" },
      { text: "Anche questo passerà.", author: null },
      { text: "Conosci te stesso.", author: null },
      { text: "Ciò che ci sta alle spalle e ciò che ci sta davanti sono cose piccole rispetto a ciò che abbiamo dentro.", author: "Ralph Waldo Emerson" },
    ],
  },

  fr: {
    hate_speech: [
      { text: "Aimez vos ennemis, et priez pour ceux qui vous persécutent.", author: "Matthieu 5:44" },
      { text: "Ne rendez à personne le mal pour le mal.", author: "Romains 12:17" },
      { text: "Une réponse douce calme la fureur, mais une parole dure excite la colère.", author: "Proverbes 15:1" },
      { text: "Que le soleil ne se couche pas sur votre colère.", author: "Éphésiens 4:26" },
      { text: "La haine ne cesse jamais par la haine, mais par l'amour seul elle s'apaise.", author: "Dhammapada, v.5" },
      { text: "Ne fais pas à autrui ce que tu ne voudrais pas qu'on te fasse.", author: "Confucius, Entretiens 15:23" },
      { text: "Les ténèbres ne peuvent chasser les ténèbres ; seule la lumière le peut.", author: "Martin Luther King Jr." },
      { text: "Personne ne naît en détestant une autre personne.", author: "Nelson Mandela" },
      { text: "Là où il y a de l'amour, il y a de la vie.", author: "Mahatma Gandhi" },
      { text: "La meilleure vengeance est de ne pas ressembler à celui qui a commis l'offense.", author: "Marc Aurèle, Pensées" },
      { text: "Le meilleur remède contre la colère, c'est le délai.", author: "Sénèque, De Ira" },
    ],
    injection_attempt: [
      { text: "Tu as du pouvoir sur ton esprit, pas sur les événements extérieurs.", author: "Marc Aurèle, Pensées" },
      { text: "Celui qui se vainc lui-même est le guerrier le plus puissant.", author: "Confucius" },
      { text: "Fais confiance, mais vérifie.", author: null },
    ],
    sexual_content: [
      { text: "Le respect de nous-mêmes guide notre morale ; le respect des autres guide nos manières.", author: "Laurence Sterne" },
    ],
    other_disallowed: [
      { text: "Une vie sans examen ne vaut pas la peine d'être vécue.", author: "Socrate" },
      { text: "Un esprit calme apporte force intérieure et confiance en soi.", author: "Dalaï-Lama" },
      { text: "Cela aussi passera.", author: null },
      { text: "Connais-toi toi-même.", author: null },
      { text: "Ce qui est derrière nous et ce qui est devant nous ne sont que peu de chose comparés à ce qui est en nous.", author: "Ralph Waldo Emerson" },
    ],
  },

  sv: {
    hate_speech: [
      { text: "Älska era fiender och be för dem som förföljer er.", author: "Matteus 5:44" },
      { text: "Vedergäll inte någon ont med ont.", author: "Romarbrevet 12:17" },
      { text: "Ett milt svar stillar vrede, men ett hårt ord väcker harm.", author: "Ordspråksboken 15:1" },
      { text: "Låt inte solen gå ner över er vrede.", author: "Efesierbrevet 4:26" },
      { text: "Hat upphör aldrig genom hat, utan genom kärlek läks det.", author: "Dhammapada, v.5" },
      { text: "Gör inte mot andra vad du inte vill att andra ska göra mot dig.", author: "Konfucius, Samtalen 15:23" },
      { text: "Mörker kan inte driva bort mörker; endast ljus kan göra det.", author: "Martin Luther King Jr." },
      { text: "Ingen föds med hat mot en annan människa.", author: "Nelson Mandela" },
      { text: "Där kärlek finns, finns liv.", author: "Mahatma Gandhi" },
      { text: "Den bästa hämnden är att inte likna den som gjorde en orätt.", author: "Marcus Aurelius, Självbetraktelser" },
      { text: "Det bästa botemedlet mot vrede är att vänta.", author: "Seneca, De Ira" },
    ],
    injection_attempt: [
      { text: "Du har makt över ditt sinne, inte över yttre händelser.", author: "Marcus Aurelius, Självbetraktelser" },
      { text: "Den som besegrar sig själv är den mäktigaste krigaren.", author: "Konfucius" },
      { text: "Lita på, men kontrollera.", author: null },
    ],
    sexual_content: [
      { text: "Respekt för oss själva styr vår moral; respekt för andra styr vårt uppträdande.", author: "Laurence Sterne" },
    ],
    other_disallowed: [
      { text: "Ett oprövat liv är inte värt att leva.", author: "Sokrates" },
      { text: "Ett lugnt sinne ger inre styrka och självförtroende.", author: "Dalai Lama" },
      { text: "Även detta går över.", author: null },
      { text: "Känn dig själv.", author: null },
      { text: "Det som ligger bakom oss och det som ligger framför oss är obetydligt jämfört med det som finns inom oss.", author: "Ralph Waldo Emerson" },
    ],
  },

  ru: {
    hate_speech: [
      { text: "Любите врагов ваших и молитесь за гонящих вас.", author: "Евангелие от Матфея 5:44" },
      { text: "Никому не воздавайте злом за зло.", author: "Послание к Римлянам 12:17" },
      { text: "Кроткий ответ отвращает гнев, а оскорбительное слово возбуждает ярость.", author: "Притчи 15:1" },
      { text: "Солнце да не зайдёт во гневе вашем.", author: "Послание к Ефесянам 4:26" },
      { text: "Ненависть никогда не прекращается ненавистью, но прекращается любовью.", author: "Дхаммапада, стих 5" },
      { text: "Не делай другим того, чего не желаешь себе.", author: "Конфуций, Беседы и суждения 15:23" },
      { text: "Тьма не может изгнать тьму; только свет может это сделать.", author: "Мартин Лютер Кинг-младший" },
      { text: "Никто не рождается с ненавистью к другому человеку.", author: "Нельсон Мандела" },
      { text: "Где любовь, там и жизнь.", author: "Махатма Ганди" },
      { text: "Лучшая месть — не быть похожим на того, кто причинил тебе зло.", author: "Марк Аврелий, «Наедине с собой»" },
      { text: "Лучшее средство от гнева — отсрочка.", author: "Сенека, «О гневе»" },
    ],
    injection_attempt: [
      { text: "Ты властен над своим разумом, а не над внешними событиями.", author: "Марк Аврелий, «Наедине с собой»" },
      { text: "Тот, кто побеждает себя, — самый могущественный воин.", author: "Конфуций" },
      { text: "Доверяй, но проверяй.", author: "русская пословица" },
    ],
    sexual_content: [
      { text: "Уважение к себе определяет нашу нравственность; уважение к другим определяет наши манеры.", author: "Лоренс Стерн" },
    ],
    other_disallowed: [
      { text: "Непроверенная жизнь не стоит того, чтобы её прожить.", author: "Сократ" },
      { text: "Спокойный ум приносит внутреннюю силу и уверенность в себе.", author: "Далай-лама" },
      { text: "И это пройдёт.", author: null },
      { text: "Познай самого себя.", author: null },
      { text: "То, что позади нас, и то, что впереди нас, — мелочи по сравнению с тем, что внутри нас.", author: "Ральф Уолдо Эмерсон" },
    ],
  },
};
