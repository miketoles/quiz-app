import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { GameSession, GameParticipant, Question, QuestionOption } from '../lib/database.types'
import { generateGamePin } from '../utils/gamePin'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface GameState {
  // Current game session
  session: GameSession | null
  participants: GameParticipant[]
  questions: (Question & { options: QuestionOption[] })[]
  currentQuestion: (Question & { options: QuestionOption[] }) | null

  // Player state
  participantId: string | null
  hasAnswered: boolean
  selectedOptionId: string | null
  answerStartTime: number | null

  // Realtime subscriptions
  channels: RealtimeChannel[]
  pollTimer: number | null

  // Actions
  createGame: (quizId: string, hostId: string | null, settings: {
    timeLimit: number
    speedScoring: boolean
    pointsPerQuestion: number
    autoAdvance: boolean
  }) => Promise<{ pin: string | null; error: Error | null }>

  joinGame: (pin: string, nickname: string, avatarBase: string, avatarAccessory: string | null) => Promise<{ error: Error | null }>

  startGame: () => Promise<{ error: Error | null }>
  nextQuestion: () => Promise<{ error: Error | null }>
  showResults: () => Promise<{ error: Error | null }>
  endGame: () => Promise<{ error: Error | null }>

  submitAnswer: (optionId: string) => Promise<{ error: Error | null }>

  subscribeToGame: (sessionId: string) => void
  unsubscribeFromGame: () => void

  reset: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  participants: [],
  questions: [],
  currentQuestion: null,
  participantId: null,
  hasAnswered: false,
  selectedOptionId: null,
  answerStartTime: null,
  channels: [],
  pollTimer: null,

  createGame: async (quizId, hostId: string | null, settings) => {
    try {
      const pin = generateGamePin()

      // Create game session
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          quiz_id: quizId,
          host_id: hostId,
          game_pin: pin,
          status: 'lobby' as const,
          time_limit: settings.timeLimit,
          speed_scoring: settings.speedScoring,
          points_per_question: settings.pointsPerQuestion,
          auto_advance: settings.autoAdvance,
        })
        .select()
        .single()

      if (error) throw error

      // Fetch questions for this quiz
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index')

      // Fetch options for all questions
      const questionIds = (questions || []).map(q => q.id)
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index')

      const questionsWithOptions = (questions || []).map(q => ({
        ...q,
        options: (options || []).filter(o => o.question_id === q.id),
      }))

      set({ session, questions: questionsWithOptions })

      // Subscribe to realtime updates
      get().subscribeToGame(session.id)

      return { pin, error: null }
    } catch (error) {
      return { pin: null, error: error as Error }
    }
  },

  joinGame: async (pin, nickname, avatarBase, avatarAccessory) => {
    try {
      // Find game session by PIN
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_pin', pin)
        .eq('status', 'lobby')
        .single()

      if (sessionError) throw new Error('Game not found or already started')

      // Join as participant
      const { data: participant, error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_session_id: session.id,
          nickname,
          avatar_base: avatarBase,
          avatar_accessory: avatarAccessory,
        })
        .select()
        .single()

      if (participantError) throw participantError

      // Fetch questions
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', session.quiz_id)
        .order('order_index')

      // Fetch options for all questions
      const questionIds = (questions || []).map(q => q.id)
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index')

      const questionsWithOptions = (questions || []).map(q => ({
        ...q,
        options: (options || []).filter(o => o.question_id === q.id),
      }))

      set({
        session,
        questions: questionsWithOptions,
        participantId: participant.id,
        // Seed participants immediately so player lobby shows without waiting for realtime
        participants: [participant],
        currentQuestion: questionsWithOptions[session.current_question_index] || null,
      })

      // Subscribe to realtime updates
      get().subscribeToGame(session.id)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  startGame: async () => {
    const { session } = get()
    if (!session) return { error: new Error('No active session') }

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'question',
          current_question_index: 0,
          started_at: new Date().toISOString(),
          question_started_at: new Date().toISOString(),
        })
        .eq('id', session.id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  nextQuestion: async () => {
    const { session, questions } = get()
    if (!session) return { error: new Error('No active session') }

    const nextIndex = session.current_question_index + 1

    if (nextIndex >= questions.length) {
      // No more questions, end game
      return get().endGame()
    }

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'question',
          current_question_index: nextIndex,
          question_started_at: new Date().toISOString(),
        })
        .eq('id', session.id)

      if (error) throw error

      set({ hasAnswered: false, selectedOptionId: null })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  showResults: async () => {
    const { session } = get()
    if (!session) return { error: new Error('No active session') }

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ status: 'results' })
        .eq('id', session.id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  endGame: async () => {
    const { session, participants } = get()
    if (!session) return { error: new Error('No active session') }

    // Determine winner
    const winner = participants.reduce((prev, curr) =>
      (curr.total_score > (prev?.total_score || 0)) ? curr : prev
    , null as GameParticipant | null)

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'finished',
          ended_at: new Date().toISOString(),
          winner_id: winner?.user_id || null,
        })
        .eq('id', session.id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  submitAnswer: async (optionId) => {
    const { session, participantId, currentQuestion, answerStartTime } = get()
    if (!session || !participantId || !currentQuestion || !answerStartTime) {
      return { error: new Error('Invalid state for submitting answer') }
    }

    const responseTimeMs = Date.now() - answerStartTime
    const selectedOption = currentQuestion.options.find(o => o.id === optionId)
    const isCorrect = selectedOption?.is_correct || false

    try {
      const { error } = await supabase
        .from('question_responses')
        .insert({
          game_session_id: session.id,
          participant_id: participantId,
          question_id: currentQuestion.id,
          selected_option_id: optionId,
          is_correct: isCorrect,
          response_time_ms: responseTimeMs,
          points_awarded: 0, // Will be calculated by the host
        })

      if (error) throw error

      set({ hasAnswered: true, selectedOptionId: optionId })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  subscribeToGame: (sessionId) => {
    const { channels } = get()

    // Unsubscribe from existing channels
    channels.forEach(ch => ch.unsubscribe())
    if (get().pollTimer) {
      clearInterval(get().pollTimer!)
      set({ pollTimer: null })
    }

    // Subscribe to game session changes
    const sessionChannel = supabase
      .channel(`game-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newSession = payload.new as GameSession
          const { questions } = get()

          set({
            session: newSession,
            currentQuestion: questions[newSession.current_question_index] || null,
            answerStartTime: newSession.status === 'question' ? Date.now() : null,
            hasAnswered: newSession.status === 'question' ? false : get().hasAnswered,
          })
        }
      )
      .subscribe()

    // Subscribe to participants
    const participantsChannel = supabase
      .channel(`game-participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_session_id=eq.${sessionId}`,
        },
        async () => {
          // Refresh participants list
          const { data } = await supabase
            .from('game_participants')
            .select('*')
            .eq('game_session_id', sessionId)
            .order('total_score', { ascending: false })

          set({ participants: data || [] })
        }
      )
      .subscribe()

    // Fallback polling to keep session/participants fresh (e.g., if realtime is blocked)
    const timer = window.setInterval(async () => {
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionData) {
        const { questions } = get()
        set({
          session: sessionData,
          currentQuestion: questions[sessionData.current_question_index] || null,
          answerStartTime: sessionData.status === 'question' ? Date.now() : null,
          hasAnswered: sessionData.status === 'question' ? false : get().hasAnswered,
        })
      }

      const { data: participantRows } = await supabase
        .from('game_participants')
        .select('*')
        .eq('game_session_id', sessionId)
        .order('total_score', { ascending: false })

      if (participantRows) {
        set({ participants: participantRows })
      }
    }, 2000)

    set({ channels: [sessionChannel, participantsChannel], pollTimer: timer })
  },

  unsubscribeFromGame: () => {
    const { channels } = get()
    channels.forEach(ch => ch.unsubscribe())
    if (get().pollTimer) {
      clearInterval(get().pollTimer!)
    }
    set({ channels: [] })
  },

  reset: () => {
    get().unsubscribeFromGame()
    set({
      session: null,
      participants: [],
      questions: [],
      currentQuestion: null,
      participantId: null,
      hasAnswered: false,
      selectedOptionId: null,
      answerStartTime: null,
      channels: [],
    })
  },
}))
