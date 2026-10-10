import { useState } from 'react';
import {
  Button, Select, Input, CodeBlock,
  LoadingState, EmptyState, ErrorState,
  DemoBanner, ServerOfflineBanner, SamplePrompts, ResultSection, Badge, CopyButton,
} from '../components/ui';
import { learnConcept } from '../services/aiService';
import SmartActionPlan from '../components/SmartActionPlan';

const MAX_TOPIC_LENGTH = 300;

const DIFFICULTIES = [
  { value: 'Beginner', label: '🌱 Beginner' },
  { value: 'Intermediate', label: '🚀 Intermediate' },
  { value: 'Advanced', label: '⚡ Advanced' },
];

const SAMPLE_TOPICS = [
  { label: 'JS Closures', topic: 'Closures in JavaScript', difficulty: 'Intermediate' },
  { label: 'Async/Await', topic: 'Async/Await and Promises', difficulty: 'Intermediate' },
  { label: 'Big O Notation', topic: 'Big O Notation and Time Complexity', difficulty: 'Beginner' },
  { label: 'Binary Trees', topic: 'Binary Search Trees', difficulty: 'Intermediate' },
  { label: 'React Hooks', topic: 'React useState and useEffect Hooks', difficulty: 'Beginner' },
  { label: 'Design Patterns', topic: 'Observer Design Pattern', difficulty: 'Advanced' },
];

