'use client';

import { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

// Your C Protocol Program ID
const C_PROTOCOL_PROGRAM_ID = new PublicKey('CProtoco1WorkChain11111111111111111111111');
const C_TOKEN_MINT = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');

interface WorkSubmission {
  id: string;
  workType: string;
  description: string;
  proof: string;
  effortWeight: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  estimatedReward: number;
}

export default function WorkToEarnPlatform() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'history'>('dashboard');
  const [workType, setWorkType] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workProof, setWorkProof] = useState('');
  const [effortWeight, setEffortWeight] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    completedTasks: 0,
    pendingRewards: 0,
    diversityScore: 0
  });
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);

  // Work types from your smart contract
  const workTypes = [
    { key: 'onboard_user', label: 'Onboard User', baseReward: 0.0005 },
    { key: 'create_content', label: 'Create Content', baseReward: 0.001 },
    { key: 'write_code', label: 'Write Code', baseReward: 0.002 },
    { key: 'refer_client', label: 'Refer Client', baseReward: 0.005 },
    { key: 'close_deal', label: 'Close Deal', baseReward: 0.01 },
    { key: 'community_management', label: 'Community Management', baseReward: 0.00075 },
    { key: 'bug_report', label: 'Bug Report', baseReward: 0.0015 },
    { key: 'documentation', label: 'Documentation', baseReward: 0.0008 },
    { key: 'marketing', label: 'Marketing', baseReward: 0.0012 },
    { key: 'user_support', label: 'User Support', baseReward: 0.0006 }
  ];

  const calculateReward = (workTypeKey: string, effort: number) => {
    const workTypeData = workTypes.find(wt => wt.key === workTypeKey);
    if (!workTypeData) return 0;
    return workTypeData.baseReward * (effort / 100);
  };

  const submitWork = useCallback(async () => {
    if (!publicKey || !wallet || !workType || !workDescription || !workProof) {
      toast.error('Please fill in all fields and connect your wallet');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // For now, we'll store submissions locally
      // Later we'll integrate with your C Protocol smart contract
      const newSubmission: WorkSubmission = {
        id: Date.now().toString(),
        workType,
        description: workDescription,
        proof: workProof,
        effortWeight,
        status: 'pending',
        submittedAt: new Date(),
        estimatedReward: calculateReward(workType, effortWeight)
      };

      // Add to submissions (in a real app, this would be stored on-chain or in a database)
      setSubmissions(prev => [newSubmission, ...prev]);
      
      // Clear form
      setWorkType('');
      setWorkDescription('');
      setWorkProof('');
      setEffortWeight(100);
      
      toast.success('Work submitted successfully! Pending verification.');
      
      // Switch to history tab to show the submission
      setActiveTab('history');
      
    } catch (error) {
      console.error('Work submission failed:', error);
      toast.error('Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  }, [publicKey, wallet, workType, workDescription, workProof, effortWeight]);

  // Load user data (mock for now)
  useEffect(() => {
    if (publicKey) {
      // Mock user stats - in a real app, fetch from blockchain
      setUserStats({
        totalEarned: 15.432,
        completedTasks: 23,
        pendingRewards: 2.156,
        diversityScore: 750
      });
    }
  }, [publicKey]);

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Your Work-to-Earn Dashboard</h2>
        <p className="text-xl opacity-80">Earn C tokens by contributing valuable work</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-400">{userStats.totalEarned.toFixed(3)}</div>
          <div className="text-sm opacity-80">C Tokens Earned</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-400">{userStats.completedTasks}</div>
          <div className="text-sm opacity-80">Tasks Completed</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-yellow-400">{userStats.pendingRewards.toFixed(3)}</div>
          <div className="text-sm opacity-80">Pending Rewards</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold text-purple-400">{userStats.diversityScore}</div>
          <div className="text-sm opacity-80">Diversity Score</div>
        </div>
      </div>

      {/* Available Work Types */}
      <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-4">Available Work Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workTypes.map((wt) => (
            <div key={wt.key} className="bg-white/5 rounded-lg p-4">
              <div className="font-semibold">{wt.label}</div>
              <div className="text-sm opacity-80">Base reward: {wt.baseReward} C tokens</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SubmitTab = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Submit Your Work</h2>
        <p className="text-xl opacity-80">Get rewarded for your contributions</p>
      </div>

      <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm space-y-6">
        {/* Work Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Work Type</label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 rounded-lg text-white"
          >
            <option value="">Select work type...</option>
            {workTypes.map((wt) => (
              <option key={wt.key} value={wt.key} className="bg-gray-800">
                {wt.label} ({wt.baseReward} C tokens)
              </option>
            ))}
          </select>
        </div>

        {/* Work Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Work Description</label>
          <textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 rounded-lg text-white placeholder-white/50 h-24"
            placeholder="Describe the work you completed..."
          />
        </div>

        {/* Proof of Work */}
        <div>
          <label className="block text-sm font-medium mb-2">Proof of Work</label>
          <input
            type="text"
            value={workProof}
            onChange={(e) => setWorkProof(e.target.value)}
            className="w-full px-3 py-2 bg-white/20 rounded-lg text-white placeholder-white/50"
            placeholder="GitHub link, portfolio URL, screenshot link, etc."
          />
          <div className="text-xs opacity-60 mt-1">
            Provide verifiable proof (GitHub commits, live demos, certificates, etc.)
          </div>
        </div>

        {/* Effort Weight */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Effort Weight: {effortWeight}%
          </label>
          <input
            type="range"
            min="50"
            max="200"
            value={effortWeight}
            onChange={(e) => setEffortWeight(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-60 mt-1">
            Adjust based on effort and quality (50% = minimal, 100% = standard, 200% = exceptional)
          </div>
        </div>

        {/* Estimated Reward */}
        {workType && (
          <div className="bg-green-500/20 rounded-lg p-4">
            <div className="font-semibold text-green-400">
              Estimated Reward: {calculateReward(workType, effortWeight).toFixed(6)} C tokens
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitWork}
          disabled={isSubmitting || !workType || !workDescription || !workProof}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            isSubmitting || !workType || !workDescription || !workProof
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {isSubmitting ? 'Submitting Work...' : 'Submit Work for Review'}
        </button>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Work History</h2>
        <p className="text-xl opacity-80">Track your submissions and rewards</p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          <div className="text-6xl mb-4">📝</div>
          <p>No work submissions yet. Start earning by submitting your first task!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {workTypes.find(wt => wt.key === submission.workType)?.label || submission.workType}
                  </h3>
                  <p className="opacity-80">{submission.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {submission.status.toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="opacity-60">Submitted</div>
                  <div>{submission.submittedAt.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="opacity-60">Effort</div>
                  <div>{submission.effortWeight}%</div>
                </div>
                <div>
                  <div className="opacity-60">Reward</div>
                  <div>{submission.estimatedReward.toFixed(6)} C</div>
                </div>
                <div>
                  <div className="opacity-60">Proof</div>
                  <a 
                    href={submission.proof} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline truncate block"
                  >
                    View Proof
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🚀 C Protocol Work-to-Earn</h1>
          <p className="text-xl opacity-80">Proof of Participation > Proof of Work</p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletMultiButton />
        </div>

        {publicKey ? (
          <>
            {/* Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'submit'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Submit Work
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'history'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  History ({submissions.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'submit' && <SubmitTab />}
              {activeTab === 'history' && <HistoryTab />}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-xl opacity-80 mb-8">
              Start earning C tokens by contributing valuable work to the ecosystem
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm opacity-70">
          <p>C Protocol • Proof of Participation • Token: {C_TOKEN_MINT.toString().slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
}