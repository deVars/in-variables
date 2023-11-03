import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getLoading from '../Loading.js';

interface BaseSession {
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

interface Session extends BaseSession {
  questionTiles: QuestionTile[];
  attemptLetters: string[];
}

enum AttemptStatus {
  pendingLoad, initial, loaded, attempting, badAttempt, fail, over = 8, success,
  successChallengeDeclined, successChallengeOver,
}

const emptySession: Session = {
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

interface QuestionTile {
  letter: string;
  isUsedInAttempt: boolean;
}

const Loading = getLoading();
const storageKey = 'words-shuffle';
const tileSel = '.wid-1-0.pad-0-5.mgn-b-0-5.box-w-1.box-rad-0-25.box-s-s';
const buttonSel = '.wid-4-0.dsp-b.sur-bg-100-h101.box-s-n.box-rad-0-25.pad-t-0-75.pad-b-0-75.pad-l-1-0.pad-r-1-0';
let session = emptySession;
export default function getWordShuffle(): m.ClosureComponent {
  let isNextChallengeDeclined = false;

  return () => ({
    view,
    oninit: () => getSession(window.env === 'dev', 0)
      .then((newSession) => {
        session = newSession;
        isNextChallengeDeclined = newSession.isNextChallengeDeclined;
      }),
  });

  function view() {
    if (session.attemptStatus === AttemptStatus.pendingLoad) {
      return m(Loading);
    }

    const isChallengeOver = (session.attemptStatus & AttemptStatus.over) === AttemptStatus.over;

    return m('', [
      m(QuestionTiles, { session }),
      m(AttemptInputs, { session }),
      m('.min-hgt-1-3.typo-s-ctr.mgn-t-0-5', [
        getStatusLabel(session.attemptStatus).map(
          (label) => m('.mgn-l-1-0.mgn-r-1-0.mgn-b-0-5', label),
        ),
      ]),
      session.attemptStatus !== AttemptStatus.success
        || session.questionRound === 3
        || isNextChallengeDeclined
        ? null
        : m(NextChallengeDialog, {
          onDeny: () => {
            isNextChallengeDeclined = true;
            updateSession({
              ...session,
              attemptStatus: AttemptStatus.successChallengeDeclined,
              isNextChallengeDeclined,
            });
          },
          onAccept: () => {
            getSession(window.env === 'dev', session.questionRound + 1)
              .then((newSession) => { session = newSession; });
            session = emptySession;
          },
        }),
      (session.attempts.length === 3 && isChallengeOver)
        || session.attempts.length < 3
        || session.definitions.length === 0
        ? null
        : m(Definition, { session }),

      session.attemptStatus === AttemptStatus.initial
        || session.attempts.length < 1
        ? null
        : m(PreviousAttempts, { session }),
    ]);
  }
}

const questionAnswerTileSel = `${tileSel}.box-c-3.typo-s-ctr.sur-fg-1.sur-bg-4`;
function QuestionTiles(): m.Component<{session: Session}> {
  return { view };

  function view({ attrs: { session: aSession } }: m.Vnode<{session: Session}>) {
    return m('.mgn-t-4-0.typo-s-ctr', aSession.questionTiles
      .map((questionLetter, index) => {
        const baseClass = `.dsp-i-b${questionAnswerTileSel}`;
        const baseWithMargin = `${baseClass}${getMarginClass(index, aSession.answer.length)}`;
        const questionTileClass = `${baseWithMargin}${getIsTileUsedClass(questionLetter)}`;
        return m(questionTileClass, questionLetter.letter.toLocaleUpperCase());
      }));
  }
}

function AttemptInputs(): m.Component<{session: Session;}> {
  const tileSwitcher = { handleEvent: updateTileFocus };
  const tileInputUpdater = { handleEvent: updateAttemptLetters };
  return { view };

  function view({ attrs: { session: aSession } }: m.Vnode<{session: Session;}>) {
    const isDisabled = aSession.attemptStatus === AttemptStatus.success
      || aSession.attemptStatus === AttemptStatus.over
      || aSession.attemptStatus === AttemptStatus.successChallengeOver
      || aSession.attemptStatus === AttemptStatus.successChallengeDeclined;
    const maybeDisabledClasses = isDisabled
      ? '.box-c-100'
      : '';
    const baseInputAttr = {
      type: 'text',
      disabled: isDisabled,
      maxlength: 1,
      size: 1,
      spellcheck: false,
      oninput: tileInputUpdater,
      onkeyup: tileSwitcher,
    };

    return m('.mgn-t-4-0.mgn-b-2-0.typo-s-ctr', aSession.attemptLetters
      .map((attemptLetter, index) => {
        const marginSel = getMarginClass(index, aSession.answer.length);
        const inputSel = `input.try${questionAnswerTileSel}${maybeDisabledClasses}${marginSel}`;
        return m(inputSel, {
          ...baseInputAttr,
          value: attemptLetter, // keep letter as what is typed to lessen confusion
          'data-index': index,
          autofocus: index === 0,
          placeholder: isDisabled
            ? aSession.answer[index].toLocaleUpperCase()
            : '',
          enterkeyhint: index === aSession.questionTiles.length - 1
            ? 'done'
            : 'next',
        });
      }));
  }
}

interface NextChallengeDialogAttr {
  onAccept(): void | Promise<void>;
  onDeny(): void | Promise<void>;
}
function NextChallengeDialog(): m.Component<NextChallengeDialogAttr> {
  return { view };

  function view({ attrs: { onDeny, onAccept } }: m.Vnode<NextChallengeDialogAttr>) {
    return m('.mgn-cntr.mgn-b-0-5.wid-max-20-r', [
      m('.mgn-b-0-5.typo-s-h4.typo-s-ctr', 'Do you want to try the next challenge?'),
      m('.dsp-flex.flx-s-a', [
        m(`button.cur-ptr${buttonSel}`, {
          type: 'button',
          onclick: onAccept,
        }, 'Yes'),
        m(`button.cur-ptr${buttonSel}`, {
          type: 'button',
          onclick: onDeny,
        }, 'No'),
      ]),
    ]);
  }
}

function Definition(): m.Component<{session: BaseSession;}> {
  return { view };

  function view({ attrs: { session: aSession } }: m.Vnode<{session: BaseSession;}>) {
    return m('.mgn-b-0-5.mgn-cntr', {
      style: `max-width: max(${(aSession.answer.length * 2) + 2}rem, 80vw)`,
    }, [
      m('.typo-s-h4.typo-s-ctr', 'word hint:'),
      aSession.definitions.map(
        (definition) => m('p.mgn-l-1-0.mgn-r-1-0.typo-s-h6', definition),
      ),
    ]);
  }
}

function PreviousAttempts(): m.Component<{session: BaseSession;}> {
  return { view };

  function view({ attrs: { session: aSession } }: m.Vnode<{session: BaseSession;}>) {
    const label = 'Previous attempts';
    const reversedAttempts = Array.from(aSession.attempts).reverse();
    return m('.typo-s-ctr.mgn-b-2-0.sur-fg-1', [
      m('.typo-s-h6.mgn-b-0-5.sur-fg-3', label),
      m('.dsp-i-b.box-t-s-s.box-w-1.box-c-100.pad-t-0-25',
        reversedAttempts.map(
          (attempt) => m('.mgn-b-0-5', attempt.split('') // attempt letters
            .map(
              (attemptLetter, index) => {
                const marginSel = getMarginClass(index, aSession.answer.length);
                const previousTileSel = `.dsp-i-b.box-c-100${tileSel}${marginSel}`;
                return m(previousTileSel, attemptLetter.toLocaleUpperCase());
              },
            )),
        )),
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
  if (attemptWord.toLocaleLowerCase() !== session.answer.toLocaleLowerCase()) {
    const maybeStartTile = document.querySelector('input.try:first-of-type');
    if (!isHTMLInputElement(maybeStartTile)) {
      console.error('Unexpected error.  Cannot find word tiles.');
      return false;
    }
    session.attemptLetters = session.answer.split('').map(() => '');
    maybeStartTile.focus();
    session.attemptStatus = session.attempts.length < 5
      ? AttemptStatus.fail
      : AttemptStatus.over;
    updateSession(session);
    m.redraw();
    return true;
  }

  session.attemptStatus = session.questionRound < 3
    ? AttemptStatus.success
    : AttemptStatus.successChallengeOver;
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
      ({ letter, isUsedInAttempt }) => (
        letter.toLocaleLowerCase() === attemptLetter.toLocaleLowerCase()
        && !isUsedInAttempt
      ),
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

async function getSession(isMock: boolean, answerIndex: number) {
  const recentSession = await getRecentSession(isMock, answerIndex);
  const { id, question, answer, attempts, attemptStatus, definitions,
    questionSets, questionRound, isNextChallengeDeclined } = recentSession;

  const newSession: Session = {
    id,
    question,
    questionSets,
    questionRound,
    answer,
    definitions,
    attempts,
    isNextChallengeDeclined,
    attemptStatus: attemptStatus !== AttemptStatus.success
      && attemptStatus !== AttemptStatus.over
      && attemptStatus !== AttemptStatus.successChallengeDeclined
      && attemptStatus !== AttemptStatus.successChallengeOver
      && attempts.length > 0
      ? AttemptStatus.loaded
      : attemptStatus,
    questionTiles: getNewQuestionTiles(question),
    attemptLetters: answer.split('').map(() => ''),
  };

  const newSessionWithRedrawChain = Promise.resolve(newSession);
  newSessionWithRedrawChain.then(() => { m.redraw(); });
  return newSessionWithRedrawChain;
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

interface DefinitionResponse {
  query: {
    pages: DefinitionResponsePage[];
  }
}

interface DefinitionResponsePage {
  extract: string;
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

function getStatusLabel(status: AttemptStatus) {
  const labelMap: Record<AttemptStatus, string[]> = {
    [AttemptStatus.pendingLoad]: [ '' ],
    [AttemptStatus.initial]: [ 'Try to solve the shuffled word within five tries.  Best of luck!' ],
    [AttemptStatus.loaded]: [ 'Welcome back!' ],
    [AttemptStatus.attempting]: [ '' ],
    [AttemptStatus.badAttempt]: [ 'Some tiles are empty.  Please fill them up.' ],
    [AttemptStatus.success]: [ 'Congratulations!' ],
    [AttemptStatus.fail]: [ 'Sorry, try again.' ],
    [AttemptStatus.over]: [ 'Used up all the attempts.  Try again tomorrow.' ],
    [AttemptStatus.successChallengeDeclined]: [
      'Congratulations!',
      'A new challenge is waiting tomorrow.',
    ],
    [AttemptStatus.successChallengeOver]: [
      'Congratulations!',
      'You have finished today\'s challenges!',
      'A new challenge is waiting tomorrow.',
    ],
  };
  return labelMap[status];
}

function updateSession(sessionToUpdate: Session) {
  const { id, question, answer, attemptStatus, attempts, definitions,
    questionSets, questionRound, isNextChallengeDeclined } = sessionToUpdate;
  const sessionState: BaseSession = {
    id, answer, attempts, attemptStatus, question, definitions,
    questionSets, questionRound, isNextChallengeDeclined,
  };
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
