import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ArrowBack, HowToVote, Visibility, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useVoteMutation, useGetProposalsQuery } from '../store/api';
import PermissionGuard from '../components/PermissionGuard';

const VotingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [commitment, setCommitment] = useState('');
  const [revealDialogOpen, setRevealDialogOpen] = useState(false);
  const [revealData, setRevealData] = useState('');

  const { data: proposals } = useGetProposalsQuery({});
  const [vote, { isLoading: voting }] = useVoteMutation();
  const wallet = useSelector((state: RootState) => state.wallet);

  // Mock voting session data
  const votingSession = {
    id: id || '1',
    title: 'Gas费用参数调整提案',
    description: '提议将最小Gas价格从0.001提高到0.002，以优化网络性能和安全性。',
    status: 'active' as const,
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
    revealTime: Date.now() + 4 * 24 * 60 * 60 * 1000,
    totalParticipants: 1234,
    currentParticipants: 856,
    options: [
      { id: 'yes', label: '支持', votes: 456 },
      { id: 'no', label: '反对', votes: 234 },
      { id: 'abstain', label: '弃权', votes: 166 },
    ],
    userVote: null,
    results: null,
  };

  const handleVote = async () => {
    if (!selectedOption || !commitment) return;
    
    try {
      await vote({
        proposalId: votingSession.id,
        option: selectedOption,
        commitment,
      }).unwrap();
      setVoteDialogOpen(false);
      setSelectedOption('');
      setCommitment('');
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  const handleReveal = async () => {
    if (!revealData) return;
    
    try {
      // Reveal vote logic
      console.log('揭示投票:', revealData);
      setRevealDialogOpen(false);
      setRevealData('');
    } catch (error) {
      console.error('揭示投票失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'revealing':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '投票中';
      case 'revealing':
        return '揭示阶段';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  const progress = votingSession.currentParticipants / votingSession.totalParticipants * 100;
  const timeRemaining = votingSession.endTime - Date.now();
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/voting')}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" component="h1">
          投票详情
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {votingSession.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {votingSession.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  label={getStatusText(votingSession.status)}
                  color={getStatusColor(votingSession.status) as any}
                  icon={<HowToVote />}
                />
                <Chip label={`剩余 ${daysRemaining} 天`} variant="outlined" />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  参与进度
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {votingSession.currentParticipants} / {votingSession.totalParticipants} 参与者
                </Typography>
              </Box>

              {votingSession.status === 'active' && (
                <PermissionGuard required="basic">
                  <Button
                    variant="contained"
                    startIcon={<HowToVote />}
                    onClick={() => setVoteDialogOpen(true)}
                    disabled={!wallet.isConnected}
                  >
                    参与投票
                  </Button>
                </PermissionGuard>
              )}

              {votingSession.status === 'revealing' && (
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setRevealDialogOpen(true)}
                >
                  揭示投票
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 投票选项和结果 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                投票选项
              </Typography>
              {votingSession.options.map((option) => (
                <Box key={option.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{option.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.votes} 票
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(option.votes / votingSession.currentParticipants) * 100}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                投票信息
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    开始时间
                  </Typography>
                  <Typography variant="body1">
                    {new Date(votingSession.startTime).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    结束时间
                  </Typography>
                  <Typography variant="body1">
                    {new Date(votingSession.endTime).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    揭示时间
                  </Typography>
                  <Typography variant="body1">
                    {new Date(votingSession.revealTime).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {votingSession.userVote && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  我的投票
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  承诺哈希: {votingSession.userVote.commitment.slice(0, 20)}...
                </Typography>
                <Chip
                  label={votingSession.userVote.revealed ? '已揭示' : '未揭示'}
                  color={votingSession.userVote.revealed ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 投票对话框 */}
      <Dialog open={voteDialogOpen} onClose={() => setVoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>参与投票</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>选择选项</InputLabel>
              <Select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {votingSession.options.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="投票承诺（哈希值）"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              margin="normal"
              placeholder="输入您的投票承诺哈希值"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoteDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleVote}
            variant="contained"
            disabled={!selectedOption || !commitment || voting}
          >
            提交投票
          </Button>
        </DialogActions>
      </Dialog>

      {/* 揭示投票对话框 */}
      <Dialog open={revealDialogOpen} onClose={() => setRevealDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>揭示投票</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="投票数据"
              value={revealData}
              onChange={(e) => setRevealData(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              placeholder="输入您的原始投票数据"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevealDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleReveal}
            variant="contained"
            disabled={!revealData}
          >
            揭示投票
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VotingDetailPage;
