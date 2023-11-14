import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getLoading from '../Loading.js';
import { getStrictAttributeModel, type StrictAttributeModel } from '../../models/AttributeModel.js';
import { AttemptStatus, emptySession, getNewQuestionTiles, getSession, updateSession, type BaseSession, type QuestionTile, type Session } from '../../models/WordShuffle.js';

const Loading = getLoading();
const tileSel = '.wid-1-0.pad-0-5.mgn-b-0-5.box-w-1.box-rad-0-25.box-s-s';
const buttonSel = '.wid-4-0.dsp-b.sur-bg-100-h101.box-s-n.box-rad-0-25.pad-t-0-75.pad-b-0-75.pad-l-1-0.pad-r-1-0';

const attemptCountsBeforeHints = 1;
export default function getWordShuffle(): m.ClosureComponent {
  const sessionModel = getStrictAttributeModel<Session>(emptySession);
  const AttemptInputs = getAttemptInputs(sessionModel);
  let isNextChallengeDeclined = false;

  return () => ({
    view,
    oninit: () => getSession(window.env === 'dev', 0)
      .then((newSession) => {
        sessionModel.set(newSession);
        isNextChallengeDeclined = newSession.isNextChallengeDeclined;
      }),
  });

  function view() {
    const { attempts, attemptStatus, definitions, questionRound } = sessionModel.value;
    const { value: session } = sessionModel;

    if (sessionModel.value.attemptStatus === AttemptStatus.pendingLoad) {
      return m(Loading);
    }

    const isChallengeOver = (attemptStatus & AttemptStatus.over) === AttemptStatus.over;

    return m('', [
      m(QuestionTiles, { session }),
      m(AttemptInputs),
      m('.min-hgt-1-3.typo-s-ctr.mgn-t-0-5', [
        getStatusLabel(attemptStatus).map(
          (label) => m('.mgn-l-1-0.mgn-r-1-0.mgn-b-0-5', label),
        ),
      ]),
      attemptStatus !== AttemptStatus.success
        || questionRound === 3
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
            getSession(window.env === 'dev', questionRound + 1)
              .then((newSession) => { sessionModel.set(newSession); });
            sessionModel.set(emptySession);
          },
        }),
      (attempts.length === attemptCountsBeforeHints && isChallengeOver)
        || attempts.length < attemptCountsBeforeHints
        || definitions.length === 0
        ? null
        : m(Definition, { session }),

      attemptStatus === AttemptStatus.initial
        || attempts.length < 1
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

function getAttemptInputs(sessionModel: StrictAttributeModel<Session>): m.ClosureComponent {
  const tileSwitcher = {
    handleEvent: (event: KeyboardEvent) => updateTileFocus(sessionModel, event),
  };
  const tileInputUpdater = {
    handleEvent: (event: InputEvent & { redraw: boolean; }) => {
      updateAttemptLetters(sessionModel, event);
    },
  };

  return () => ({ view });

  function view() {
    const { answer, attemptLetters, attemptStatus, questionTiles } = sessionModel.value;
    const isDisabled = (attemptStatus & AttemptStatus.over) === AttemptStatus.over;
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

    return m('.mgn-t-4-0.mgn-b-2-0.typo-s-ctr', attemptLetters
      .map((attemptLetter, index) => {
        const marginSel = getMarginClass(index, answer.length);
        const inputSel = `input.try${questionAnswerTileSel}${maybeDisabledClasses}${marginSel}`;
        return m(inputSel, {
          ...baseInputAttr,
          value: attemptLetter, // keep letter as what is typed to lessen confusion
          'data-index': index,
          autofocus: index === 0,
          placeholder: isDisabled
            ? answer[index].toLocaleUpperCase()
            : '',
          enterkeyhint: index === questionTiles.length - 1
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

function updateTileFocus(
  sessionModel: StrictAttributeModel<Session>,
  event: KeyboardEvent,
) {
  const { currentTarget, key } = event;

  if (!isHTMLInputElement(currentTarget)) {
    return;
  }

  const { attemptLetters, attemptStatus, question, questionTiles } = sessionModel.value;
  const newSession = { ...sessionModel.value };

  newSession.questionTiles = getUpdatedQuestionTiles(questionTiles, attemptLetters);

  const isDisabled = (attemptStatus & AttemptStatus.over) === AttemptStatus.over;
  if (!attemptLetters.every((letter) => letter === '')
    && !isDisabled) {
    newSession.attemptStatus = AttemptStatus.attempting;
  }

  if (key === 'Enter') {
    if (currentTarget.value === '') {
      sessionModel.set(newSession);
      return;
    }

    if (attemptLetters.every((letter) => letter !== '')) {
      const { attemptLetters: checkedAttemptLetters,
        attempts,
        attemptStatus: checkedAttemptStatus } = checkAttempt(newSession, attemptLetters);
      newSession.attemptLetters = checkedAttemptLetters;
      newSession.attempts = attempts;
      newSession.attemptStatus = checkedAttemptStatus;

      if (checkedAttemptStatus !== AttemptStatus.badAttempt) {
        newSession.questionTiles = getNewQuestionTiles(question);
        updateSession(newSession);
      }
    }

    if (isHTMLElement(currentTarget.nextElementSibling)) {
      currentTarget.nextElementSibling.focus();
    }

    sessionModel.set(newSession);
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
  }

  sessionModel.set(newSession);
}

function checkAttempt(
  session: Session, attempt: string[],
) {
  if (attempt.some((letter) => letter === '')) {
    return !tryRefocusOnEmptyTile(attempt)
      ? session
      : { ...session, attemptStatus: AttemptStatus.badAttempt };
  }

  const { answer, attempts, questionRound } = session;
  const attemptWord = attempt.join('');
  attempts.push(attemptWord);

  const isAttemptTheAnswer = attemptWord.toLocaleLowerCase() === answer.toLocaleLowerCase();
  if (!isAttemptTheAnswer && !tryRefocusOnStartTile()) {
    return session;
  }

  return {
    ...session,
    attemptLetters: isAttemptTheAnswer
      ? attempt
      : answer.split('').map(() => ''),
    attempts,
    attemptStatus: getCheckedAttemptStatus(isAttemptTheAnswer, attempts.length, questionRound),
  };
}

function tryRefocusOnEmptyTile(attempt: string[]) {
  const emptyIndex = attempt.findIndex((letter) => letter === '');
  const nthTileSelector = `input.try:nth-of-type(${emptyIndex + 1})`;
  const maybeEmptyTile = document.querySelector(nthTileSelector);
  if (!isHTMLInputElement(maybeEmptyTile)) {
    console.error('Unexpected error.  Cannot find word tiles.');
    return false;
  }
  maybeEmptyTile.focus();
  return true;
}

function tryRefocusOnStartTile() {
  const maybeStartTile = document.querySelector('input.try:first-of-type');
  if (!isHTMLInputElement(maybeStartTile)) {
    console.error('Unexpected error.  Cannot find word tiles.');
    return false;
  }
  maybeStartTile.focus();
  return true;
}

const attemptsLimit = 3;
const challengeLimit = 3;
function getCheckedAttemptStatus(
  isAttemptCorrect: boolean, attemptsCount: number, challengeCount: number,
) {
  if (isAttemptCorrect) {
    return challengeCount < challengeLimit
      ? AttemptStatus.success
      : AttemptStatus.successChallengeOver;
  }
  return attemptsCount < attemptsLimit
    ? AttemptStatus.fail
    : AttemptStatus.over;
}

function updateAttemptLetters(
  sessionModel: StrictAttributeModel<Session>,
  e: InputEvent & { redraw: boolean; },
) {
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

  const session = sessionModel.value;
  const { attemptLetters } = session;
  attemptLetters[dataIndex] = data === '' || data === null
    ? ''
    : currentTarget.value;
  sessionModel.set({ ...session, attemptLetters });
}

function isHTMLElement(target: EventTarget | null): target is HTMLElement {
  return target !== null;
}

function isHTMLInputElement(target: EventTarget | null): target is HTMLInputElement {
  return target !== null && 'value' in target;
}
