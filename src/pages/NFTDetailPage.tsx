import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ArrowBack, Send, Edit, History, Visibility } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTransferNFTMutation } from '../store/api';
import PermissionGuard from '../components/PermissionGuard';

const NFTDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [metadata, setMetadata] = useState('');

  const [transferNFT, { isLoading: transferring }] = useTransferNFTMutation();
  const wallet = useSelector((state: RootState) => state.wallet);

  // Mock NFT data
  const nft = {
    id: id || '1',
    tokenId: 'NFT-001',
    name: '幸运抽奖券',
    description: '这是一张用于参与抽奖活动的NFT，持有者可以参与每周的幸运抽奖。',
    type: 'lottery',
    owner: wallet.address || '0x1234...5678',
    status: 'active',
    createdAt: '2025-08-10',
    metadata: {
      rarity: 'Common',
      power: 100,
      attributes: [
        { trait_type: 'Rarity', value: 'Common' },
        { trait_type: 'Power', value: 100 },
        { trait_type: 'Category', value: 'Lottery' },
      ],
    },
    transferHistory: [
      {
        from: '0x0000...0000',
        to: wallet.address || '0x1234...5678',
        timestamp: '2025-08-10T10:00:00Z',
        txHash: '0xabc123...def456',
      },
    ],
  };

  const handleTransfer = async () => {
    if (!transferAddress) return;
    
    try {
      await transferNFT({
        tokenId: nft.tokenId,
        to: transferAddress,
      }).unwrap();
      setTransferDialogOpen(false);
      setTransferAddress('');
    } catch (error) {
      console.error('转移NFT失败:', error);
    }
  };

  const handleEditMetadata = async () => {
    try {
      // Edit metadata logic
      console.log('编辑元数据:', metadata);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('编辑元数据失败:', error);
    }
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/nft')}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" component="h1">
          NFT详情
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {nft.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {nft.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={nft.type} size="small" />
                    <Chip
                      label={nft.status}
                      color={getStatusColor(nft.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <PermissionGuard required="basic">
                    <Button
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={() => setTransferDialogOpen(true)}
                      disabled={!wallet.isConnected}
                    >
                      转移
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard required="creator">
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditDialogOpen(true)}
                    >
                      编辑
                    </Button>
                  </PermissionGuard>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Token ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {nft.tokenId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    所有者
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {nft.owner}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    创建时间
                  </Typography>
                  <Typography variant="body1">
                    {new Date(nft.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    NFT ID
                  </Typography>
                  <Typography variant="body1">
                    {nft.id}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 元数据 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                元数据
              </Typography>
              <Grid container spacing={2}>
                {nft.metadata.attributes.map((attr, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {attr.trait_type}
                      </Typography>
                      <Typography variant="body1">
                        {attr.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* 转移历史 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                转移历史
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>从</TableCell>
                      <TableCell>到</TableCell>
                      <TableCell>时间</TableCell>
                      <TableCell>交易哈希</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nft.transferHistory.map((transfer, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {transfer.from}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {transfer.to}
                        </TableCell>
                        <TableCell>
                          {new Date(transfer.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {transfer.txHash}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                NFT信息
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    稀有度
                  </Typography>
                  <Typography variant="body1">
                    {nft.metadata.rarity}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    能量值
                  </Typography>
                  <Typography variant="body1">
                    {nft.metadata.power}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    状态
                  </Typography>
                  <Chip
                    label={nft.status}
                    color={getStatusColor(nft.status) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 转移对话框 */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>转移NFT</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              转移NFT后，您将失去对该NFT的所有权。请确认接收地址正确。
            </Alert>
            <TextField
              fullWidth
              label="接收地址"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              margin="normal"
              placeholder="输入接收者的钱包地址"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleTransfer}
            variant="contained"
            disabled={!transferAddress || transferring}
          >
            确认转移
          </Button>
        </DialogActions>
      </Dialog>

      {/* 编辑元数据对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>编辑元数据</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="元数据（JSON格式）"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              margin="normal"
              multiline
              rows={8}
              placeholder='{"attributes": [{"trait_type": "Rarity", "value": "Common"}]}'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleEditMetadata}
            variant="contained"
            disabled={!metadata}
          >
            保存更改
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NFTDetailPage;
