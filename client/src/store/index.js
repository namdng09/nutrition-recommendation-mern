import { configureStore } from '@reduxjs/toolkit';

import authReducer from '~/store/features/auth-slice';

export default configureStore({
  reducer: {
    auth: authReducer
  }
});
