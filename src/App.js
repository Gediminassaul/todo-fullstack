import React, { useState, useEffect } from 'react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator, View } from '@aws-amplify/ui-react';
import Board from "./components/board";
import { getCurrentUser } from '@aws-amplify/auth';
import { fetchCards } from './services/api';
import './App.css';

function Header({ signOut }) {
  const [userDetails, setUserDetails] = useState({});
  async function getSessionDetails() {
    try {
      const sessionData = await getCurrentUser();
      setUserDetails({ username: sessionData?.username });
    } catch (error) {
      console.error('Error getting session details', error);
    }
  }
  useEffect(() => {
    getSessionDetails();
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
      {userDetails.username && (
        <div style={{ marginRight: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
          {userDetails.username}
        </div>
      )}
      <button onClick={signOut} className="Btn" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="text" style={{ fontSize: '1rem', fontWeight: 'bold', color:'#FF6347' }}>Sign Out</div>
      </button>
    </div>
  );
}



function App({ signOut }) {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState('');
  async function fetchUserId() {
    try {
      const sessionData = await getCurrentUser();
      setUserId( sessionData?.userId);
    } catch (error) {
      console.error('Error getting session details', error);
    }
  }
  const fetchAndSetCards = async () => {
    try {
      const data = await fetchCards();
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching and setting cards', error);
    }
  };
  useEffect(() => {
    fetchAndSetCards();
    fetchUserId();
  }, []);
  return (
    <View className="App">
      <Header signOut={signOut} userId={userId}/>
      <Board cards={cards} setCards={setCards}/>
    </View>
  );
}

export default withAuthenticator(App);
