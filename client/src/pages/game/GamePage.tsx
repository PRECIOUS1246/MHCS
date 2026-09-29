import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';

type Celebrity = {
  name: string;
  image: string;
  options: string[];
  region: string;
};

export type CopingQuestion = {
  scenario: string;
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
};

const celebrityFallbackImage =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';

const celebrities: Celebrity[] = [
  {
    name: 'Tom Hanks',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/TomHanksPrincEdw031223_%2811_of_41%29_%28cropped%29.jpg',
    options: ['Tom Hanks', 'Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise'],
    region: 'Hollywood',
  },
  {
    name: 'Angelina Jolie',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Angelina_Jolie-643531_%28cropped%29.jpg',
    options: ['Angelina Jolie', 'Jennifer Aniston', 'Julia Roberts', 'Cate Blanchett'],
    region: 'Hollywood',
  },
  {
    name: 'Leonardo DiCaprio',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg',
    options: ['Leonardo DiCaprio', 'Matt Damon', 'Will Smith', 'Ryan Gosling'],
    region: 'Hollywood',
  },
  {
    name: 'Margot Robbie',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Margot_Robbie_Wuthering_Heights_premiere.jpg',
    options: ['Margot Robbie', 'Emma Stone', 'Scarlett Johansson', 'Anne Hathaway'],
    region: 'Hollywood',
  },
  {
    name: 'Dwayne Johnson',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg',
    options: ['Dwayne Johnson', 'Vin Diesel', 'Ryan Reynolds', 'Jason Statham'],
    region: 'Hollywood',
  },
  {
    name: 'Shah Rukh Khan',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg',
    options: ['Shah Rukh Khan', 'Aamir Khan', 'Salman Khan', 'Ranbir Kapoor'],
    region: 'Bollywood',
  },
  {
    name: 'Deepika Padukone',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Deepika_Padukone_2025_%281%29.png',
    options: ['Deepika Padukone', 'Priyanka Chopra', 'Kareena Kapoor', 'Anushka Sharma'],
    region: 'Bollywood',
  },
  {
    name: 'Amitabh Bachchan',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Indian_actor_Amitabh_Bachchan.jpg',
    options: ['Amitabh Bachchan', 'Hrithik Roshan', 'Akshay Kumar', 'Saif Ali Khan'],
    region: 'Bollywood',
  },
  {
    name: 'Priyanka Chopra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Priyanka_Chopra_at_Bulgary_launch%2C_2024_%28cropped%29.jpg',
    options: ['Priyanka Chopra', 'Kajol', 'Vidya Balan', 'Kangana Ranaut'],
    region: 'Bollywood',
  },
  {
    name: 'Ranveer Singh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Ranveer_Singh_in_2023_%281%29_%28cropped%29.jpg',
    options: ['Ranveer Singh', 'Varun Dhawan', 'Arjun Kapoor', 'Vicky Kaushal'],
    region: 'Bollywood',
  },
];

