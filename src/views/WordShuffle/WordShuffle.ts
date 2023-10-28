import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

interface Session {
  question: string;
  answer: string;
  questionTiles: QuestionTile[];
  attemptLetters: string[];
  attempts: string[];
  attemptStatus: AttemptStatus;
}

enum AttemptStatus {
  initial, attempting, badAttempt, success, fail, over,
}

const emptySession: Session = {
  question: '',
  answer: '',
  questionTiles: [],
  attemptLetters: [],
  attempts: [],
  attemptStatus: AttemptStatus.initial,
};

interface QuestionTile {
  letter: string;
  isUsedInAttempt: boolean;
}

const tileSel = '.wid-1-0.pad-0-5.box-w-1.box-rad-0-25.box-s-s';
const questionAnswerTileSel = `${tileSel}.box-c-3.typo-s-ctr`;
let session = emptySession;
export default function getWordShuffle(): m.ClosureComponent {
  const tileSwitcher = { handleEvent: updateTileFocus };
  const tileInputUpdater = { handleEvent: updateAttemptLetters };
  return () => ({
    view,
    oninit: () => getSession(true)
      .then((newSession) => { session = newSession; }),
  });

  function view() {
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
      m('.hgt-1-3.typo-s-ctr.mgn-t-0-5.mgn-b-0-5', [
        getStatusLabel(session.attemptStatus),
      ]),
      session.attemptStatus === AttemptStatus.initial
        && session.attempts.length < 1
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
  if (attemptWord !== session.answer) {
    const maybeStartTile = document.querySelector('input.try:first-of-type');
    if (!isHTMLInputElement(maybeStartTile)) {
      console.error('Unexpected error.  Cannot find word tiles.');
      return false;
    }
    session.attemptLetters = session.answer.split('').map(() => '');
    session.attempts.push(attemptWord);
    maybeStartTile.focus();
    session.attemptStatus = session.attempts.length < 6
      ? AttemptStatus.fail
      : AttemptStatus.over;
    m.redraw();
    return true;
  }

  session.attemptStatus = AttemptStatus.success;
  m.redraw();
  return true;
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
  if (isMock) {
    await new Promise((resolve) => { setTimeout(resolve, 2000); });
    const question = 'nsmakmiler';
    const mock = {
      question,
      answer: 'slammerkin',
      questionTiles: getNewQuestionTiles(question),
      attemptLetters: question.split('').map(() => ''),
      attempts: [],
      // attempts: [ 'nsmakmile1', 'nsmakmile2', 'nsmakmile3' ],
      attemptStatus: AttemptStatus.initial,
    };
    const mockPromise = Promise.resolve(mock);
    mockPromise.then(() => {
      m.redraw();
    });
    return mockPromise;
  }

  const question = 'gdo';
  const mock = {
    question,
    answer: 'dog',
    questionTiles: getNewQuestionTiles(question),
    attemptLetters: question.split('').map(() => ''),
    attempts: [],
    attemptStatus: AttemptStatus.initial,
  };
  const mockPromise = Promise.resolve(mock);
  mockPromise.then(() => m.redraw());
  return mockPromise;
}

function getStatusLabel(status: AttemptStatus) {
  const labelMap: Record<AttemptStatus, string> = {
    [AttemptStatus.initial]: 'Try to solve the shuffled word within six turns.  Best of luck!',
    [AttemptStatus.attempting]: '',
    [AttemptStatus.badAttempt]: 'Some tiles are empty.  Please fill them up.',
    [AttemptStatus.success]: 'Congratulations!',
    [AttemptStatus.fail]: 'Sorry, try again.',
    [AttemptStatus.over]: 'Used up all the attempts. Try again tomorrow.',
  };
  return labelMap[status];
}

function updateTileFocus(event: KeyboardEvent) {
  const { currentTarget, key } = event;
  if (!isHTMLInputElement(currentTarget)) {
    return;
  }

  if (key === 'Enter') {
    if (currentTarget.value === '') {
      return;
    }
    updateUsedTiles(event);
    if (isHTMLElement(currentTarget.nextElementSibling)) {
      currentTarget.nextElementSibling.focus();
      return;
    }
    if (checkAttempt(session.attemptLetters)) {
      session.questionTiles = getNewQuestionTiles(session.question);
    }
    return;
  }

  const dataIndex = Number(currentTarget.getAttribute('data-index'));
  if (Number.isNaN(dataIndex)) {
    console.error('Unexpected empty value for tile index');
    return;
  }

  if (key === 'Backspace') {
    maybeDisableIsUsedOnTiles(session.questionTiles, session.attemptLetters[dataIndex]);
    session.attemptLetters[dataIndex] = '';
    if (isHTMLElement(currentTarget.previousElementSibling)) {
      currentTarget.previousElementSibling.focus();
    }
    // return;
  }
  // console.log('key', key, currentTarget.getAttribute('data-index'), currentTarget.value);
}

function updateUsedTiles({ currentTarget }: Event) {
  if (!isHTMLInputElement(currentTarget)) {
    console.error('Unexpected wrong element type for updating attempt tiles.');
    return;
  }
  maybeEnableIsUsedOnTiles(session.questionTiles, currentTarget.value);
  if (session.attemptStatus !== AttemptStatus.attempting) {
    session.attemptStatus = AttemptStatus.attempting;
  }
}

function updateAttemptLetters({ currentTarget, data }: InputEvent) {
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
    maybeDisableIsUsedOnTiles(session.questionTiles, session.attemptLetters[dataIndex]);
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

function maybeDisableIsUsedOnTiles(tiles: QuestionTile[], attemptLetter: string) {
  const maybeMatchedTile = tiles.findLast(
    ({ letter, isUsedInAttempt }) => attemptLetter === letter && isUsedInAttempt,
  );
  if (!!maybeMatchedTile) {
    maybeMatchedTile.isUsedInAttempt = false;
  }
}

function maybeEnableIsUsedOnTiles(tiles: QuestionTile[], attemptLetter: string) {
  const maybeMatchedTile = tiles.find(
    ({ letter, isUsedInAttempt }) => attemptLetter === letter && !isUsedInAttempt,
  );
  if (!!maybeMatchedTile) {
    maybeMatchedTile.isUsedInAttempt = true;
  }
}
