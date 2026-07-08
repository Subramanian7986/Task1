import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hcpName: '',
  interactionType: '',
  date: '',
  time: '',
  attendees: '',
  topicsDiscussed: '',
  materialsShared: '',
  samplesDistributed: '',
  sentiment: '',
  outcomes: '',
  followUps: [],
};

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFields(state, action) {
      const map = {
        hcp_name: 'hcpName',
        interaction_type: 'interactionType',
        date: 'date',
        time: 'time',
        attendees: 'attendees',
        topics_discussed: 'topicsDiscussed',
        materials_shared: 'materialsShared',
        samples_distributed: 'samplesDistributed',
        sentiment: 'sentiment',
        outcomes: 'outcomes',
        followUps: 'followUps',
      };
      const fields = action.payload;
      Object.entries(fields).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        const stateKey = map[key] || key;
        if (stateKey === 'followUps' && Array.isArray(value)) {
          state.followUps = [...state.followUps, ...value];
        } else if (stateKey in state) {
          state[stateKey] = value;
        }
      });
    },
    resetForm() {
      return initialState;
    },
  },
});

export const { updateFields, resetForm } = interactionSlice.actions;
export default interactionSlice.reducer;
