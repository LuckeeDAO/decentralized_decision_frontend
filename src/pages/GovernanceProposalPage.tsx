import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
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
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import { Add, HowToVote, TrendingUp, Schedule, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useCreateProposalMutation, useGetProposalsQuery, useVoteMutation } from '../store/api';
import PermissionGuard from '../components/PermissionGuard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`governance-tabpanel-${index}`}
      aria-labelledby={`governance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GovernanceProposalPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'parameter',
    deposit: '100',
  });

  const wallet = useSelector((state: RootState) => state.wallet);
  const { data: proposals, isLoading } = useGetProposalsQuery({});
  const [createProposal, { isLoading: creating }] = useCreateProposalMutation();
  const [vote, { isLoading: voting }] = useVoteMutation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) return;
    
    try {
      await createProposal({
        title: newProposal.title,
        description: newProposal.description,
        type: newProposal.type,
        deposit: newProposal.deposit,
      }).unwrap();
      setCreateDialogOpen(false);
      setNewProposal({
        title: '',
        description: '',
        type: 'parameter',
        deposit: '100',
      });
    } catch (error) {
      console.error('创建提案失败:', error);
    }
  };

  const handleVote = async (proposalId: string, option: string) => {
    try {
      await vote({
        proposalId,
        option,
        commitment: `commitment_${Date.now()}`,
      }).unwrap();
      setVoteDialogOpen(false);
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  // Mock governance proposals data
  const governanceProposals = [
    {
      id: 1,
      title: 'Gas费用参数调整',
      description: '提议将最小Gas价格从0.001提高到0.002，以优化网络性能和安全性。',
      type: 'parameter',
      status: 'voting',
      proposer: '0x1234...5678',
      deposit: '100',
      submitTime: '2025-08-10T10:00:00Z',
      votingStartTime: '2025-08-10T12:00:00Z',
      votingEndTime: '2025-08-17T12:00:00Z',
      totalVotes: 856,
      yesVotes: 456,
      noVotes: 234,
      abstainVotes: 166,
      threshold: 0.5,
    },
    {
      id: 2,
      title: '添加新的NFT类型',
      description: '提议添加"治理NFT"类型，用于增强治理参与度。',
      type: 'feature',
      status: 'passed',
      proposer: '0x2345...6789',
      deposit: '100',
      submitTime: '2025-08-05T14:30:00Z',
      votingStartTime: '2025-08-05T16:30:00Z',
      votingEndTime: '2025-08-12T16:30:00Z',
      totalVotes: 1234,
      yesVotes: 789,
      noVotes: 234,
      abstainVotes: 211,
      threshold: 0.5,
    },
    {
      id: 3,
      title: '代币分配机制优化',
      description: '提议优化代币分配算法，提高公平性和透明度。',
      type: 'governance',
      status: 'deposit',
      proposer: '0x3456...7890',
      deposit: '50',
      submitTime: '2025-08-12T09:15:00Z',
      votingStartTime: null,
      votingEndTime: null,
      totalVotes: 0,
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      threshold: 0.5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deposit':
        return 'warning';
      case 'voting':
        return 'primary';
      case 'passed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deposit':
        return '存款期';
      case 'voting':
        return '投票中';
      case 'passed':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'parameter':
        return '参数变更';
      case 'feature':
        return '功能添加';
      case 'governance':
        return '治理变更';
      default:
        return '其他';
    }
  };

  const filteredProposals = governanceProposals.filter(proposal => {
    switch (tabValue) {
      case 0: return proposal.status === 'voting';
      case 1: return proposal.status === 'passed' || proposal.status === 'rejected';
      case 2: return proposal.status === 'deposit';
      default: return true;
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          治理提案
        </Typography>
        <PermissionGuard required="creator">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            创建提案
          </Button>
        </PermissionGuard>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="进行中" />
            <Tab label="已完成" />
            <Tab label="存款期" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>提案标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>投票进度</TableCell>
                  <TableCell>结束时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{proposal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {proposal.description.slice(0, 100)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTypeText(proposal.type)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(proposal.status)}
                        color={getStatusColor(proposal.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(proposal.totalVotes / 1000) * 100}
                          sx={{ height: 6, borderRadius: 1, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {proposal.totalVotes} / 1000 票
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {proposal.votingEndTime ? new Date(proposal.votingEndTime).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setVoteDialogOpen(true);
                        }}
                        disabled={proposal.status !== 'voting'}
                      >
                        投票
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>提案标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>结果</TableCell>
                  <TableCell>投票统计</TableCell>
                  <TableCell>结束时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{proposal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {proposal.description.slice(0, 100)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTypeText(proposal.type)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(proposal.status)}
                        color={getStatusColor(proposal.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        支持: {proposal.yesVotes} | 反对: {proposal.noVotes} | 弃权: {proposal.abstainVotes}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {proposal.votingEndTime ? new Date(proposal.votingEndTime).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>提案标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>存款金额</TableCell>
                  <TableCell>提交时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{proposal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {proposal.description.slice(0, 100)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTypeText(proposal.type)} size="small" />
                    </TableCell>
                    <TableCell>
                      {proposal.deposit} LUCKEE
                    </TableCell>
                    <TableCell>
                      {new Date(proposal.submitTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        存款支持
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* 创建提案对话框 */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>创建治理提案</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              创建提案需要支付存款费用，提案通过后存款将退还。
            </Alert>
            <TextField
              fullWidth
              label="提案标题"
              value={newProposal.title}
              onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="提案描述"
              value={newProposal.description}
              onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
              margin="normal"
              multiline
              rows={6}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>提案类型</InputLabel>
              <Select
                value={newProposal.type}
                onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
              >
                <MenuItem value="parameter">参数变更</MenuItem>
                <MenuItem value="feature">功能添加</MenuItem>
                <MenuItem value="governance">治理变更</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="存款金额 (LUCKEE)"
              value={newProposal.deposit}
              onChange={(e) => setNewProposal({ ...newProposal, deposit: e.target.value })}
              margin="normal"
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleCreateProposal}
            variant="contained"
            disabled={!newProposal.title || !newProposal.description || creating}
          >
            创建提案
          </Button>
        </DialogActions>
      </Dialog>

      {/* 投票对话框 */}
      <Dialog open={voteDialogOpen} onClose={() => setVoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>投票</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedProposal && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedProposal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedProposal.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleVote(selectedProposal.id, 'yes')}
                    disabled={voting}
                  >
                    支持
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleVote(selectedProposal.id, 'no')}
                    disabled={voting}
                  >
                    反对
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleVote(selectedProposal.id, 'abstain')}
                    disabled={voting}
                  >
                    弃权
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoteDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernanceProposalPage;
