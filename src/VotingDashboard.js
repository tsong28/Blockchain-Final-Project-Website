import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import contractABI from './contractABI.json';
import styles from './VotingDashboard.module.css';

const CONTRACT_ADDRESS = '0x311CA98ca34873a243d5e18Bd2B6e8E3399cD8dA';

const VotingDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        if (!window.ethereum) {
          setError('MetaMask is not installed');
          return;
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

        const candidatesData = await contract.getCandidates();
        const formattedCandidates = candidatesData.map((candidate) => ({
          name: candidate.name,
          voteCount: candidate.voteCount.toString(),
        }));
        setCandidates(formattedCandidates);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch candidates');
      }
    };

    loadCandidates();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🗳️ Voting Dashboard</h1>
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.list}>
        {candidates.map((candidate, index) => (
          <li key={index} className={styles.listItem}>
            <strong>{candidate.name}</strong>
            <span>{candidate.voteCount} votes</span>
          </li>
        ))}
      </ul>
      <footer className={styles.footer}>
        Secure & Transparent Voting | Tyler Song and Dan Zhang CS 3943
      </footer>
    </div>
  );
};

export default VotingDashboard;
