import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Chip, Skeleton } from '@mui/material';
import { useDebounce } from '../hooks/useDebounce';
import { useThrottle } from '../hooks/useThrottle';
import VirtualizedList from '../components/VirtualizedList';
import LazyImage from '../components/LazyImage';
import { usePerformance } from '../utils/performance';

// 懒加载组件
const VotingChart = lazy(() => import('../components/VotingChart'));
const VotingDetails = lazy(() => import('../components/VotingDetails'));

interface VotingItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  participants: number;
  endTime: Date;
  imageUrl?: string;
}

const OptimizedVotingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'endTime' | 'participants'>('endTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 性能监控
  const { start: startPerf, end: endPerf } = usePerformance('VotingPage');
  
  // 防抖搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // 节流排序
  const throttledSortBy = useThrottle(sortBy, 100);
  const throttledSortOrder = useThrottle(sortOrder, 100);

  // 模拟投票数据
  const votingData: VotingItem[] = useMemo(() => {
    const data: VotingItem[] = Array.from({ length: 1000 }, (_, index) => ({
      id: `voting-${index}`,
      title: `投票提案 ${index + 1}`,
      description: `这是第 ${index + 1} 个投票提案的描述内容，包含了详细的投票信息和说明。`,
      status: ['active', 'completed', 'upcoming'][index % 3] as 'active' | 'completed' | 'upcoming',
      participants: Math.floor(Math.random() * 1000) + 100,
      endTime: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      imageUrl: `https://picsum.photos/300/200?random=${index}`,
    }));
    return data;
  }, []);

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    startPerf();
    
    let filtered = votingData;
    
    // 搜索过滤
    if (debouncedSearchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // 状态过滤
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (throttledSortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'endTime':
          aValue = a.endTime.getTime();
          bValue = b.endTime.getTime();
          break;
        case 'participants':
          aValue = a.participants;
          bValue = b.participants;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return throttledSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return throttledSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    endPerf();
    return filtered;
  }, [votingData, debouncedSearchTerm, filter, throttledSortBy, throttledSortOrder, startPerf, endPerf]);

  // 渲染投票项目
  const renderVotingItem = useCallback((item: VotingItem, index: number) => (
    <Card key={item.id} sx={{ mb: 2, height: 200 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <LazyImage
              src={item.imageUrl || ''}
              alt={item.title}
              width="100%"
              height={120}
              placeholder={
                <Skeleton variant="rectangular" width="100%" height={120} />
              }
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" component="h2" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={item.status}
                color={
                  item.status === 'active' ? 'success' :
                  item.status === 'completed' ? 'default' : 'warning'
                }
                size="small"
              />
              <Chip
                label={`${item.participants} 参与者`}
                variant="outlined"
                size="small"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              结束时间: {item.endTime.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  ), []);

  // 处理搜索
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // 处理过滤
  const handleFilter = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
  }, []);

  // 处理排序
  const handleSort = useCallback((newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        优化投票页面
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        使用虚拟化列表、懒加载和性能优化技术
      </Typography>

      {/* 搜索和过滤控件 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="搜索投票"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="输入关键词搜索..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(['all', 'active', 'completed', 'upcoming'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'contained' : 'outlined'}
                  onClick={() => handleFilter(status)}
                  size="small"
                >
                  {status === 'all' ? '全部' : 
                   status === 'active' ? '进行中' :
                   status === 'completed' ? '已完成' : '即将开始'}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 排序控件 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          排序方式:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(['title', 'endTime', 'participants'] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'contained' : 'outlined'}
              onClick={() => handleSort(sort)}
              size="small"
            >
              {sort === 'title' ? '标题' :
               sort === 'endTime' ? '结束时间' : '参与者数量'}
              {sortBy === sort && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 统计信息 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          搜索结果: {filteredAndSortedData.length} 个投票
        </Typography>
      </Box>

      {/* 虚拟化列表 */}
      <VirtualizedList
        items={filteredAndSortedData}
        itemHeight={220}
        containerHeight={600}
        renderItem={renderVotingItem}
        keyExtractor={(item) => item.id}
        overscan={5}
      />

      {/* 懒加载的图表组件 */}
      <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={400} />}>
        <VotingChart data={filteredAndSortedData} />
      </Suspense>

      {/* 懒加载的详情组件 */}
      <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={200} />}>
        <VotingDetails />
      </Suspense>
    </Box>
  );
};

export default OptimizedVotingPage;
