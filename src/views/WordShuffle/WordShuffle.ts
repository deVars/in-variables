import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import Loading from '../Loading.js';

interface BaseSession {
  question: string;
  answer: string;
  attempts: string[];
  attemptStatus: AttemptStatus;
}

interface Session extends BaseSession {
  questionTiles: QuestionTile[];
  attemptLetters: string[];
}

enum AttemptStatus {
  pendingLoad, initial, loaded, attempting, badAttempt, success, fail, over,
}

const emptySession: Session = {
  question: '',
  answer: '',
  questionTiles: [],
  attemptLetters: [],
  attempts: [],
  attemptStatus: AttemptStatus.pendingLoad,
};

interface QuestionTile {
  letter: string;
  isUsedInAttempt: boolean;
}

const storageKey = 'words-shuffle';
const tileSel = '.wid-1-0.pad-0-5.box-w-1.box-rad-0-25.box-s-s';
const questionAnswerTileSel = `${tileSel}.box-c-3.typo-s-ctr.sur-fg-1.sur-bg-4`;
let session = emptySession;
export default function getWordShuffle(): m.ClosureComponent {
  const tileSwitcher = { handleEvent: updateTileFocus };
  const tileInputUpdater = { handleEvent: updateAttemptLetters };

  return () => ({
    view,
    oninit: () => getSession(window.env === 'dev')
      .then((newSession) => { session = newSession; }),
  });

  function view() {
    if (session.attemptStatus === AttemptStatus.pendingLoad) {
      return m(Loading());
    }

    const isDisabled = session.attemptStatus === AttemptStatus.success
      || session.attemptStatus === AttemptStatus.over;
    const maybeDisabledClasses = isDisabled
      ? '.box-c-100'
      : '';

    return m('', [
      m('.mgn-t-4-0.typo-s-ctr', session.questionTiles
        .map((questionLetter, index) => {
          const baseClass = `.dsp-i-b${questionAnswerTileSel}`;
          const baseWithMargin = `${baseClass}${getMarginClass(index, session.answer.length)}`;
          const questionTileClass = `${baseWithMargin}${getIsTileUsedClass(questionLetter)}`;
          return m(questionTileClass, questionLetter.letter.toLocaleUpperCase());
        })),
      m('.mgn-t-4-0.mgn-b-2-0.typo-s-ctr', session.attemptLetters
        .map((attemptLetter, index) => (
          m(`input.try${questionAnswerTileSel}${maybeDisabledClasses}${getMarginClass(index, session.answer.length)}`, {
            value: attemptLetter, // keep letter as what is typed to lessen confusion
            type: 'text',
            disabled: isDisabled,
            placeholder: isDisabled
              ? session.answer[index].toLocaleUpperCase()
              : '',
            maxlength: 1,
            size: 1,
            spellcheck: false,
            'data-index': index,
            autofocus: index === 0,
            oninput: tileInputUpdater,
            onkeyup: tileSwitcher,
            enterkeyhint: index === session.questionTiles.length - 1
              ? 'done'
              : 'next',
          })
        ))),
      m('.min-hgt-1-3.typo-s-ctr.mgn-t-0-5.mgn-b-0-5', [
        getStatusLabel(session.attemptStatus),
      ]),
      session.attemptStatus === AttemptStatus.initial
        || session.attempts.length < 1
        ? null
        : m('.typo-s-ctr.mgn-b-2-0.sur-fg-1', [
          m('.typo-s-h6.mgn-b-0-5.sur-fg-3', 'Previous attempts'),
          m('.dsp-i-b.box-t-s-s.box-w-1.box-c-100.pad-t-0-25', Array.from(session.attempts)
            .reverse()
            .map((attempt) => m('.mgn-b-0-5', attempt.split('') // attempt letters
              .map((attemptLetter, index) => (
                m(`.dsp-i-b.box-c-100${tileSel}${getMarginClass(index, session.answer.length)}`, attemptLetter.toLocaleUpperCase())
              ))))),
        ]),
    ]);
  }
}

