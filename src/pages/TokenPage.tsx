import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  TextField, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Lock, LockOpen, History, TrendingUp } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetTokenBalanceQuery, useStakeTokenMutation, useUnstakeTokenMutation } from '../store/api';
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
      id={`token-tabpanel-${index}`}
      aria-labelledby={`token-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TokenPage: React.FC = () => {
  const address = useSelector((state: RootState) => state.wallet.address);
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected);
  const { data: balance } = useGetTokenBalanceQuery(address!, { skip: !address });
  const [stakeToken, { isLoading: staking }] = useStakeTokenMutation();
  const [unstakeToken, { isLoading: unstaking }] = useUnstakeTokenMutation();

  const [tabValue, setTabValue] = useState(0);
  const [amount, setAmount] = useState('');
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockAmount, setLockAmount] = useState('');
  const [lockDuration, setLockDuration] = useState(30);

  const handleStake = async () => {
    if (!amount) return;
    await stakeToken({ amount });
    setAmount('');
  };

  const handleUnstake = async () => {
    if (!amount) return;
    await unstakeToken({ amount });
    setAmount('');
  };

  const handleLock = async () => {
    if (!lockAmount) return;
    // Lock token logic
    console.log('锁定代币:', lockAmount, '天:', lockDuration);
    setLockDialogOpen(false);
    setLockAmount('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data
  const tokenHistory = [
    {
      id: 1,
      type: 'stake',
      amount: '100',
      timestamp: '2025-08-10T10:00:00Z',
      txHash: '0xabc123...def456',
      status: 'completed',
    },
    {
      id: 2,
      type: 'unstake',
      amount: '50',
      timestamp: '2025-08-09T15:30:00Z',
      txHash: '0xdef456...ghi789',
      status: 'completed',
    },
    {
      id: 3,
      type: 'lock',
      amount: '200',
      timestamp: '2025-08-08T09:15:00Z',
      txHash: '0xghi789...jkl012',
      status: 'locked',
    },
  ];

  const rewards = [
    {
      id: 1,
      type: 'staking',
      amount: '5.2',
      timestamp: '2025-08-10T00:00:00Z',
      status: 'claimed',
    },
    {
      id: 2,
      type: 'governance',
      amount: '2.1',
      timestamp: '2025-08-09T00:00:00Z',
      status: 'pending',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stake':
        return 'success';
      case 'unstake':
        return 'warning';
      case 'lock':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'locked':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>治理代币管理</Typography>

      {!isConnected ? (
        <Typography>请先连接钱包以查看代币信息。</Typography>
      ) : (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="余额管理" />
              <Tab label="锁定/解锁" />
              <Tab label="奖励" />
              <Tab label="历史记录" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6">余额</Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>{balance ?? '—'} LUCKEE</Typography>
                </CardContent>
              </Card>

              <PermissionGuard required="basic">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>质押与解押</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                      <TextField
                        label="数量"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        size="small"
                      />
                      <Button variant="contained" onClick={handleStake} disabled={staking}>质押</Button>
                      <Button variant="outlined" onClick={handleUnstake} disabled={unstaking}>解押</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </PermissionGuard>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>代币锁定</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    锁定代币可以获得更高的治理权重和奖励
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Lock />}
                    onClick={() => setLockDialogOpen(true)}
                  >
                    锁定代币
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>已锁定代币</Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>200 LUCKEE</Typography>
                  <Typography variant="body2" color="text.secondary">
                    解锁时间: 2025-09-08 09:15:00
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<LockOpen />}
                    sx={{ mt: 2 }}
                    disabled
                  >
                    解锁 (未到期)
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>待领取奖励</Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>2.1 LUCKEE</Typography>
                  <Button variant="contained" sx={{ mt: 2 }}>
                    领取奖励
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>奖励历史</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>类型</TableCell>
                          <TableCell>数量</TableCell>
                          <TableCell>时间</TableCell>
                          <TableCell>状态</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell>
                              <Chip label={reward.type} size="small" />
                            </TableCell>
                            <TableCell>{reward.amount} LUCKEE</TableCell>
                            <TableCell>
                              {new Date(reward.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={reward.status}
                                color={getStatusColor(reward.status) as any}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>操作历史</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>类型</TableCell>
                        <TableCell>数量</TableCell>
                        <TableCell>时间</TableCell>
                        <TableCell>交易哈希</TableCell>
                        <TableCell>状态</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tokenHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Chip
                              label={record.type}
                              color={getTypeColor(record.type) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{record.amount} LUCKEE</TableCell>
                          <TableCell>
                            {new Date(record.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {record.txHash}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={getStatusColor(record.status) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>
        </Card>
      )}

      {/* 锁定对话框 */}
      <Dialog open={lockDialogOpen} onClose={() => setLockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>锁定代币</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              锁定代币后，在锁定期间内无法解锁。请谨慎操作。
            </Alert>
            <TextField
              fullWidth
              label="锁定数量"
              value={lockAmount}
              onChange={(e) => setLockAmount(e.target.value)}
              margin="normal"
              placeholder="输入要锁定的代币数量"
            />
            <TextField
              fullWidth
              label="锁定天数"
              type="number"
              value={lockDuration}
              onChange={(e) => setLockDuration(parseInt(e.target.value))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLockDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleLock}
            variant="contained"
            disabled={!lockAmount}
          >
            确认锁定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TokenPage;


