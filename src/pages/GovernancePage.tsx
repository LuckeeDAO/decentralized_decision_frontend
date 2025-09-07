import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { HowToVote, Add, CheckCircle, Cancel, Schedule } from '@mui/icons-material';

const GovernancePage: React.FC = () => {
  const [createProposalDialogOpen, setCreateProposalDialogOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'parameter_change',
    content: '',
    deposit: '',
  });
  const [voteOption, setVoteOption] = useState('');

  const handleCreateProposal = () => {
    setCreateProposalDialogOpen(true);
  };

  const handleVote = (proposal: any) => {
    setSelectedProposal(proposal);
    setVoteDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateProposalDialogOpen(false);
    setNewProposal({
      title: '',
      description: '',
      type: 'parameter_change',
      content: '',
      deposit: '',
    });
  };

  const handleCloseVoteDialog = () => {
    setVoteDialogOpen(false);
    setSelectedProposal(null);
    setVoteOption('');
  };

  const handleSubmitProposal = () => {
    // 这里应该调用API创建提案
    console.log('创建提案:', newProposal);
    handleCloseCreateDialog();
  };

  const handleSubmitVote = () => {
    // 这里应该调用API提交投票
    console.log('投票:', { proposal: selectedProposal, option: voteOption });
    handleCloseVoteDialog();
  };

  const proposals = [
    {
      id: 1,
      title: '调整Gas费用参数',
      description: '提议将最小Gas价格从0.001提高到0.002，以优化网络使用',
      type: 'parameter_change',
      proposer: '0x1234...5678',
      status: 'voting',
      deposit: '1000',
      votingStart: '2025-08-10 00:00:00',
      votingEnd: '2025-08-17 00:00:00',
      tally: {
        yes: 4500,
        no: 1200,
        abstain: 300,
        noWithVeto: 0,
        total: 6000,
      },
      progress: 75,
    },
    {
      id: 2,
      title: '添加新的NFT类型',
      description: '提议添加"游戏"类型的NFT以支持游戏化功能',
      type: 'feature_addition',
      proposer: '0x2345...6789',
      status: 'passed',
      deposit: '2000',
      votingStart: '2025-08-01 00:00:00',
      votingEnd: '2025-08-08 00:00:00',
      tally: {
        yes: 8000,
        no: 2000,
        abstain: 500,
        noWithVeto: 0,
        total: 10500,
      },
      progress: 100,
    },
    {
      id: 3,
      title: '升级智能合约',
      description: '提议升级核心智能合约以修复已知问题',
      type: 'upgrade',
      proposer: '0x3456...7890',
      status: 'deposit_period',
      deposit: '500',
      votingStart: null,
      votingEnd: null,
      tally: {
        yes: 0,
        no: 0,
        abstain: 0,
        noWithVeto: 0,
        total: 0,
      },
      progress: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'voting':
        return 'primary';
      case 'passed':
        return 'success';
      case 'rejected':
        return 'error';
      case 'deposit_period':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voting':
        return <HowToVote />;
      case 'passed':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'deposit_period':
        return <Schedule />;
      default:
        return <Schedule />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'parameter_change':
        return '参数变更';
      case 'feature_addition':
        return '功能添加';
      case 'upgrade':
        return '升级';
      default:
        return type;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          治理中心
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateProposal}
        >
          创建提案
        </Button>
      </Box>

      {/* 治理统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                活跃提案
              </Typography>
              <Typography variant="h4" color="primary">
                {proposals.filter(p => p.status === 'voting').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                总提案数
              </Typography>
              <Typography variant="h4" color="primary">
                {proposals.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                通过率
              </Typography>
              <Typography variant="h4" color="success.main">
                85%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                参与率
              </Typography>
              <Typography variant="h4" color="info.main">
                72%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 提案列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            治理提案
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>提案标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>提案者</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>押金</TableCell>
                  <TableCell>投票进度</TableCell>
                  <TableCell>结束时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{proposal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {proposal.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTypeLabel(proposal.type)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {proposal.proposer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(proposal.status)}
                        label={proposal.status}
                        color={getStatusColor(proposal.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{proposal.deposit}</TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={proposal.progress}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {proposal.progress}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {proposal.votingEnd || '待定'}
                    </TableCell>
                    <TableCell>
                      {proposal.status === 'voting' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleVote(proposal)}
                        >
                          投票
                        </Button>
                      )}
                      <Button size="small" variant="outlined">
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 创建提案对话框 */}
      <Dialog open={createProposalDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>创建治理提案</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
              rows={4}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>提案类型</InputLabel>
              <Select
                value={newProposal.type}
                onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
              >
                <MenuItem value="parameter_change">参数变更</MenuItem>
                <MenuItem value="feature_addition">功能添加</MenuItem>
                <MenuItem value="upgrade">升级</MenuItem>
                <MenuItem value="treasury_spend">国库支出</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="提案内容（JSON格式）"
              value={newProposal.content}
              onChange={(e) => setNewProposal({ ...newProposal, content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder='{"module": "fee", "key": "min_gas_price", "value": "0.002"}'
            />
            <TextField
              fullWidth
              label="押金数量"
              value={newProposal.deposit}
              onChange={(e) => setNewProposal({ ...newProposal, deposit: e.target.value })}
              margin="normal"
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>取消</Button>
          <Button onClick={handleSubmitProposal} variant="contained">
            提交提案
          </Button>
        </DialogActions>
      </Dialog>

      {/* 投票对话框 */}
      <Dialog open={voteDialogOpen} onClose={handleCloseVoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>投票</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedProposal && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedProposal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProposal.description}
                </Typography>
              </Box>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>投票选项</InputLabel>
              <Select
                value={voteOption}
                onChange={(e) => setVoteOption(e.target.value)}
              >
                <MenuItem value="yes">赞成</MenuItem>
                <MenuItem value="no">反对</MenuItem>
                <MenuItem value="abstain">弃权</MenuItem>
                <MenuItem value="no_with_veto">否决</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVoteDialog}>取消</Button>
          <Button onClick={handleSubmitVote} variant="contained">
            提交投票
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernancePage;