function checkAttempt(attempt: string[]) {
  if (attempt.some((letter) => letter === '')) {
    session.attemptStatus = AttemptStatus.badAttempt;
    const emptyIndex = attempt.findIndex((letter) => letter === '');
    const nthTileSelector = `input.try:nth-of-type(${emptyIndex + 1})`;
    const maybeEmptyTile = document.querySelector(nthTileSelector);
    if (!isHTMLInputElement(maybeEmptyTile)) {
      console.error('Unexpected error.  Cannot find word tiles.');
      return false;
    }
    maybeEmptyTile.focus();
    m.redraw();
    return false;
  }

  const attemptWord = attempt.join('');
  session.attempts.push(attemptWord);
  if (attemptWord !== session.answer) {
    const maybeStartTile = document.querySelector('input.try:first-of-type');
    if (!isHTMLInputElement(maybeStartTile)) {
      console.error('Unexpected error.  Cannot find word tiles.');
      return false;
    }
    session.attemptLetters = session.answer.split('').map(() => '');
    maybeStartTile.focus();
    session.attemptStatus = session.attempts.length < 6
      ? AttemptStatus.fail
      : AttemptStatus.over;
    updateSession(session);
    m.redraw();
    return true;
  }

  session.attemptStatus = AttemptStatus.success;
  window.localStorage.setItem(storageKey, JSON.stringify(session));
  m.redraw();
  return true;
}

function getUpdatedQuestionTiles(tiles: QuestionTile[], attemptLetters: string[]) {
  const newTiles = tiles.map<QuestionTile>(
    ({ letter }) => ({ letter, isUsedInAttempt: false }),
  );

  attemptLetters.forEach((attemptLetter) => {
    const maybeIndex = newTiles.findIndex(
      ({ letter, isUsedInAttempt }) => letter === attemptLetter && !isUsedInAttempt,
    );
    if (maybeIndex === -1) {
      return;
    }
    newTiles[maybeIndex].isUsedInAttempt = true;
  });

  return newTiles;
}

function getIsTileUsedClass(tile: QuestionTile) {
  return tile.isUsedInAttempt
    ? '.box-c-100.sur-fg-3'
    : '';
}

function getMarginClass(index: number, answerLength: number) {
  return index < answerLength - 1
    ? '.mgn-r-0-5'
    : '';
}

function getNewQuestionTiles(question: string): QuestionTile[] {
  return question.split('')
    .map((letter) => ({ letter, isUsedInAttempt: false }));
}

async function getSession(isMock: boolean) {
  const recentSession = await getRecentSession(isMock);
  const { question, answer, attempts, attemptStatus } = recentSession;

  const newSession: Session = {
    question,
    answer,
    attempts,
    attemptStatus: attemptStatus !== AttemptStatus.success
    && attemptStatus !== AttemptStatus.over
    && attempts.length > 0
      ? AttemptStatus.loaded
      : attemptStatus,
    questionTiles: getNewQuestionTiles(question),
    attemptLetters: answer.split('').map(() => ''),
  };

  if (!isMock) {
    return newSession;
  }

  const mockSessionPromise = Promise.resolve(newSession);
  mockSessionPromise.then(() => { m.redraw(); });
  return mockSessionPromise;
}

async function getRecentSession(isMock: boolean): Promise<BaseSession> {
  const baseSession = isMock
    ? await getMockBaseSession()
    : await getBaseSession();

  const maybeStoredSession = window.localStorage.getItem(storageKey);

  if (maybeStoredSession === null) {
    window.localStorage.setItem(storageKey, JSON.stringify(baseSession));
  }

  const storedSession = maybeStoredSession !== null
    ? JSON.parse(maybeStoredSession)
    : baseSession;
  return baseSession.answer !== storedSession.answer
    ? baseSession
    : storedSession;
}

interface QuestionSet{
  word: string;
  shuffled: string;
}
async function getBaseSession(): Promise<BaseSession> {
  const { words } = await m.request<{words: QuestionSet[]}>({
    url: '/word-shuffle/word/get',
  });
  const [ question ] = words;
  return {
    question: question.shuffled,
    answer: question.word,
    attempts: [],
    attemptStatus: AttemptStatus.initial,
  };
}