export const copingQuestions: CopingQuestion[] = [
  {
    scenario: 'You have several assignments due and feel stuck getting started.',
    prompt: 'What is one manageable next step?',
    answer: 'Choose one small task and work on it for ten minutes.',
    options: [
      'Choose one small task and work on it for ten minutes.',
      'Try to finish every assignment in one sitting.',
      'Wait until you feel completely motivated.',
      'Give up your break and sleep to make more time.',
    ],
    explanation: 'Breaking a large task into a small first step can make it easier to begin. Adjust the timing to suit you.',
  },
  {
    scenario: 'You notice your body feeling tense before a presentation.',
    prompt: 'What could help you pause for a moment?',
    answer: 'Put your feet on the floor and take a few comfortable, slow breaths.',
    options: [
      'Put your feet on the floor and take a few comfortable, slow breaths.',
      'Tell yourself that feeling nervous means you will fail.',
      'Rush through the presentation without pausing.',
      'Avoid every future presentation.',
    ],
    explanation: 'A brief grounding pause may help you settle and focus on the next step. It is okay if nerves are still there.',
  },
  {
    scenario: 'You have had a difficult day and feel disconnected from others.',
    prompt: 'What is a small way to seek support?',
    answer: 'Message someone you trust and let them know you could use a check-in.',
    options: [
      'Message someone you trust and let them know you could use a check-in.',
      'Assume you are bothering everyone and stay silent.',
      'Wait until you can explain everything perfectly.',
      'Compare your day with someone else’s and dismiss your feelings.',
    ],
    explanation: 'Reaching out can be as simple as asking someone to listen. You do not need to have everything figured out first.',
  },
  {
    scenario: 'You have been studying for a long time and your focus is fading.',
    prompt: 'What could make the next study block more manageable?',
    answer: 'Take a short screen-free break, then choose one clear task to return to.',
    options: [
      'Take a short screen-free break, then choose one clear task to return to.',
      'Keep working without a break until everything is done.',
      'Add more tasks to your list before continuing.',
      'Decide that needing a break means you are not working hard enough.',
    ],
    explanation: 'A brief reset and a clear next task can make it easier to re-engage. Breaks are a normal part of studying.',
  },
  {
    scenario: 'You made a mistake on a task and keep replaying it in your mind.',
    prompt: 'What is a kind and useful way to respond?',
    answer: 'Talk to yourself as you would to a friend, then choose one thing to learn from it.',
    options: [
      'Talk to yourself as you would to a friend, then choose one thing to learn from it.',
      'Decide one mistake defines how capable you are.',
      'Hide the mistake and refuse to ask questions.',
      'Keep replaying it until you feel worse.',
    ],
    explanation: 'Self-kindness can make it easier to reflect without turning one moment into a judgment about yourself.',
  },
  {
    scenario: 'A change of plans leaves you feeling overwhelmed.',
    prompt: 'How could you find a manageable next step?',
    answer: 'Separate what you can control from what you cannot, then choose one next action.',
    options: [
      'Separate what you can control from what you cannot, then choose one next action.',
      'Try to solve every possible problem immediately.',
      'Blame yourself for not predicting the change.',
      'Avoid making any plan at all.',
    ],
    explanation: 'Focusing on one part you can influence may make an unexpected situation feel more workable.',
  },
  {
    scenario: 'A conversation with a friend felt tense, and you want to respond right away.',
    prompt: 'What might help you respond thoughtfully?',
    answer: 'Take a pause, then describe how you felt and ask to talk when you are both ready.',
    options: [
      'Take a pause, then describe how you felt and ask to talk when you are both ready.',
      'Send the first angry message that comes to mind.',
      'Assume you know exactly what the other person meant.',
      'Decide the friendship is over without talking.',
    ],
    explanation: 'A pause can create room to explain your perspective clearly and hear the other person too.',
  },
  {
    scenario: 'You notice you have been scrolling and feel more overloaded by the news.',
    prompt: 'What is a small boundary you could try?',
    answer: 'Step away from the screen for a while and choose when you will check again.',
    options: [
      'Step away from the screen for a while and choose when you will check again.',
      'Keep scrolling until you know every update.',
      'Read several feeds at the same time.',
      'Tell yourself you should never take a break from the news.',
    ],
    explanation: 'Choosing a time to check updates can help you stay informed while protecting time for other things.',
  },
  {
    scenario: 'You feel isolated in a new class or group.',
    prompt: 'What is one low-pressure way to connect?',
    answer: 'Say hello to one person or join a group activity that interests you.',
    options: [
      'Say hello to one person or join a group activity that interests you.',
      'Wait until you feel completely confident before speaking.',
      'Assume everyone already has enough friends.',
      'Force yourself to become close friends with everyone at once.',
    ],
    explanation: 'Small, repeated interactions can be a gentle way to get to know people over time.',
  },
  {
    scenario: 'You are stressed and having trouble figuring out what you need.',
    prompt: 'What is a useful first check-in?',
    answer: 'Pause and check whether water, food, rest, movement, or support would help right now.',
    options: [
      'Pause and check whether water, food, rest, movement, or support would help right now.',
      'Ignore every need until all your tasks are finished.',
      'Judge yourself for feeling stressed.',
      'Add more tasks to your list before taking a pause.',
    ],
    explanation: 'A quick check-in can help you notice a basic need and decide on one small way to respond.',
  },
];

export const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

export const buildQuiz = <T extends { name: string; options?: string[] }>(items: T[]) =>
  shuffleArray(items).map((item) => ({
    ...item,
    ...(item.options ? { options: shuffleArray(item.options) } : {}),
  }));

export const buildCopingQuiz = (items: CopingQuestion[]) =>
  shuffleArray(items).map((item) => ({ ...item, options: shuffleArray(item.options) }));

