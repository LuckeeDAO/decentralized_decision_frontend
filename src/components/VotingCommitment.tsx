import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
} from '@mui/material';
import { HowToVote, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useVoting } from '../hooks/useVoting';
import Input from './Input';
import Button from './Button';

interface VotingCommitmentProps {
  sessionId: string;
  onComplete?: () => void;
}

const VotingCommitment: React.FC<VotingCommitmentProps> = ({ sessionId, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [voteOption, setVoteOption] = useState('');
  const [commitment, setCommitment] = useState('');
  const [revealData, setRevealData] = useState('');
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const { currentSession, userVotes, submitVote, revealVote } = useVoting();
  const wallet = useSelector((state: RootState) => state.wallet);

  const steps = [
    '选择投票选项',
    '生成承诺',
    '提交承诺',
    '揭示投票',
  ];

  const voteOptions = [
    { value: 'yes', label: '赞成', description: '支持该提案' },
    { value: 'no', label: '反对', description: '反对该提案' },
    { value: 'abstain', label: '弃权', description: '不参与投票' },
  ];

  const generateCommitment = async (voteData: any): Promise<string> => {
    // 在实际应用中，这里应该使用加密算法生成承诺
    const data = JSON.stringify({
      option: voteData.option,
      nonce: Math.random().toString(36).substring(2),
      timestamp: Date.now(),
    });
    return btoa(data);
  };

  const handleVoteOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteOption(event.target.value);
  };

  const handleGenerateCommitment = async () => {
    if (!voteOption) return;

    try {
      const voteData = { option: voteOption };
      const generatedCommitment = await generateCommitment(voteData);
      setCommitment(generatedCommitment);
      setRevealData(JSON.stringify(voteData));
      setActiveStep(2);
    } catch (error) {
      console.error('生成承诺失败:', error);
    }
  };

  const handleSubmitCommitment = async () => {
    if (!commitment) return;

    try {
      await submitVote(sessionId, { commitment });
      setIsCommitted(true);
      setActiveStep(3);
    } catch (error) {
      console.error('提交承诺失败:', error);
    }
  };

  const handleRevealVote = async () => {
    if (!revealData) return;

    try {
      const voteData = JSON.parse(revealData);
      await revealVote(sessionId, voteData);
      setIsRevealed(true);
      onComplete?.();
    } catch (error) {
      console.error('揭示投票失败:', error);
    }
  };

  const getVoteOptionLabel = (value: string) => {
    const option = voteOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getVoteOptionDescription = (value: string) => {
    const option = voteOptions.find(opt => opt.value === value);
    return option ? option.description : '';
  };

  if (!currentSession) {
    return (
      <Alert severity="error">
        投票会话不存在或已结束
      </Alert>
    );
  }

  const now = Date.now();
  const isVotingPhase = now < currentSession.revealTime;
  const isRevealPhase = now >= currentSession.revealTime && now < currentSession.endTime;
  const isEnded = now >= currentSession.endTime;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HowToVote sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">投票承诺与揭示</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {currentSession.title}
        </Typography>

        {/* 投票阶段状态 */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={isVotingPhase ? '投票阶段' : isRevealPhase ? '揭示阶段' : '已结束'}
            color={isVotingPhase ? 'primary' : isRevealPhase ? 'warning' : 'default'}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {isVotingPhase && '当前可以提交投票承诺'}
            {isRevealPhase && '当前可以揭示投票'}
            {isEnded && '投票已结束'}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>选择投票选项</StepLabel>
            <StepContent>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">请选择您的投票选项</FormLabel>
                <RadioGroup
                  value={voteOption}
                  onChange={handleVoteOptionChange}
                >
                  {voteOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">{option.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <Button
                variant="primary"
                onClick={handleGenerateCommitment}
                disabled={!voteOption}
              >
                生成承诺
              </Button>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>生成承诺</StepLabel>
            <StepContent>
              {commitment && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    承诺已生成，请妥善保存揭示数据
                  </Alert>
                  <TextField
                    fullWidth
                    label="承诺哈希"
                    value={commitment}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="揭示数据（请妥善保存）"
                    value={revealData}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={3}
                  />
                </Box>
              )}
              <Button
                variant="primary"
                onClick={handleSubmitCommitment}
                disabled={!commitment}
              >
                提交承诺
              </Button>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>提交承诺</StepLabel>
            <StepContent>
              {isCommitted ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  承诺已成功提交
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  承诺尚未提交
                </Alert>
              )}
              <Button
                variant="primary"
                onClick={handleSubmitCommitment}
                disabled={isCommitted || !commitment}
              >
                {isCommitted ? '承诺已提交' : '提交承诺'}
              </Button>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>揭示投票</StepLabel>
            <StepContent>
              {isRevealed ? (
                <Alert severity="success">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    投票已成功揭示
                  </Box>
                </Alert>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    在揭示阶段，您可以使用保存的揭示数据来揭示您的投票
                  </Alert>
                  <Button
                    variant="primary"
                    onClick={handleRevealVote}
                    disabled={!isCommitted || !revealData || !isRevealPhase}
                  >
                    揭示投票
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>

        <Divider sx={{ my: 3 }} />

        {/* 投票信息摘要 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            投票信息摘要
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              选择选项: {voteOption ? getVoteOptionLabel(voteOption) : '未选择'}
            </Typography>
            <Typography variant="body2">
              承诺状态: {isCommitted ? '已提交' : '未提交'}
            </Typography>
            <Typography variant="body2">
              揭示状态: {isRevealed ? '已揭示' : '未揭示'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VotingCommitment;
