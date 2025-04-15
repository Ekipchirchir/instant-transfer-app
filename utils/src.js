import { getAuthToken } from './auth'; // Import token function

// Fetch user details (username, Deriv account)
export const fetchUserDetails = async () => {
  const token = await getAuthToken();
  if (!token) {
    console.log('No token found, user needs to log in.');
    return null;
  }

  try {
    const response = await fetch('https://api.deriv.com/v2/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.error) {
      console.error('Error fetching user details:', data.error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
};

// Fetch user balance
export const fetchUserBalance = async () => {
  const token = await getAuthToken();
  if (!token) {
    console.log('No token found, user needs to log in.');
    return null;
  }

  try {
    const response = await fetch('https://api.deriv.com/v2/account', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.error) {
      console.error('Error fetching balance:', data.error);
      return null;
    }
    return data.balance;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
};
