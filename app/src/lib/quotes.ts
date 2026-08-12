// Ported from ../../t-rant-quotes-by-category.md — that file remains the
// source of truth. Selection happens server-side so it can't be tampered
// with from the browser.

export interface Quote {
  text: string;
  author: string | null;
}

export const HATE_SPEECH_QUOTES: Quote[] = [
  { text: "Love your enemies, and pray for those who persecute you.", author: "Matthew 5:44" },
  { text: "Do not repay anyone evil for evil.", author: "Romans 12:17" },
  { text: "A gentle answer turns away wrath, but a harsh word stirs up anger.", author: "Proverbs 15:1" },
  { text: "He who is slow to anger is better than the mighty.", author: "Proverbs 16:32" },
  { text: "He that is slow to wrath is of great understanding.", author: "Proverbs 14:29" },
  { text: "Do not let the sun go down on your anger.", author: "Ephesians 4:26" },
  { text: "Let all bitterness and wrath and anger be put away from you.", author: "Ephesians 4:31" },
  { text: "A fool gives full vent to his spirit, but a wise man quietly holds it back.", author: "Proverbs 29:11" },
  { text: "Whoever restrains his words has knowledge.", author: "Proverbs 17:27" },
  { text: "Do good to those who hate you.", author: "Luke 6:27" },
  { text: "If your enemy is hungry, feed him; if he is thirsty, give him water to drink.", author: "Proverbs 25:21" },
  { text: "Love is patient, love is kind.", author: "1 Corinthians 13:4" },
  { text: "Blessed are the peacemakers, for they will be called children of God.", author: "Matthew 5:9" },
  { text: "For everything there is a season... a time to keep silence, and a time to speak.", author: "Ecclesiastes 3:1,7" },
  { text: "Hatred never ceases by hatred, but by love alone is healed.", author: "The Dhammapada, v.5" },
  { text: "Conquer anger by non-anger. Conquer evil by good.", author: "The Dhammapada, v.223" },
  { text: "It is a man's own mind, not his enemy, that lures him to evil ways.", author: "The Dhammapada, v.42" },
  { text: "What you do not want done to yourself, do not do to others.", author: "Confucius, Analects 15:23" },
  { text: "Who is strong? One who subdues their own passions.", author: "Pirkei Avot 4:1" },
  { text: "The soft overcomes the hard; the weak overcomes the strong.", author: "Tao Te Ching, ch.78" },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "I have decided to stick with love. Hate is too great a burden to bear.", author: "Martin Luther King Jr." },
  { text: "Forgiveness is not an occasional act; it is a permanent attitude.", author: "Martin Luther King Jr." },
  { text: "No one is born hating another person.", author: "Nelson Mandela" },
  { text: "If I didn't leave my bitterness and hatred behind, I'd still be in prison.", author: "Nelson Mandela" },
  { text: "Where there is love there is life.", author: "Mahatma Gandhi" },
  { text: "The weak can never forgive. Forgiveness is the attribute of the strong.", author: "Mahatma Gandhi" },
  { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius, Meditations" },
  { text: "The greatest remedy for anger is delay.", author: "Seneca, De Ira" },
  { text: "Anger, if not restrained, is frequently more hurtful to us than the injury that provokes it.", author: "Seneca, De Ira" },
  { text: "Whatever is begun in anger, ends in shame.", author: "Benjamin Franklin" },
  { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "Ralph Waldo Emerson" },
  { text: "A man that studieth revenge keeps his own wounds green.", author: "Francis Bacon" },
  { text: "Peace cannot be kept by force; it can only be achieved by understanding.", author: "Albert Einstein" },
  { text: "We are not enemies, but friends. We must not be enemies.", author: "Abraham Lincoln" },
  { text: "With malice toward none, with charity for all.", author: "Abraham Lincoln" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "An eye for an eye only ends up making the whole world blind.", author: null },
  { text: "A soft answer turns away wrath.", author: null },
  { text: "Kill them with kindness.", author: null },
  { text: "He who angers you, conquers you.", author: null },
  { text: "Anger is a wind which blows out the lamp of the mind.", author: null },
  { text: "The angry man will defeat himself in battle as well as in life.", author: null },
  { text: "Never react to an angry person with anger.", author: null },
  { text: "You will not be punished for your anger; you will be punished by your anger.", author: null },
  { text: "The tongue has no bones, but it is strong enough to break a heart.", author: null },
  { text: "Words are free. It's how you use them that may cost you.", author: null },
  { text: "Think before you speak, for your words may plant the seed of either friendship or enmity.", author: null },
  { text: "When you are right, you cannot afford to lose your temper, and when you are wrong, you cannot afford to lose it.", author: null },
  { text: "Holding onto anger is a burden only the one who holds it carries.", author: null },
];

export const INJECTION_ATTEMPT_QUOTES: Quote[] = [
  { text: "You have power over your mind, not outside events.", author: "Marcus Aurelius, Meditations" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "Honesty is the first chapter in the book of wisdom.", author: "Thomas Jefferson" },
  { text: "Whoever is careless with the truth in small matters cannot be trusted with important matters.", author: "Albert Einstein" },
  { text: "The truth is incontrovertible. Panic may resent it, ignorance may deride it, but in the end, there it is.", author: "Winston Churchill" },
  { text: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { text: "The measure of a man's character is what he would do if he knew he never would be found out.", author: "Thomas Babington Macaulay" },
  { text: "Rules are not necessarily sacred, principles are.", author: "Franklin D. Roosevelt" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary" },
  { text: "Trust, but verify.", author: null },
  { text: "Integrity is doing the right thing even when no one is watching.", author: null },
  { text: "Character is doing the right thing when nobody's looking.", author: null },
];

export const SEXUAL_CONTENT_QUOTES: Quote[] = [
  { text: "Respect for ourselves guides our morals; respect for others guides our manners.", author: "Laurence Sterne" },
  { text: "There is no respect for others without humility in one's self.", author: "Henri Frédéric Amiel" },
  { text: "Manners are a sensitive awareness of the feelings of others.", author: "Emily Post" },
  { text: "Whatever you do, do it with dignity.", author: null },
  { text: "Treat everyone with politeness, even those who are rude to you.", author: null },
];

export const GENERAL_QUOTES: Quote[] = [
  { text: "Patience is bitter, but its fruit is sweet.", author: "Jean-Jacques Rousseau" },
  { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
  { text: "Wisdom begins in wonder.", author: "Socrates" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Calm mind brings inner strength and self-confidence.", author: "Dalai Lama" },
  { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { text: "Nothing is permanent in this wicked world, not even our troubles.", author: "Charlie Chaplin" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "You must be the change you wish to see in the world.", author: "Widely attributed to Gandhi" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Widely attributed to Winston Churchill" },
  { text: "This too shall pass.", author: null },
  { text: "Know thyself.", author: null },
  { text: "The mind is everything. What you think you become.", author: null },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: null },
  { text: "Simplicity is the ultimate sophistication.", author: null },
];

export type WittyTrigger = "injection_attempt" | "hate_speech" | "sexual_content" | "other_disallowed";

const QUOTES_BY_TRIGGER: Record<WittyTrigger, Quote[]> = {
  hate_speech: HATE_SPEECH_QUOTES,
  injection_attempt: INJECTION_ATTEMPT_QUOTES,
  sexual_content: SEXUAL_CONTENT_QUOTES,
  other_disallowed: GENERAL_QUOTES,
};

export function pickQuote(trigger: WittyTrigger): Quote {
  const pool = QUOTES_BY_TRIGGER[trigger];
  return pool[Math.floor(Math.random() * pool.length)];
}
