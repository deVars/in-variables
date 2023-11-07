import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

const storageKey = 'words-shuffle';

export interface QuestionTile {
  letter: string;
  isUsedInAttempt: boolean;
}

export interface Session extends BaseSession {
  questionTiles: QuestionTile[];
  attemptLetters: string[];
}

export interface BaseSession {
  id: number;
  question: string;
  questionSets: QuestionSet[];
  answer: string;
  attempts: string[];
  attemptStatus: AttemptStatus;
  definitions: string[];
  questionRound: number;
  isNextChallengeDeclined: boolean;
}

export enum AttemptStatus {
  pendingLoad, initial, loaded, attempting, badAttempt, fail, over = 8, success,
  successChallengeDeclined, successChallengeOver,
}

export async function getSession(isMock: boolean, answerIndex: number): Promise<Session> {
  const recentSession = await getRecentSession(isMock, answerIndex);
  const { id, question, answer, attempts, attemptStatus, definitions,
    questionSets, questionRound, isNextChallengeDeclined } = recentSession;

  const isChallengeOver = (recentSession.attemptStatus & AttemptStatus.over) === AttemptStatus.over;
  const isAttemptInProgress = !isChallengeOver && attempts.length > 0;
  const newSession: Session = {
    id,
    question,
    questionSets,
    questionRound,
    answer,
    definitions,
    attempts,
    isNextChallengeDeclined,
    attemptStatus: isAttemptInProgress
      ? AttemptStatus.loaded
      : attemptStatus,
    questionTiles: getNewQuestionTiles(question),
    attemptLetters: answer.split('').map(() => ''),
  };

  const newSessionWithRedrawChain = Promise.resolve(newSession);
  newSessionWithRedrawChain.then(() => { m.redraw(); });
  return newSessionWithRedrawChain;
}

export const emptySession: Session = {
  id: 0,
  question: '',
  questionRound: 0,
  questionSets: [],
  answer: '',
  questionTiles: [],
  attemptLetters: [],
  attempts: [],
  attemptStatus: AttemptStatus.pendingLoad,
  definitions: [],
  isNextChallengeDeclined: false,
};

export function getNewQuestionTiles(question: string): QuestionTile[] {
  return question.split('')
    .map((letter) => ({ letter, isUsedInAttempt: false }));
}

export function updateSession(sessionToUpdate: Session): void {
  const { id, question, answer, attemptStatus, attempts, definitions,
    questionSets, questionRound, isNextChallengeDeclined } = sessionToUpdate;
  const sessionState: BaseSession = {
    id, answer, attempts, attemptStatus, question, definitions,
    questionSets, questionRound, isNextChallengeDeclined,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(sessionState));
}

async function getRecentSession(isMock: boolean, answerIndex: number): Promise<BaseSession> {
  const maybeStoredSessionJSON = window.localStorage.getItem(storageKey);
  const hasNoStoredSession = maybeStoredSessionJSON === null;
  const maybeStoredSession = hasNoStoredSession
    ? null
    : JSON.parse(maybeStoredSessionJSON);

  const baseSession = isMock
    ? await getMockBaseSession(maybeStoredSession, answerIndex)
    : await getBaseSession(maybeStoredSession, answerIndex);

  const hasNoInitialDefinition = (answerIndex === 0 && baseSession.definitions.length === 0);
  const isNeedingNewDefinitions = hasNoInitialDefinition
    || baseSession.questionRound < answerIndex;

  if (isNeedingNewDefinitions) {
    const { shuffled: question, word: answer } = baseSession.questionSets[answerIndex];
    const newSession = {
      ...baseSession,
      question,
      answer,
      definitions: await getDefinitions(answer),
      questionRound: answerIndex,
      attempts: [],
      attemptStatus: AttemptStatus.initial,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(newSession));
    return newSession;
  }

  return baseSession;
}

interface QuestionSet{
  word: string;
  shuffled: string;
}

const secondsPerDay = 86400;
const millisPerSecond = 1000;
async function getBaseSession(
  maybeSession: BaseSession | null, answerIndex: number,
): Promise<BaseSession> {
  if (maybeSession !== null) {
    const todaySessionId = Math.floor(Date.now() / secondsPerDay / millisPerSecond);
    const isSessionNotExpired = maybeSession.id === todaySessionId;
    if (isSessionNotExpired) {
      return maybeSession;
    }
  }

  const { id, words } = await m.request<{ id: number; words: QuestionSet[]; }>({
    url: '/word-shuffle/word/get',
    background: true,
  });
  const [ question ] = words;

  return {
    id,
    definitions: [],
    question: question.shuffled,
    questionSets: words,
    answer: question.word,
    questionRound: answerIndex,
    attempts: [],
    attemptStatus: AttemptStatus.initial,
    isNextChallengeDeclined: false,
  };
}

async function getMockBaseSession(
  maybeSession: BaseSession | null, answerIndex: number,
): Promise<BaseSession> {
  if (maybeSession !== null) {
    if (answerIndex > 0
      || (answerIndex === 0 && maybeSession.definitions.length > 0)) {
      return maybeSession;
    }
  }

  await new Promise((resolve) => { setTimeout(resolve, 600); });
  const mockQuestionSet = [
    { shuffled: 'huntre', word: 'hunter' },
    { shuffled: 'oddge', word: 'dodge' },
    { shuffled: 'anderp', word: 'pander' },
    { shuffled: 'ueque', word: 'queue' },
  ];

  return {
    id: Date.now(),
    definitions: [],
    question: mockQuestionSet[answerIndex].shuffled,
    answer: mockQuestionSet[answerIndex].word,
    questionSets: mockQuestionSet,
    questionRound: 0,
    attempts: [],
    attemptStatus: AttemptStatus.initial,
    isNextChallengeDeclined: false,
  };
}

interface DefinitionResponsePage {
  extract: string;
}

interface DefinitionResponse {
  query: {
    pages: DefinitionResponsePage[];
  }
}

async function getDefinitions(answer: string): Promise<string[]> {
  const genericParams = '?action=query&format=json&prop=extracts&formatversion=2&origin=*';
  const titlesParam = `&titles=${answer}`;
  const definitionUrl = `https://en.wiktionary.org/w/api.php${genericParams}${titlesParam}`;
  const { query: { pages: [ { extract } ] } } = await m.request<DefinitionResponse>({
    url: definitionUrl,
    background: true,
  });

  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(extract, 'text/html');

  const singularAnswer = answer.endsWith('s')
    ? answer.substring(0, answer.length - 1)
    : answer;

  return Array.from(htmlDocument.body.children)
    .filter(({ tagName }) => tagName.toLocaleLowerCase() === 'ol')
    .flatMap(({ children }) => Array.from(children)
      .filter(({ tagName, textContent }) => tagName.toLocaleLowerCase() === 'li'
        && textContent !== null
        && !textContent.includes(singularAnswer))
      .map(({ textContent }) => textContent ?? '')
      .filter(Boolean))
    .filter((_, index) => index < 3);
}
