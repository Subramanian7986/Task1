import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: "👋 Hello! I'm your AI assistant. Describe your HCP interaction in natural language and I'll log it for you. You can also ask me to edit details, check history, schedule follow-ups, or run a compliance check.",
      },
    ],
    loading: false,
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push({ id: Date.now(), ...action.payload });
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { addMessage, setLoading } = chatSlice.actions;
export default chatSlice.reducer;
