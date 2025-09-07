import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setLoading,
  setError,
  setCurrentSession,
  setUserSessions,
  setAllSessions,
  addSession,
  updateSession,
  setUserVote,
  setVotingResults,
  clearVotingData
} from '../store/slices/votingSlice';
import { useGetProposalsQuery, useVoteMutation, useCreateProposalMutation } from '../store/api';

export const useVoting = () => {
  const dispatch = useDispatch();
  const voting = useSelector((state: RootState) => state.voting);
  const wallet = useSelector((state: RootState) => state.wallet);

  // API查询
  const { data: proposals, isLoading: proposalsLoading, error: proposalsError } = useGetProposalsQuery();
  const [voteMutation, { isLoading: voteLoading }] = useVoteMutation();
  const [createProposalMutation, { isLoading: createLoading }] = useCreateProposalMutation();

  const createVotingSession = useCallback(async (sessionData: {
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    revealTime: number;
    participants: string[];
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const proposalData = {
        proposer: wallet.address,
        title: sessionData.title,
        description: sessionData.description,
        proposal_type: 'text',
        content: {
          text: sessionData.description
        },
        deposit: 1000,
        signature: 'mock_signature'
      };

      const result = await createProposalMutation(proposalData).unwrap();
      
      const newSession = {
        id: result.proposal_id.toString(),
        title: sessionData.title,
        description: sessionData.description,
        status: 'active' as const,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        revealTime: sessionData.revealTime,
        participants: sessionData.participants,
        totalParticipants: sessionData.participants.length,
      };

      dispatch(addSession(newSession));
      dispatch(setCurrentSession(newSession));
      
      return newSession;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建投票会话失败';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, wallet.address, createProposalMutation]);

  const joinVotingSession = useCallback(async (sessionId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 查找会话
      const session = voting.allSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('投票会话不存在');
      }

      dispatch(setCurrentSession(session));
      
      // 如果用户还没有参与，添加到参与者列表
      if (!session.participants.includes(wallet.address || '')) {
        dispatch(updateSession({
          id: sessionId,
          updates: {
            participants: [...session.participants, wallet.address || ''],
            totalParticipants: session.participants.length + 1
          }
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加入投票会话失败';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, voting.allSessions, wallet.address]);

  const submitVote = useCallback(async (sessionId: string, voteData: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      if (!wallet.address) {
        throw new Error('请先连接钱包');
      }

      // 生成承诺
      const commitment = await generateCommitment(voteData);
      
      const voteRequest = {
        proposal_id: parseInt(sessionId),
        voter: wallet.address,
        option: voteData.option,
        signature: 'mock_signature'
      };

      await voteMutation(voteRequest).unwrap();

      // 更新本地状态
      const userVote = {
        commitment,
        revealed: false,
        voteData,
        timestamp: Date.now(),
      };

      dispatch(setUserVote({ sessionId, vote }));
      
      return userVote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交投票失败';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, wallet.address, voteMutation]);

  const revealVote = useCallback(async (sessionId: string, voteData: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 更新用户投票状态
      dispatch(setUserVote({
        sessionId,
        vote: {
          commitment: '',
          revealed: true,
          voteData,
          timestamp: Date.now(),
        }
      }));

      // 这里应该调用揭示API
      // await revealVoteAPI(sessionId, voteData);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '揭示投票失败';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const generateCommitment = async (voteData: any): Promise<string> => {
    // 模拟生成承诺
    const data = JSON.stringify(voteData);
    const nonce = Math.random().toString(36).substring(2);
    return btoa(data + nonce);
  };

  const loadVotingSessions = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 这里应该调用API获取投票会话
      // const sessions = await getVotingSessionsAPI();
      
      // 模拟数据
      const mockSessions = [
        {
          id: '1',
          title: '调整Gas费用参数',
          description: '提议将最小Gas价格从0.001提高到0.002',
          status: 'active' as const,
          startTime: Date.now(),
          endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          revealTime: Date.now() + 6 * 24 * 60 * 60 * 1000,
          participants: [wallet.address || ''],
          totalParticipants: 1,
        }
      ];

      dispatch(setAllSessions(mockSessions));
      dispatch(setUserSessions(mockSessions));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载投票会话失败';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, wallet.address]);

  const clearVoting = useCallback(() => {
    dispatch(clearVotingData());
  }, [dispatch]);

  return {
    ...voting,
    createVotingSession,
    joinVotingSession,
    submitVote,
    revealVote,
    loadVotingSessions,
    clearVoting,
    isLoading: voting.loading || proposalsLoading || voteLoading || createLoading,
    error: voting.error || (proposalsError ? '加载提案失败' : null),
  };
};
