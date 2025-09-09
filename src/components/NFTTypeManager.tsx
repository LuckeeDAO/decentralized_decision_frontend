import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
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
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Schema,
  Settings,
  Analytics,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Input from './Input';
import Button from './Button';
import PermissionGuard from './PermissionGuard';

interface NFTType {
  id: string;
  name: string;
  description: string;
  type: string;
  schema: any;
  permissions: {
    create: string[];
    transfer: string[];
    burn: string[];
  };
  metadata: any;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const NFTTypeManager: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<NFTType | null>(null);
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    type: 'lottery',
    schema: '',
    permissions: {
      create: ['basic'],
      transfer: ['basic'],
      burn: ['creator'],
    },
    metadata: '',
  });

  const wallet = useSelector((state: RootState) => state.wallet);

  // Mock data - 在实际应用中应该从API获取
  const nftTypes: NFTType[] = [
    {
      id: '1',
      name: '抽奖NFT',
      description: '用于参与抽奖活动的NFT类型',
      type: 'lottery',
      schema: {
        properties: {
          rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'] },
          power: { type: 'number', minimum: 1, maximum: 100 },
        },
      },
      permissions: {
        create: ['creator'],
        transfer: ['basic'],
        burn: ['creator'],
      },
      metadata: {
        image: '/nft-types/lottery.png',
        attributes: [
          { trait_type: 'Category', value: 'Lottery' },
          { trait_type: 'Rarity', value: 'Common' },
        ],
      },
      version: '1.0.0',
      status: 'active',
      createdAt: '2025-08-01',
      updatedAt: '2025-08-10',
      usageCount: 1250,
    },
    {
      id: '2',
      name: '治理NFT',
      description: '用于参与治理投票的NFT类型',
      type: 'governance',
      schema: {
        properties: {
          votingPower: { type: 'number', minimum: 1, maximum: 1000 },
          delegation: { type: 'boolean' },
        },
      },
      permissions: {
        create: ['admin'],
        transfer: ['basic'],
        burn: ['admin'],
      },
      metadata: {
        image: '/nft-types/governance.png',
        attributes: [
          { trait_type: 'Category', value: 'Governance' },
          { trait_type: 'Voting Power', value: '100' },
        ],
      },
      version: '1.0.0',
      status: 'active',
      createdAt: '2025-08-02',
      updatedAt: '2025-08-09',
      usageCount: 890,
    },
  ];

  const handleCreateType = () => {
    setNewType({
      name: '',
      description: '',
      type: 'lottery',
      schema: '',
      permissions: {
        create: ['basic'],
        transfer: ['basic'],
        burn: ['creator'],
      },
      metadata: '',
    });
    setCreateDialogOpen(true);
  };

  const handleEditType = (type: NFTType) => {
    setSelectedType(type);
    setNewType({
      name: type.name,
      description: type.description,
      type: type.type,
      schema: JSON.stringify(type.schema, null, 2),
      permissions: type.permissions,
      metadata: JSON.stringify(type.metadata, null, 2),
    });
    setEditDialogOpen(true);
  };

  const handleSaveType = () => {
    try {
      const schemaData = JSON.parse(newType.schema);
      const metadataData = JSON.parse(newType.metadata);
      
      // 这里应该调用API保存NFT类型
      console.log('保存NFT类型:', {
        ...newType,
        schema: schemaData,
        metadata: metadataData,
      });
      
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('保存NFT类型失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'deprecated': return 'warning';
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          NFT类型管理
        </Typography>
        <PermissionGuard required="creator">
          <Button
            variant="primary"
            startIcon={<Add />}
            onClick={handleCreateType}
          >
            创建NFT类型
          </Button>
        </PermissionGuard>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schema sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">总类型数</Typography>
              </Box>
              <Typography variant="h4">{nftTypes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Analytics sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">活跃类型</Typography>
              </Box>
              <Typography variant="h4">
                {nftTypes.filter(type => type.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">总使用量</Typography>
              </Box>
              <Typography variant="h4">
                {nftTypes.reduce((sum, type) => sum + type.usageCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* NFT类型列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            NFT类型列表
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>版本</TableCell>
                  <TableCell>使用量</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nftTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{type.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={type.type}
                        color={getTypeColor(type.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={type.status}
                        color={getStatusColor(type.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{type.version}</TableCell>
                    <TableCell>{type.usageCount}</TableCell>
                    <TableCell>{type.createdAt}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="查看详情">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <PermissionGuard required="creator">
                          <Tooltip title="编辑">
                            <IconButton
                              size="small"
                              onClick={() => handleEditType(type)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                        <PermissionGuard required="admin">
                          <Tooltip title="删除">
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={createDialogOpen || editDialogOpen} onClose={() => {
        setCreateDialogOpen(false);
        setEditDialogOpen(false);
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {createDialogOpen ? '创建NFT类型' : '编辑NFT类型'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Input
              fullWidth
              label="类型名称"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              margin="normal"
            />
            <Input
              fullWidth
              label="描述"
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>类型</InputLabel>
              <Select
                value={newType.type}
                onChange={(e) => setNewType({ ...newType, type: e.target.value })}
                label="类型"
              >
                <MenuItem value="lottery">抽奖</MenuItem>
                <MenuItem value="governance">治理</MenuItem>
                <MenuItem value="distribution">分配</MenuItem>
                <MenuItem value="custom">自定义</MenuItem>
              </Select>
            </FormControl>
            <Input
              fullWidth
              label="Schema (JSON格式)"
              value={newType.schema}
              onChange={(e) => setNewType({ ...newType, schema: e.target.value })}
              margin="normal"
              multiline
              rows={6}
              placeholder='{"properties": {"rarity": {"type": "string", "enum": ["common", "rare"]}}}'
            />
            <Input
              fullWidth
              label="元数据 (JSON格式)"
              value={newType.metadata}
              onChange={(e) => setNewType({ ...newType, metadata: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder='{"image": "/path/to/image.png", "attributes": []}'
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Schema定义了NFT的属性结构，元数据包含了NFT的显示信息
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
          }}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveType}
            disabled={!newType.name || !newType.description}
          >
            {createDialogOpen ? '创建' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NFTTypeManager;
