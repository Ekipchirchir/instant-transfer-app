
export const deposit = async (amount) => {
  try {
    const response = await api.post("/deposit/", { amount });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || "Deposit failed");
  }
};

export const withdraw = async (amount) => {
  try {
    const response = await api.post("/withdraw/", { amount });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || "Withdrawal failed");
  }
}


export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/token/", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register/", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data);
    throw error;
  }
};