async function getMockBaseSession(): Promise<BaseSession> {
  await new Promise((resolve) => { setTimeout(resolve, 2000); });
  const mockQuestion = 'nsmakmiler';
  return {
    question: mockQuestion,
    answer: 'slammerkin',
    attempts: [],
    // attempts: [ 'nsmakmile1', 'nsmakmile2', 'nsmakmile3' ],
    attemptStatus: AttemptStatus.initial,
  };
}

function getStatusLabel(status: AttemptStatus) {
  const labelMap: Record<AttemptStatus, string> = {
    [AttemptStatus.pendingLoad]: '',
    [AttemptStatus.initial]: 'Try to solve the shuffled word within six tries.  Best of luck!',
    [AttemptStatus.loaded]: 'Welcome back!',
    [AttemptStatus.attempting]: '',
    [AttemptStatus.badAttempt]: 'Some tiles are empty.  Please fill them up.',
    [AttemptStatus.success]: 'Congratulations!',
    [AttemptStatus.fail]: 'Sorry, try again.',
    [AttemptStatus.over]: 'Used up all the attempts. Try again tomorrow.',
  };
  return labelMap[status];
}

function updateSession(sessionToUpdate: Session) {
  const { question, answer, attemptStatus, attempts } = sessionToUpdate;
  const sessionState: BaseSession = { answer, attempts, attemptStatus, question };
  window.localStorage.setItem(storageKey, JSON.stringify(sessionState));
}

function updateTileFocus(event: KeyboardEvent & { redraw: boolean; }) {
  const { currentTarget, key } = event;

  if (!isHTMLInputElement(currentTarget)) {
    return;
  }

  session.questionTiles = getUpdatedQuestionTiles(
    session.questionTiles, session.attemptLetters,
  );

  const isDisabledOrAttempting = session.attemptStatus === AttemptStatus.success
    || session.attemptStatus === AttemptStatus.over;
  if (!session.attemptLetters.every((letter) => letter === '')
    && !isDisabledOrAttempting) {
    session.attemptStatus = AttemptStatus.attempting;
  }

  if (key === 'Enter') {
    if (currentTarget.value === '') {
      return;
    }

    if (session.attemptLetters.every((letter) => letter !== '')) {
      if (checkAttempt(session.attemptLetters)) {
        session.questionTiles = getNewQuestionTiles(session.question);
      }
    }

    if (isHTMLElement(currentTarget.nextElementSibling)) {
      currentTarget.nextElementSibling.focus();
      return;
    }

    return;
  }

  const dataIndex = Number(currentTarget.getAttribute('data-index'));
  if (Number.isNaN(dataIndex)) {
    console.error('Unexpected empty value for tile index');
    return;
  }

  if (key === 'Backspace') {
    if (isHTMLElement(currentTarget.previousElementSibling)) {
      currentTarget.previousElementSibling.focus();
    }
    // return;
  }
  // console.log('key', key, currentTarget.getAttribute('data-index'), currentTarget.value);
}

function updateAttemptLetters(e: InputEvent & { redraw: boolean; }) {
  const { currentTarget, data } = e;
  e.redraw = false;

  if (!isHTMLInputElement(currentTarget)) {
    console.error('Unexpected wrong element type for updating attempt tiles.');
    return;
  }

  const dataIndex = Number(currentTarget.getAttribute('data-index'));
  if (Number.isNaN(dataIndex)) {
    console.error('Unexpected empty value for tile index');
    return;
  }

  if (data === '' || data === null) {
    session.attemptLetters[dataIndex] = '';
    return;
  }
  session.attemptLetters[dataIndex] = currentTarget.value;
}

function isHTMLElement(target: EventTarget | null): target is HTMLElement {
  return target !== null;
}

function isHTMLInputElement(target: EventTarget | null): target is HTMLInputElement {
  return target !== null && 'value' in target;
}
