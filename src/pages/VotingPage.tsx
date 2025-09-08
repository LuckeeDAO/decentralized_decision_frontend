import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, HowToVote, Schedule, CheckCircle, Cancel } from '@mui/icons-material';
import { useVoting } from '../hooks/useVoting';
import { useNavigate } from 'react-router-dom';

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
      id={`voting-tabpanel-${index}`}
      aria-labelledby={`voting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVoting, setNewVoting] = useState({
    title: '',
    description: '',
    type: 'governance',
    duration: 7,
  });
  
  const { 
    allSessions, 
    userSessions, 
    currentSession, 
    isLoading, 
    error, 
    createVotingSession, 
    joinVotingSession,
    loadVotingSessions 
  } = useVoting();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateVoting = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewVoting({
      title: '',
      description: '',
      type: 'governance',
      duration: 7,
    });
  };

  const handleSubmitVoting = async () => {
    try {
      await createVotingSession({
        title: newVoting.title,
        description: newVoting.description,
        startTime: Date.now(),
        endTime: Date.now() + newVoting.duration * 24 * 60 * 60 * 1000,
        revealTime: Date.now() + (newVoting.duration - 1) * 24 * 60 * 60 * 1000,
        participants: [],
      });
      handleCloseDialog();
    } catch (error) {
      console.error('创建投票失败:', error);
    }
  };

  useEffect(() => {
    loadVotingSessions();
  }, [loadVotingSessions]);

  const votingSessions = [
    {
      id: 1,
      title: 'Gas费用参数调整',
      description: '提议将最小Gas价格从0.001提高到0.002',
      type: 'governance',
      status: 'voting',
      participants: 1234,
      endTime: '2025-08-15 18:00:00',
      progress: 65,
    },
    {
      id: 2,
      title: 'NFT类型扩展',
      description: '添加新的NFT类型以支持更多应用场景',
      type: 'feature',
      status: 'completed',
      participants: 856,
      endTime: '2025-08-10 12:00:00',
      progress: 100,
    },
    {
      id: 3,
      title: '代币分配机制优化',
      description: '优化代币分配算法以提高公平性',
      type: 'governance',
      status: 'pending',
      participants: 0,
      endTime: '2025-08-20 00:00:00',
      progress: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'voting':
        return 'primary';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voting':
        return <HowToVote />;
      case 'completed':
        return <CheckCircle />;
      case 'pending':
        return <Schedule />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          投票管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateVoting}
        >
          创建投票
        </Button>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="进行中" />
            <Tab label="已完成" />
            <Tab label="待开始" />
            <Tab label="我的投票" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>投票标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>参与人数</TableCell>
                  <TableCell>结束时间</TableCell>
                  <TableCell>进度</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votingSessions
                  .filter(session => session.status === 'voting')
                  .map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{session.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {session.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={session.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(session.status)}
                          label={session.status}
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{session.participants}</TableCell>
                      <TableCell>{session.endTime}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <Box
                              sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: 'grey.300',
                                borderRadius: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${session.progress}%`,
                                  height: '100%',
                                  backgroundColor: 'primary.main',
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {session.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => navigate(`/voting/${session.id}`)}
                        >
                          参与投票
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
                  <TableCell>投票标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>参与人数</TableCell>
                  <TableCell>结束时间</TableCell>
                  <TableCell>结果</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votingSessions
                  .filter(session => session.status === 'completed')
                  .map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{session.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {session.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={session.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(session.status)}
                          label={session.status}
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{session.participants}</TableCell>
                      <TableCell>{session.endTime}</TableCell>
                      <TableCell>
                        <Chip label="通过" color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => navigate(`/voting/${session.id}`)}
                        >
                          查看结果
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
                  <TableCell>投票标题</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>开始时间</TableCell>
                  <TableCell>预计参与人数</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votingSessions
                  .filter(session => session.status === 'pending')
                  .map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{session.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {session.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={session.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(session.status)}
                          label={session.status}
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{session.endTime}</TableCell>
                      <TableCell>{session.participants}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => navigate(`/voting/${session.id}`)}
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1" color="text.secondary">
            我的投票记录将在这里显示
          </Typography>
        </TabPanel>
      </Card>

      {/* 创建投票对话框 */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>创建新投票</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="投票标题"
              value={newVoting.title}
              onChange={(e) => setNewVoting({ ...newVoting, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="投票描述"
              value={newVoting.description}
              onChange={(e) => setNewVoting({ ...newVoting, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>投票类型</InputLabel>
              <Select
                value={newVoting.type}
                onChange={(e) => setNewVoting({ ...newVoting, type: e.target.value })}
              >
                <MenuItem value="governance">治理投票</MenuItem>
                <MenuItem value="feature">功能投票</MenuItem>
                <MenuItem value="parameter">参数投票</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="投票时长（天）"
              type="number"
              value={newVoting.duration}
              onChange={(e) => setNewVoting({ ...newVoting, duration: parseInt(e.target.value) })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmitVoting} variant="contained">
            创建投票
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VotingPage;
