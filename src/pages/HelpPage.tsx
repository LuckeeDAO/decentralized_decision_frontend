import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Help,
  QuestionAnswer,
  Book,
  VideoLibrary,
  Search,
  CheckCircle,
  Info,
  Warning,
} from '@mui/icons-material';

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const faqData = [
    {
      id: 'wallet',
      title: '钱包连接',
      icon: <Help />,
      questions: [
        {
          question: '如何连接钱包？',
          answer: '点击右上角的"连接钱包"按钮，选择您要使用的钱包类型（Keplr、MetaMask或Injective），按照提示完成连接。',
        },
        {
          question: '支持哪些钱包？',
          answer: '目前支持Keplr、MetaMask和Injective钱包。更多钱包支持正在开发中。',
        },
        {
          question: '连接失败怎么办？',
          answer: '请确保您已安装相应的钱包插件，并且钱包已解锁。如果问题持续，请尝试刷新页面或重新安装钱包插件。',
        },
      ],
    },
    {
      id: 'voting',
      title: '投票功能',
      icon: <QuestionAnswer />,
      questions: [
        {
          question: '如何参与投票？',
          answer: '在投票页面选择您要参与的投票，点击"参与投票"按钮，选择您的投票选项并提交承诺。',
        },
        {
          question: '什么是承诺-揭示投票？',
          answer: '承诺-揭示投票是一种隐私保护机制。首先提交投票承诺（哈希值），在揭示阶段再提交原始投票数据。',
        },
        {
          question: '投票有时间限制吗？',
          answer: '是的，每个投票都有明确的开始和结束时间。请在投票期间内完成投票和揭示操作。',
        },
      ],
    },
    {
      id: 'nft',
      title: 'NFT管理',
      icon: <Book />,
      questions: [
        {
          question: '如何查看我的NFT？',
          answer: '在NFT管理页面可以查看您拥有的所有NFT，包括详细信息、元数据和转移历史。',
        },
        {
          question: '如何转移NFT？',
          answer: '在NFT详情页面点击"转移"按钮，输入接收者地址并确认转移操作。',
        },
        {
          question: 'NFT有什么用途？',
          answer: 'NFT可以用于参与抽奖、治理投票、代币分配等多种功能，具体用途取决于NFT类型。',
        },
      ],
    },
    {
      id: 'token',
      title: '代币管理',
      icon: <Info />,
      questions: [
        {
          question: '如何质押代币？',
          answer: '在代币管理页面的"余额管理"标签页中，输入要质押的数量并点击"质押"按钮。',
        },
        {
          question: '代币锁定有什么好处？',
          answer: '锁定代币可以获得更高的治理权重和额外的奖励，但锁定期间无法解锁。',
        },
        {
          question: '如何领取奖励？',
          answer: '在"奖励"标签页中查看待领取的奖励，点击"领取奖励"按钮即可领取。',
        },
      ],
    },
    {
      id: 'governance',
      title: '治理参与',
      icon: <CheckCircle />,
      questions: [
        {
          question: '如何创建治理提案？',
          answer: '需要创建者权限。在治理提案页面点击"创建提案"，填写提案信息并支付存款费用。',
        },
        {
          question: '提案需要多少存款？',
          answer: '不同类型的提案需要不同的存款金额，通常为100-1000 LUCKEE代币。',
        },
        {
          question: '如何对提案投票？',
          answer: '在治理提案页面选择进行中的提案，点击"投票"按钮选择支持、反对或弃权。',
        },
      ],
    },
  ];

  const quickGuides = [
    {
      title: '快速开始指南',
      description: '新用户入门教程',
      steps: [
        '1. 连接您的钱包',
        '2. 查看代币余额',
        '3. 参与投票或治理',
        '4. 管理您的NFT',
      ],
    },
    {
      title: '投票操作指南',
      description: '详细的投票流程说明',
      steps: [
        '1. 浏览可用投票',
        '2. 选择投票选项',
        '3. 提交投票承诺',
        '4. 在揭示阶段提交原始数据',
      ],
    },
    {
      title: 'NFT使用指南',
      description: 'NFT的获取和使用方法',
      steps: [
        '1. 查看NFT类型',
        '2. 了解NFT属性',
        '3. 参与相关活动',
        '4. 转移或交易NFT',
      ],
    },
  ];

  const filteredFAQ = faqData.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.questions.some(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        帮助中心
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        在这里您可以找到使用Luckee DAO去中心化决策系统的详细指南和常见问题解答
      </Typography>

      {/* 搜索框 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="搜索帮助内容..."
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
        </CardContent>
      </Card>

      {/* 快速指南 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickGuides.map((guide, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {guide.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {guide.description}
                </Typography>
                <List dense>
                  {guide.steps.map((step, stepIndex) => (
                    <ListItem key={stepIndex}>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
                <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                  查看详情
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 常见问题 */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        常见问题
      </Typography>

      {filteredFAQ.map((category) => (
        <Accordion
          key={category.id}
          expanded={expandedAccordion === category.id}
          onChange={handleAccordionChange(category.id)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {category.icon}
              <Typography variant="h6">{category.title}</Typography>
              <Chip label={category.questions.length} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {category.questions.map((item, index) => (
                <Box key={index}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* 联系支持 */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            需要更多帮助？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            如果您在帮助中心找不到答案，可以通过以下方式联系我们：
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<Help />}>
              提交工单
            </Button>
            <Button variant="outlined" startIcon={<QuestionAnswer />}>
              在线客服
            </Button>
            <Button variant="outlined" startIcon={<Book />}>
              查看文档
            </Button>
            <Button variant="outlined" startIcon={<VideoLibrary />}>
              视频教程
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          系统状态
        </Typography>
        <Typography variant="body2">
          所有服务正常运行。最后更新：{new Date().toLocaleString()}
        </Typography>
      </Alert>
    </Box>
  );
};

export default HelpPage;
