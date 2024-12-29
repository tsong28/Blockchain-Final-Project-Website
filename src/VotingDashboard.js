import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractABI from './contractABI.json';
import styles from './VotingDashboard.module.css';

const CONTRACT_ADDRESS = '0x311CA98ca34873a243d5e18Bd2B6e8E3399cD8dA';

const VotingDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState('');

  // Load Candidates and Connect Wallet
  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();
      setAccount(userAccount);

      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      const candidatesData = await contract.getCandidates();
      const formattedCandidates = candidatesData.map((candidate, index) => ({
        id: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
      }));
      setCandidates(formattedCandidates);
    } catch (err) {
      console.error('Error:', err.message || err);
      setError('Failed to interact with contract');
    }
  };

  // Submit Vote
  const submitVote = async () => {
    if (selectedCandidate === null) {
      setError('Please select a candidate before voting.');
      return;
    }

    try {
      setIsVoting(true);
      setError('');
      setVoteSuccess('');

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      const tx = await contract.vote(selectedCandidate);
      await tx.wait();

      setVoteSuccess(`Successfully voted for candidate ID: ${selectedCandidate}`);
      setSelectedCandidate(null);
      loadBlockchainData(); // Refresh candidate data
    } catch (err) {
      console.error('Voting Error:', err.message || err);
      setError('Failed to submit vote. Make sure you have not already voted.');
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🗳️ Voting Dashboard</h1>
      {error && <p className={styles.error}>{error}</p>}
      {voteSuccess && <p className={styles.success}>{voteSuccess}</p>}

      <h3>Connected Account: {account || 'Not connected'}</h3>
      <ul className={styles.list}>
        {candidates.map((candidate) => (
          <li
            key={candidate.id}
            className={`${styles.listItem} ${
              selectedCandidate === candidate.id ? styles.selected : ''
            }`}
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <strong>{candidate.name}</strong>
            <span>{candidate.voteCount} votes</span>
          </li>
        ))}
      </ul>

      <button
        className={styles.voteButton}
        onClick={submitVote}
        disabled={isVoting || selectedCandidate === null}
      >
        {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
      </button>
      <footer className={styles.footer}>
        Secure & Transparent Voting Deployed on Sepolia Testnet | Tyler Song and Dan Zhang CS 3943
      </footer>
    </div>
  );
};

export default VotingDashboard;
