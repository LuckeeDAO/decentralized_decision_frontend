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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Search, Add, Collections, Visibility, Edit, Delete } from '@mui/icons-material';

const NFTPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNFT, setNewNFT] = useState({
    name: '',
    description: '',
    type: 'lottery',
    metadata: '',
  });

  const handleCreateNFT = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewNFT({
      name: '',
      description: '',
      type: 'lottery',
      metadata: '',
    });
  };

  const handleSubmitNFT = () => {
    // 这里应该调用API创建NFT
    console.log('创建NFT:', newNFT);
    handleCloseDialog();
  };

  const nftTypes = [
    {
      id: 1,
      name: '抽奖NFT',
      description: '用于参与抽奖活动的NFT',
      type: 'lottery',
      count: 1250,
      status: 'active',
    },
    {
      id: 2,
      name: '治理NFT',
      description: '用于参与治理投票的NFT',
      type: 'governance',
      count: 890,
      status: 'active',
    },
    {
      id: 3,
      name: '分配NFT',
      description: '用于代币分配的NFT',
      type: 'distribution',
      count: 456,
      status: 'active',
    },
    {
      id: 4,
      name: '测试NFT',
      description: '用于测试的NFT类型',
      type: 'test',
      count: 0,
      status: 'inactive',
    },
  ];

  const nftInstances = [
    {
      id: 1,
      tokenId: 'NFT-001',
      name: '幸运抽奖券',
      type: 'lottery',
      owner: '0x1234...5678',
      status: 'active',
      createdAt: '2025-08-10',
    },
    {
      id: 2,
      tokenId: 'NFT-002',
      name: '治理投票权',
      type: 'governance',
      owner: '0x2345...6789',
      status: 'active',
      createdAt: '2025-08-09',
    },
    {
      id: 3,
      tokenId: 'NFT-003',
      name: '代币分配凭证',
      type: 'distribution',
      owner: '0x3456...7890',
      status: 'transferred',
      createdAt: '2025-08-08',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'transferred':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredNFTs = nftInstances.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.tokenId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || nft.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          NFT管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNFT}
        >
          创建NFT类型
        </Button>
      </Box>

      {/* 搜索和筛选 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="搜索NFT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>类型筛选</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">全部类型</MenuItem>
                  <MenuItem value="lottery">抽奖</MenuItem>
                  <MenuItem value="governance">治理</MenuItem>
                  <MenuItem value="distribution">分配</MenuItem>
                  <MenuItem value="test">测试</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* NFT类型统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {nftTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Collections sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {type.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {type.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" component="div">
                    {type.count}
                  </Typography>
                  <Chip
                    label={type.status}
                    color={getStatusColor(type.status) as any}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small">查看详情</Button>
                <Button size="small">编辑</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* NFT实例列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            NFT实例
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Token ID</TableCell>
                  <TableCell>名称</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>所有者</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNFTs.map((nft) => (
                  <TableRow key={nft.id}>
                    <TableCell>{nft.tokenId}</TableCell>
                    <TableCell>{nft.name}</TableCell>
                    <TableCell>
                      <Chip label={nft.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {nft.owner}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nft.status}
                        color={getStatusColor(nft.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{nft.createdAt}</TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Visibility />}>
                        查看
                      </Button>
                      <Button size="small" startIcon={<Edit />}>
                        编辑
                      </Button>
                      <Button size="small" startIcon={<Delete />} color="error">
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 创建NFT类型对话框 */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>创建NFT类型</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="NFT类型名称"
              value={newNFT.name}
              onChange={(e) => setNewNFT({ ...newNFT, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="描述"
              value={newNFT.description}
              onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>NFT类型</InputLabel>
              <Select
                value={newNFT.type}
                onChange={(e) => setNewNFT({ ...newNFT, type: e.target.value })}
              >
                <MenuItem value="lottery">抽奖</MenuItem>
                <MenuItem value="governance">治理</MenuItem>
                <MenuItem value="distribution">分配</MenuItem>
                <MenuItem value="test">测试</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="元数据（JSON格式）"
              value={newNFT.metadata}
              onChange={(e) => setNewNFT({ ...newNFT, metadata: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder='{"attributes": [{"trait_type": "Rarity", "value": "Common"}]}'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmitNFT} variant="contained">
            创建NFT类型
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NFTPage;