export default function LearnMode() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleLearn = async () => {
    if (!topic.trim()) return;
    if (topic.length > MAX_TOPIC_LENGTH) {
      setErrorMsg(`Topic is too long. Maximum is ${MAX_TOPIC_LENGTH} characters.`);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const data = await learnConcept({ topic, difficulty });
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleSample = (prompt) => {
    setTopic(prompt.topic);
    setDifficulty(prompt.difficulty);
    setResult(null);
    setStatus('idle');
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (qIdx, aIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < (result?.quiz?.length || 0)) return;
    setQuizSubmitted(true);
  };

  const quizScore = result?.quiz
    ? result.quiz.filter((q, i) => quizAnswers[i] === q.answer).length
    : 0;

  const difficultyColor = { Beginner: 'green', Intermediate: 'orange', Advanced: 'purple' };

  return (
    <div className="space-y-6">
      {status === 'error' && errorMsg.includes('DevSaathi server')
        ? <ServerOfflineBanner />
        : <DemoBanner isDemo={result ? !!result._demo : true} />
      }

      {/* Input panel */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3]">What do you want to learn?</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Enter any programming concept, data structure, algorithm, or technology</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={topic}
            onChange={setTopic}
            placeholder="e.g. Closures in JavaScript, Big O notation, SQL JOINs…"
            label="Topic"
            className="flex-1"
          />
          <Select
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTIES}
            label="Difficulty"
            className="sm:w-44"
          />
        </div>

        <SamplePrompts
          prompts={SAMPLE_TOPICS}
          onSelect={handleSample}
          label="Popular topics"
        />

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleLearn}
            disabled={!topic.trim()}
            loading={status === 'loading'}
            variant="success"
            size="lg"
          >
            {status === 'loading' ? 'Generating lesson…' : '📚 Learn This'}
          </Button>
          {status === 'success' && (
            <Badge variant={difficultyColor[difficulty]} className="ml-auto">
              {difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Output */}
      {status === 'idle' && !result && (
        <EmptyState
          icon="📚"
          title="Your lesson will appear here"
          description="Enter any concept above — closures, async/await, Big O — and get a structured explanation with examples and a quiz."
        />
      )}

      {status === 'loading' && <LoadingState message="Generating your lesson…" />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={handleLearn} />}

      {status === 'success' && result && (
        <div className="space-y-4">
          {/* Title bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-[#e6edf3]">{result.title || topic}</h2>
              <Badge variant={difficultyColor[difficulty]} className="mt-1">{difficulty} Level</Badge>
            </div>
            <CopyButton text={[result.explanation, result.analogy, result.codeExample, ...(result.keyTakeaways || [])].filter(Boolean).join('\n\n')} />
          </div>

          {/* Explanation */}
          <ResultSection title="Explanation" icon="📖" copyText={result.explanation}>
            <div className="space-y-2">
              {result.explanation?.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-[#e6edf3] leading-relaxed">{para}</p>
              ))}
            </div>
          </ResultSection>

          {/* Analogy */}
          {result.analogy && (
            <ResultSection title="Real-World Analogy" icon="💬" copyText={result.analogy}>
              <div className="flex gap-3">
                <div className="text-2xl flex-shrink-0">🧠</div>
                <p className="text-sm text-[#c9d1d9] leading-relaxed italic">"{result.analogy}"</p>
              </div>
            </ResultSection>
          )}

          {/* Code Example */}
          {result.codeExample && (
            <CodeBlock code={result.codeExample} language="JavaScript" label="Code Example" />
          )}

          {/* Key Takeaways */}
          {result.keyTakeaways?.length > 0 && (
            <ResultSection title="Key Takeaways" icon="⭐">
              <ul className="space-y-2.5">
                {result.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#d29922] flex-shrink-0 mt-0.5">★</span>
                    <span className="text-sm text-[#c9d1d9] leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}

          {/* Quiz */}
          {result.quiz?.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-[#21262d]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wide">Quick Quiz</span>
                </div>
                {quizSubmitted && (
                  <Badge variant={quizScore === result.quiz.length ? 'green' : quizScore >= result.quiz.length / 2 ? 'orange' : 'red'}>
                    {quizScore}/{result.quiz.length} correct
                  </Badge>
                )}
              </div>

              <div className="p-4 space-y-6">
                {result.quiz.map((q, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium text-[#e6edf3] mb-3">
                      <span className="text-[#484f58] mr-2">Q{qi + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = quizAnswers[qi] === oi;
                        const isCorrect = q.answer === oi;
                        let style = 'bg-[#21262d] border-[#30363d] text-[#8b949e]';
                        if (quizSubmitted) {
                          if (isCorrect) style = 'bg-[#23863620] border-[#2ea04360] text-[#3fb950]';
                          else if (isSelected && !isCorrect) style = 'bg-[#da363320] border-[#da363360] text-[#f85149]';
                          else style = 'bg-[#21262d] border-[#30363d] text-[#484f58]';
                        } else if (isSelected) {
                          style = 'bg-[#388bfd20] border-[#388bfd60] text-[#58a6ff]';
                        }
                        return (
                          <button
                            key={oi}
                            onClick={() => handleQuizAnswer(qi, oi)}
                            disabled={quizSubmitted}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer ${style} ${!quizSubmitted ? 'hover:border-[#484f58] hover:text-[#e6edf3]' : ''}`}
                          >
                            <span className="text-[#484f58] mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted ? (
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < result.quiz.length}
                    variant="primary"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    quizScore === result.quiz.length
                      ? 'bg-[#23863620] border-[#2ea04360]'
                      : quizScore >= result.quiz.length / 2
                      ? 'bg-[#9e6a0310] border-[#d2992240]'
                      : 'bg-[#da363310] border-[#da363340]'
                  }`}>
                    <span className="text-2xl">
                      {quizScore === result.quiz.length ? '🎉' : quizScore >= result.quiz.length / 2 ? '👍' : '📖'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#e6edf3]">
                        {quizScore === result.quiz.length
                          ? 'Perfect score! You nailed it.'
                          : quizScore >= result.quiz.length / 2
                          ? `Good effort — ${quizScore}/${result.quiz.length} correct!`
                          : `${quizScore}/${result.quiz.length} — review the explanation above and try again.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Smart Action Plan */}
          <SmartActionPlan mode="learn" topic={topic} difficulty={difficulty} result={result} />
        </div>
      )}
    </div>
  );
}
