import { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import type { Question, QuestionOption, QuestionType } from '../../lib/database.types'

interface QuestionEditorProps {
  question: Question & { options: QuestionOption[] }
  questionNumber: number
  totalQuestions: number
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onUpdateOption: (optionId: string, updates: Partial<QuestionOption>) => void
  onAddOption: () => void
  onSetCorrectOption: (optionId: string) => void
  onSave: () => void
  hasUnsavedChanges: boolean
  isSaving: boolean
}

export function QuestionEditor({
  question,
  questionNumber,
  totalQuestions,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateOption,
  onAddOption,
  onSetCorrectOption,
  onSave,
  hasUnsavedChanges,
  isSaving,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const colorKeys = ['red', 'blue', 'yellow', 'green'] as const

  const handleTypeChange = (type: QuestionType) => {
    onUpdate({ type })
  }

  return (
    <Card className={`${question.is_warmup ? 'ring-2 ring-answer-yellow/50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-white font-bold">
            {questionNumber}
          </span>
          <div className="flex items-center gap-2">
            {question.is_warmup && (
              <span className="px-2 py-0.5 bg-answer-yellow/20 text-answer-yellow text-xs rounded-full">
                Just for fun!
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                Unsaved
              </span>
            )}
            <span className="text-white/60 text-sm">
              {question.type === 'true_false' ? 'True/False' : 'Multiple Choice'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              className="px-3"
            >
              Save
            </Button>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={questionNumber === 1}
              className="px-2"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={questionNumber === totalQuestions}
              className="px-2"
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2"
            >
              {isExpanded ? '−' : '+'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="px-2 text-error hover:bg-error/20"
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Question Text */}
          <Input
            label="Question"
            value={question.question_text}
            onChange={(e) => onUpdate({ question_text: e.target.value })}
            placeholder="Enter your question..."
          />

          {/* Question Type & Warmup Toggle */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('multiple_choice')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  question.type === 'multiple_choice'
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('true_false')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  question.type === 'true_false'
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                True/False
              </button>
            </div>

            <div className="flex-1" />

            <Toggle
              label="Warmup Question"
              description="No points awarded"
              checked={question.is_warmup}
              onChange={(checked) => onUpdate({ is_warmup: checked })}
            />
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">
              Answers (click a shape to mark correct)
            </label>

            {question.type === 'true_false' ? (
              <div className="grid grid-cols-2 gap-3">
                {question.options
                  .filter((o) => o.option_text === 'True' || o.option_text === 'False')
                  .sort((a) => (a.option_text === 'True' ? -1 : 1))
                  .map((option, index) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      color={index === 0 ? 'green' : 'red'}
                      onClick={() => onSetCorrectOption(option.id)}
                    />
                  ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.slice(0, 4).map((option, index) => (
                    <div key={option.id} className="flex gap-2">
                      <OptionButton
                        option={option}
                        color={colorKeys[index]}
                        onClick={() => onSetCorrectOption(option.id)}
                        className="flex-1"
                      />
                      <Input
                        value={option.option_text}
                        onChange={(e) =>
                          onUpdateOption(option.id, { option_text: e.target.value })
                        }
                        className="flex-1"
                        placeholder={`Answer choice ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                {question.options.length < 4 && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={onAddOption}
                    >
                      + Add answer choice
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div className="text-white/60 truncate">
          {question.question_text || 'Untitled question'}
        </div>
      )}
    </Card>
  )
}

interface OptionButtonProps {
  option: QuestionOption
  color: 'red' | 'blue' | 'yellow' | 'green'
  onClick: () => void
  className?: string
}

function OptionButton({ option, color, onClick, className = '' }: OptionButtonProps) {
  const colorClasses = {
    red: `bg-answer-red ${option.is_correct ? 'ring-2 ring-white' : 'opacity-60'}`,
    blue: `bg-answer-blue ${option.is_correct ? 'ring-2 ring-white' : 'opacity-60'}`,
    yellow: `bg-answer-yellow ${option.is_correct ? 'ring-2 ring-white' : 'opacity-60'}`,
    green: `bg-answer-green ${option.is_correct ? 'ring-2 ring-white' : 'opacity-60'}`,
  }

  const icons = {
    red: '▲',
    blue: '◆',
    yellow: '●',
    green: '■',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-3 rounded-lg transition-all
        flex items-center justify-center gap-2
        text-white font-bold text-sm
        hover:opacity-100
        ${colorClasses[color]}
        ${className}
      `}
      title={option.is_correct ? 'Correct answer' : 'Click to mark as correct'}
    >
      <span>{icons[color]}</span>
      {option.is_correct && <span>✓</span>}
    </button>
  )
}
