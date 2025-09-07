import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VotingSession {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'revealing' | 'completed' | 'cancelled';
  startTime: number;
  endTime: number;
  revealTime: number;
  participants: string[];
  totalParticipants: number;
  results?: VotingResults;
  userVote?: UserVote;
}

export interface UserVote {
  commitment: string;
  revealed: boolean;
  voteData?: any;
  timestamp: number;
}

export interface VotingResults {
  totalVotes: number;
  winners: string[];
  distribution: Record<string, number>;
  proof: string;
  calculatedAt: number;
}

export interface VotingState {
  currentSession: VotingSession | null;
  userSessions: VotingSession[];
  allSessions: VotingSession[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: VotingState = {
  currentSession: null,
  userSessions: [],
  allSessions: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setCurrentSession: (state, action: PayloadAction<VotingSession | null>) => {
      state.currentSession = action.payload;
    },
    
    setUserSessions: (state, action: PayloadAction<VotingSession[]>) => {
      state.userSessions = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setAllSessions: (state, action: PayloadAction<VotingSession[]>) => {
      state.allSessions = action.payload;
      state.lastUpdated = Date.now();
    },
    
    addSession: (state, action: PayloadAction<VotingSession>) => {
      state.allSessions.push(action.payload);
      if (action.payload.participants.includes(state.currentSession?.id || '')) {
        state.userSessions.push(action.payload);
      }
    },
    
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<VotingSession> }>) => {
      const { id, updates } = action.payload;
      
      // 更新所有会话列表
      const sessionIndex = state.allSessions.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        state.allSessions[sessionIndex] = { ...state.allSessions[sessionIndex], ...updates };
      }
      
      // 更新用户会话列表
      const userSessionIndex = state.userSessions.findIndex(session => session.id === id);
      if (userSessionIndex !== -1) {
        state.userSessions[userSessionIndex] = { ...state.userSessions[userSessionIndex], ...updates };
      }
      
      // 更新当前会话
      if (state.currentSession?.id === id) {
        state.currentSession = { ...state.currentSession, ...updates };
      }
    },
    
    setUserVote: (state, action: PayloadAction<{ sessionId: string; vote: UserVote }>) => {
      const { sessionId, vote } = action.payload;
      
      // 更新当前会话的用户投票
      if (state.currentSession?.id === sessionId) {
        state.currentSession.userVote = vote;
      }
      
      // 更新用户会话列表中的投票
      const userSessionIndex = state.userSessions.findIndex(session => session.id === sessionId);
      if (userSessionIndex !== -1) {
        state.userSessions[userSessionIndex].userVote = vote;
      }
    },
    
    setVotingResults: (state, action: PayloadAction<{ sessionId: string; results: VotingResults }>) => {
      const { sessionId, results } = action.payload;
      
      // 更新所有会话列表的结果
      const sessionIndex = state.allSessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        state.allSessions[sessionIndex].results = results;
      }
      
      // 更新用户会话列表的结果
      const userSessionIndex = state.userSessions.findIndex(session => session.id === sessionId);
      if (userSessionIndex !== -1) {
        state.userSessions[userSessionIndex].results = results;
      }
      
      // 更新当前会话的结果
      if (state.currentSession?.id === sessionId) {
        state.currentSession.results = results;
      }
    },
    
    clearVotingData: (state) => {
      state.currentSession = null;
      state.userSessions = [];
      state.allSessions = [];
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setCurrentSession,
  setUserSessions,
  setAllSessions,
  addSession,
  updateSession,
  setUserVote,
  setVotingResults,
  clearVotingData,
} = votingSlice.actions;

export default votingSlice.reducer;