const GameModeSelector = ({
  activeGame,
  onSelect,
}: {
  activeGame: 'celebrity' | 'coping';
  onSelect: (game: 'celebrity' | 'coping') => void;
}) => (
  <div role="tablist" aria-label="Choose a game" className="flex gap-2 rounded-xl border border-violet-200/70 bg-white/80 p-1.5 dark:border-violet-700/60 dark:bg-[#261e37]/80">
    {([
      ['celebrity', 'Guess the Celebrity'],
      ['coping', 'Coping Skills Match'],
    ] as const).map(([game, label]) => (
      <button
        key={game}
        type="button"
        role="tab"
        aria-selected={activeGame === game}
        onClick={() => onSelect(game)}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          activeGame === game
            ? 'bg-violet-700 text-white shadow-sm'
            : 'text-slate-600 hover:bg-violet-50 dark:text-violet-100 dark:hover:bg-white/5'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const CopingSkillsGame = () => {
  const [quiz, setQuiz] = useState(() => buildCopingQuiz(copingQuestions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const current = quiz[currentIndex];

  const restart = () => {
    setQuiz(buildCopingQuiz(copingQuestions));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
  };

  const handleAnswer = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === current.answer) setScore((previous) => previous + 1);
  };

  const continueRound = () => {
    if (currentIndex === quiz.length - 1) {
      setComplete(true);
      return;
    }
    setCurrentIndex((previous) => previous + 1);
    setSelected(null);
  };

  if (complete) {
    return (
      <Card className="space-y-5 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-300" />
        <div>
          <h2 className="text-xl font-semibold">Round complete</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">You matched {score} of {quiz.length} helpful next steps.</p>
        </div>
        <button type="button" onClick={restart} className="btn-primary inline-flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Play again
        </button>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-violet-700/60 dark:bg-[#261e37]/80">
        <div>
          <p className="text-xs font-semibold uppercase text-violet-700 dark:text-violet-200">Round {currentIndex + 1} of {quiz.length}</p>
          <h1 className="mt-1 text-lg font-display font-bold md:text-xl">Coping Skills Match</h1>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">Score: {score}</span>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-900 via-violet-700 to-indigo-700 px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase text-violet-200">A common situation</p>
          <h2 className="mt-2 text-lg font-semibold md:text-xl">{current.scenario}</h2>
          <p className="mt-2 text-sm text-violet-100">{current.prompt}</p>
        </div>
        <div className="space-y-3 p-4 md:p-5">
          <div className="grid gap-2.5">
            {current.options.map((option) => {
              const isSelected = selected === option;
              const isAnswer = current.answer === option;
              const resultStyle = selected === null
                ? 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                : isAnswer
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                  : isSelected
                    ? 'border-amber-400 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                    : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400';

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${resultStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div role="status" className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-100">
              <p className="font-semibold">{selected === current.answer ? 'Good match' : 'One helpful option'}</p>
              <p className="mt-1">{current.explanation}</p>
              <button type="button" onClick={continueRound} className="btn-primary mt-4">
                {currentIndex === quiz.length - 1 ? 'See results' : 'Next scenario'}
              </button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export const GamePage = () => {
  const [activeGame, setActiveGame] = useState<'celebrity' | 'coping'>('celebrity');
  const [quiz, setQuiz] = useState<Celebrity[]>(() => buildQuiz(celebrities));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = quiz[currentIndex];

  if (activeGame === 'coping') {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <GameModeSelector activeGame={activeGame} onSelect={setActiveGame} />
        <CopingSkillsGame />
      </div>
    );
  }

  const nextQuestion = () => {
    if (currentIndex === quiz.length - 1) {
      setQuiz(buildQuiz(celebrities));
      setCurrentIndex(0);
      setSelected(null);
      setShowAnswer(false);
      setScore(0);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const handleAnswer = (answer: string) => {
    if (showAnswer) {
      return;
    }

    setSelected(answer);
    setShowAnswer(true);

    if (answer === current.name) {
      setScore((prev) => prev + 1);
    }

    window.setTimeout(() => {
      nextQuestion();
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <GameModeSelector activeGame={activeGame} onSelect={setActiveGame} />
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-200/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-violet-700/60 dark:bg-[#261e37]/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-200">
          <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] uppercase tracking-[0.2em] dark:bg-violet-900/60">Round</span>
          <span>{currentIndex + 1}</span>
        </div>
        <h1 className="text-base font-display font-bold md:text-xl">Guess the Celebrity</h1>
        <div className="rounded-full bg-violet-100 px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
          Score: {score} / {quiz.length}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-900 via-violet-700 to-indigo-700 px-4 py-2.5 text-white md:px-5">
          <h2 className="text-lg font-semibold md:text-xl">Who is this celebrity?</h2>
        </div>

        <div className="p-3 md:p-4">
          <div className="mb-4 overflow-hidden rounded-2xl border border-violet-200 bg-slate-100 shadow-inner dark:border-violet-500/20 dark:bg-slate-900">
            <img
              src={current.image}
              alt={current.name}
              className="h-52 w-full object-cover sm:h-56 md:h-64"
              onError={(event) => {
                const target = event.currentTarget as HTMLImageElement;
                if (!target.dataset.fallbackApplied) {
                  target.dataset.fallbackApplied = 'true';
                  target.src = celebrityFallbackImage;
                }
              }}
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {current.options.map((option) => {
              const isCorrect = option === current.name;
              const isSelected = option === selected;

              let classes = 'justify-start border text-left text-base font-medium';

              if (showAnswer) {
                if (isCorrect) classes += ' border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
                else if (isSelected && !isCorrect) classes += ' border-red-400 bg-red-500/10 text-red-700 dark:text-red-200';
                else classes += ' border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';
              } else {
                classes += isSelected
                  ? ' border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-200'
                  : ' border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={showAnswer}
                  className={`${classes} rounded-xl px-4 py-3 transition-all`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-100">
              <span className="font-semibold">Answer:</span> {current.name} <span className="text-violet-600 dark:text-violet-200">({current.region})</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {showAnswer ? 'Loading next question...' : 'Choose the correct celebrity'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
