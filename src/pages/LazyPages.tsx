import { lazy } from 'react';

// 懒加载页面组件
export const LazyHomePage = lazy(() => import('./HomePage'));
export const LazyVotingPage = lazy(() => import('./VotingPage'));
export const LazyVotingDetailPage = lazy(() => import('./VotingDetailPage'));
export const LazyNFTPage = lazy(() => import('./NFTPage'));
export const LazyNFTDetailPage = lazy(() => import('./NFTDetailPage'));
export const LazyGovernancePage = lazy(() => import('./GovernancePage'));
export const LazyGovernanceProposalPage = lazy(() => import('./GovernanceProposalPage'));
export const LazyTokenPage = lazy(() => import('./TokenPage'));
export const LazySettingsPage = lazy(() => import('./SettingsPage'));
export const LazyHelpPage = lazy(() => import('./HelpPage'));

// 懒加载组件
export const LazyUserProfile = lazy(() => import('../components/UserProfile'));
export const LazyNFTGallery = lazy(() => import('../components/NFTGallery'));
export const LazyNFTTypeManager = lazy(() => import('../components/NFTTypeManager'));
export const LazyVotingCommitment = lazy(() => import('../components/VotingCommitment'));
