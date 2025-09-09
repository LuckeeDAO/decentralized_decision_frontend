import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  ViewModule,
  ViewList,
  SelectAll,
  Clear,
  TransferWithinAStation,
  Delete,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetNFTsQuery, useTransferNFTMutation } from '../store/api';
import Button from './Button';
import Input from './Input';

interface NFTGalleryProps {
  address?: string;
  onNFTSelect?: (nft: any) => void;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ address, onNFTSelect }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient: '',
    nftIds: [] as string[],
  });

  const wallet = useSelector((state: RootState) => state.wallet);
  const { data: nfts, isLoading } = useGetNFTsQuery({ 
    owner: address || wallet.address,
    type: filterType === 'all' ? undefined : filterType,
  });
  const [transferNFT] = useTransferNFTMutation();

  const handleSelectNFT = (nftId: string) => {
    setSelectedNFTs(prev => 
      prev.includes(nftId) 
        ? prev.filter(id => id !== nftId)
        : [...prev, nftId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNFTs.length === nfts?.length) {
      setSelectedNFTs([]);
    } else {
      setSelectedNFTs(nfts?.map(nft => nft.id) || []);
    }
  };

  const handleTransfer = () => {
    setTransferData({
      recipient: '',
      nftIds: selectedNFTs,
    });
    setTransferDialogOpen(true);
  };

  const handleExecuteTransfer = async () => {
    try {
      for (const nftId of transferData.nftIds) {
        await transferNFT({
          nftId,
          recipient: transferData.recipient,
        }).unwrap();
      }
      setSelectedNFTs([]);
      setTransferDialogOpen(false);
    } catch (error) {
      console.error('转移NFT失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'transferred': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lottery': return 'primary';
      case 'governance': return 'secondary';
      case 'distribution': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 工具栏 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">NFT画廊</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="网格视图">
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
              <Tooltip title="列表视图">
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>类型筛选</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="类型筛选"
              >
                <MenuItem value="all">全部类型</MenuItem>
                <MenuItem value="lottery">抽奖</MenuItem>
                <MenuItem value="governance">治理</MenuItem>
                <MenuItem value="distribution">分配</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>排序方式</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="排序方式"
              >
                <MenuItem value="createdAt">创建时间</MenuItem>
                <MenuItem value="name">名称</MenuItem>
                <MenuItem value="type">类型</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* 批量操作 */}
          {selectedNFTs.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  已选择 {selectedNFTs.length} 个NFT
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outline"
                    startIcon={<TransferWithinAStation />}
                    onClick={handleTransfer}
                  >
                    批量转移
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    color="error"
                    startIcon={<Delete />}
                  >
                    批量删除
                  </Button>
                </Stack>
              </Box>
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={selectedNFTs.length === nfts?.length && nfts.length > 0}
              indeterminate={selectedNFTs.length > 0 && selectedNFTs.length < (nfts?.length || 0)}
              onChange={handleSelectAll}
            />
            <Typography variant="body2">
              {selectedNFTs.length === nfts?.length ? '取消全选' : '全选'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* NFT展示 */}
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {nfts?.map((nft) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedNFTs.includes(nft.id) ? 2 : 1,
                  borderColor: selectedNFTs.includes(nft.id) ? 'primary.main' : 'divider',
                }}
                onClick={() => handleSelectNFT(nft.id)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={nft.image || '/placeholder-nft.png'}
                    alt={nft.name}
                  />
                  <Checkbox
                    checked={selectedNFTs.includes(nft.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {nft.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {nft.tokenId}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={nft.type}
                      color={getTypeColor(nft.type) as any}
                      size="small"
                    />
                    <Chip
                      label={nft.status}
                      color={getStatusColor(nft.status) as any}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNFTSelect?.(nft);
                    }}
                  >
                    查看
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    编辑
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nfts?.map((nft) => (
                <Box
                  key={nft.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    border: 1,
                    borderColor: selectedNFTs.includes(nft.id) ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSelectNFT(nft.id)}
                >
                  <Checkbox
                    checked={selectedNFTs.includes(nft.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Box
                    component="img"
                    src={nft.image || '/placeholder-nft.png'}
                    alt={nft.name}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{nft.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {nft.tokenId}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={nft.type}
                        color={getTypeColor(nft.type) as any}
                        size="small"
                      />
                      <Chip
                        label={nft.status}
                        color={getStatusColor(nft.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNFTSelect?.(nft);
                      }}
                    >
                      查看
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      编辑
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 转移对话框 */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>批量转移NFT</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              将转移 {transferData.nftIds.length} 个NFT到指定地址
            </Alert>
            <Input
              fullWidth
              label="接收地址"
              value={transferData.recipient}
              onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
              margin="normal"
              placeholder="输入接收方钱包地址"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleExecuteTransfer}
            disabled={!transferData.recipient}
          >
            确认转移
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NFTGallery;
